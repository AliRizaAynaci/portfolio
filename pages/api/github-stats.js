const CACHE_DURATION = 10 * 60 * 1000;
const MAX_REPO_PAGES = 5;

let cache = null;
let cacheTime = 0;
let lastGoodStats = null;

const languageColors = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Go: "#00ADD8",
    Java: "#b07219",
    Python: "#3572A5",
    "C++": "#f34b7d",
    C: "#555555",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Vue: "#41b883",
    Shell: "#89e051",
    Dockerfile: "#384d54",
    "Jupyter Notebook": "#DA5B0B",
};

function decodeHtml(value = "") {
    const named = {
        amp: "&",
        lt: "<",
        gt: ">",
        quot: '"',
        apos: "'",
        nbsp: " ",
    };

    return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code) => {
        if (code[0] === "#") {
            const isHex = code[1]?.toLowerCase() === "x";
            const parsed = parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);
            return Number.isFinite(parsed) ? String.fromCharCode(parsed) : entity;
        }

        return named[code.toLowerCase()] || entity;
    });
}

function textFromHtml(html = "") {
    return decodeHtml(
        html
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
    );
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseCompactCount(value = "") {
    const clean = textFromHtml(String(value)).replace(/,/g, "").trim().toLowerCase();
    const match = clean.match(/^([\d.]+)\s*([km])?$/);
    if (!match) return null;

    const number = Number(match[1]);
    if (!Number.isFinite(number)) return null;
    if (match[2] === "m") return Math.round(number * 1_000_000);
    if (match[2] === "k") return Math.round(number * 1_000);
    return Math.round(number);
}

function normalizeNumber(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function hasUsableStats(stats) {
    return ["followers", "following", "publicRepos", "totalStars"].some(
        (key) => typeof stats?.[key] === "number" && stats[key] > 0
    );
}

function getApiHeaders() {
    const headers = {
        "User-Agent": "portfolio-app",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    };

    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    return headers;
}

function getHtmlHeaders() {
    return {
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "text/html",
    };
}

async function fetchJson(url) {
    const response = await fetch(url, { headers: getApiHeaders() });
    if (!response.ok) {
        throw new Error(`GitHub API request failed: ${response.status} ${url}`);
    }

    return response.json();
}

async function fetchHtml(url) {
    const response = await fetch(url, { headers: getHtmlHeaders() });
    if (!response.ok) return "";
    return response.text();
}

async function fetchAllRepos(username) {
    const repos = [];

    for (let page = 1; page <= MAX_REPO_PAGES; page += 1) {
        const pageRepos = await fetchJson(
            `https://api.github.com/users/${encodeURIComponent(
                username
            )}/repos?per_page=100&type=owner&sort=updated&page=${page}`
        );

        if (!Array.isArray(pageRepos)) break;
        repos.push(...pageRepos);
        if (pageRepos.length < 100) break;
    }

    return repos;
}

function buildTopLanguages(repos) {
    const langCounts = {};
    let totalReposWithLang = 0;

    repos.forEach((repo) => {
        if (!repo.language) return;
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
        totalReposWithLang += 1;
    });

    if (!totalReposWithLang) return [];

    return Object.entries(langCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({
            name,
            count,
            percentage: ((count / totalReposWithLang) * 100).toFixed(1),
            color: languageColors[name] || "#ccc",
        }));
}

function buildStats(username, user, repos, source) {
    const starValues = repos
        .map((repo) => normalizeNumber(repo.stargazers_count))
        .filter((value) => value !== null);

    return {
        username: user.login || username,
        name: user.name || user.login || username,
        avatar: user.avatar_url || null,
        bio: user.bio || "",
        followers: normalizeNumber(user.followers),
        following: normalizeNumber(user.following),
        publicRepos: normalizeNumber(user.public_repos),
        totalStars:
            starValues.length > 0
                ? starValues.reduce((total, value) => total + value, 0)
                : null,
        topLanguages: buildTopLanguages(repos),
        htmlUrl: user.html_url || `https://github.com/${username}`,
        source,
        fetchedAt: new Date().toISOString(),
    };
}

async function fetchStatsFromApi(username) {
    const encodedUsername = encodeURIComponent(username);
    const [user, repos] = await Promise.all([
        fetchJson(`https://api.github.com/users/${encodedUsername}`),
        fetchAllRepos(username),
    ]);

    return buildStats(username, user, repos, "github-api");
}

function parseProfileTabCount(html, username, tab) {
    const safeUsername = escapeRegExp(username);
    const block = html.match(
        new RegExp(
            `<a\\b[^>]*href="(?:https://github\\.com)?/${safeUsername}\\?tab=${tab}"[\\s\\S]*?<\\/a>`,
            "i"
        )
    )?.[0];

    if (!block) return null;

    const boldCount = block.match(
        /<span\b[^>]*class="[^"]*text-bold[^"]*"[^>]*>([\s\S]*?)<\/span>/i
    )?.[1];

    return parseCompactCount(boldCount || block);
}

function parseProfileCounter(html, tab) {
    const block = html.match(
        new RegExp(
            `<a\\b[^>]*data-tab-item="${tab}"[\\s\\S]*?<\\/a>`,
            "i"
        )
    )?.[0];

    if (!block) return null;

    const counterTitle = block.match(
        /<span\b[^>]*title="([^"]+)"[^>]*class="[^"]*Counter[^"]*"/i
    );

    return parseCompactCount(counterTitle?.[1] || block);
}

function parseProfileUser(html, username) {
    const avatarMatch = html.match(
        /<meta\b[^>]*property="og:image"[^>]*content="([^"]+)"/i
    );
    const bioMatch =
        html.match(/data-bio-text="([^"]*)"/i) ||
        html.match(
            /<meta\b[^>]*property="og:description"[^>]*content="([^"]+)"/i
        );
    const nameMatch = html.match(
        /<span\b[^>]*class="[^"]*p-name[^"]*"[^>]*>([\s\S]*?)<\/span>/i
    );

    const avatar = decodeHtml(avatarMatch?.[1] || "").replace(/\?s=\d+$/, "");
    const bio = decodeHtml(
        bioMatch?.[1] || ""
    ).replace(/\s+-\s+[^-]+$/, "");
    const name = textFromHtml(nameMatch?.[1] || "") || username;

    return {
        login: username,
        name,
        avatar_url: avatar || null,
        bio,
        followers: parseProfileTabCount(html, username, "followers"),
        following: parseProfileTabCount(html, username, "following"),
        public_repos: parseProfileCounter(html, "repositories"),
        html_url: `https://github.com/${username}`,
    };
}

function parseReposFromHtml(username, html) {
    const safeUsername = escapeRegExp(username);
    const items =
        html.match(
            /<li\b[^>]*itemprop="owns"[^>]*itemscope[^>]*itemtype="http:\/\/schema.org\/Code"[\s\S]*?<\/li>/gi
        ) || [];

    return items.map((item) => {
        const name = textFromHtml(
            item.match(
                /<a\b[^>]*itemprop="name codeRepository"[^>]*>([\s\S]*?)<\/a>/i
            )?.[1] || ""
        );
        const safeName = escapeRegExp(name);
        const starMatch = item.match(
            new RegExp(
                `href="/${safeUsername}/${safeName}/stargazers"[\\s\\S]*?<\\/svg>\\s*([^<]+)`,
                "i"
            )
        );

        return {
            name,
            language:
                textFromHtml(
                    item.match(
                        /<span\b[^>]*itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/i
                    )?.[1] || ""
                ) || null,
            stargazers_count: parseCompactCount(starMatch?.[1] || "0") || 0,
        };
    });
}

function getNextReposPageUrl(html) {
    const nextHref =
        html.match(/<a\b[^>]*rel="next"[^>]*href="([^"]+)"/i)?.[1] ||
        html.match(/<a\b[^>]*href="([^"]+)"[^>]*rel="next"/i)?.[1];

    if (!nextHref) return "";

    return new URL(decodeHtml(nextHref), "https://github.com").toString();
}

async function fetchRepositoryPages(username) {
    const pages = [];
    let url = `https://github.com/${encodeURIComponent(username)}?tab=repositories`;

    for (let page = 1; page <= MAX_REPO_PAGES && url; page += 1) {
        const html = await fetchHtml(url);
        if (!html) break;

        pages.push(html);
        url = getNextReposPageUrl(html);
    }

    return pages;
}

async function fetchStatsFromHtml(username) {
    const [profileHtml, repositoryPages] = await Promise.all([
        fetchHtml(`https://github.com/${encodeURIComponent(username)}`),
        fetchRepositoryPages(username),
    ]);

    if (!profileHtml) {
        throw new Error("GitHub profile HTML fallback failed");
    }

    const user = parseProfileUser(profileHtml, username);
    const repos = repositoryPages.flatMap((html) => parseReposFromHtml(username, html));

    return buildStats(username, user, repos, "github-html");
}

function rememberStats(stats) {
    if (!hasUsableStats(stats)) return;

    cache = stats;
    cacheTime = Date.now();
    lastGoodStats = stats;
}

function emptyStats(username) {
    return {
        username,
        name: username,
        avatar: null,
        bio: "",
        followers: null,
        following: null,
        publicRepos: null,
        totalStars: null,
        topLanguages: [],
        htmlUrl: `https://github.com/${username}`,
        source: "empty-fallback",
        stale: true,
        fetchedAt: null,
    };
}

export default async function handler(req, res) {
    const { username, fresh } = req.query;

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    const normalizedUsername = Array.isArray(username) ? username[0] : username;
    const now = Date.now();

    if (fresh !== "1" && cache && now - cacheTime < CACHE_DURATION) {
        res.setHeader(
            "Cache-Control",
            "public, s-maxage=600, stale-while-revalidate=1200"
        );
        return res.status(200).json(cache);
    }

    try {
        const stats = await fetchStatsFromApi(normalizedUsername);
        rememberStats(stats);

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=600, stale-while-revalidate=1200"
        );
        return res.status(200).json(stats);
    } catch (apiError) {
        console.error("Error fetching GitHub stats via API:", apiError);
    }

    try {
        const stats = await fetchStatsFromHtml(normalizedUsername);
        rememberStats(stats);

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=600, stale-while-revalidate=1200"
        );
        return res.status(200).json(stats);
    } catch (htmlError) {
        console.error("Error fetching GitHub stats via HTML fallback:", htmlError);
    }

    if (lastGoodStats) {
        return res.status(200).json({
            ...lastGoodStats,
            stale: true,
            source: "server-cache",
        });
    }

    return res.status(200).json(emptyStats(normalizedUsername));
}
