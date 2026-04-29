// API route to fetch pinned repositories from a GitHub profile.
// GitHub's REST API doesn't expose pinned repos, so we scrape the profile page.

let cache = null;
let cacheTime = 0;
const CACHE_DURATION = 10 * 60 * 1000;

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

function parseCompactCount(value = "") {
    const clean = textFromHtml(value).replace(/,/g, "").trim().toLowerCase();
    const match = clean.match(/^([\d.]+)\s*([km])?$/);
    if (!match) return 0;

    const number = Number(match[1]);
    if (!Number.isFinite(number)) return 0;
    if (match[2] === "m") return Math.round(number * 1_000_000);
    if (match[2] === "k") return Math.round(number * 1_000);
    return Math.round(number);
}

function parsePinnedReposFromHtml(html, username) {
    const section = html.match(
        /<div[^>]*class="[^"]*js-pinned-items-reorder-container[^"]*"[\s\S]*?<\/ol>\s*<\/div>/i
    )?.[0];

    if (!section) return [];

    const items = section.match(
        /<li\b[^>]*class="[^"]*pinned-item-list-item[^"]*"[\s\S]*?<\/li>/gi
    ) || [];
    const repos = [];
    const seen = new Set();

    for (const item of items) {
        const link = item.match(
            /<a\b[^>]*\bhref="\/([^/"?#]+)\/([^/"?#]+)"[^>]*>[\s\S]*?<span[^>]*class="[^"]*\brepo\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i
        );
        if (!link) continue;

        const owner = decodeURIComponent(link[1]);
        if (owner.toLowerCase() !== username.toLowerCase()) continue;

        const name = textFromHtml(link[3]) || decodeURIComponent(link[2]);
        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        const description = textFromHtml(
            item.match(
                /<p\b[^>]*class="[^"]*pinned-item-desc[^"]*"[^>]*>([\s\S]*?)<\/p>/i
            )?.[1] || ""
        );
        const language = textFromHtml(
            item.match(
                /<span\b[^>]*itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/i
            )?.[1] || ""
        );
        const id = item.match(
            /<a\b[^>]*\bid="(\d+)"[^>]*\bhref="\/[^"]+\/[^"]+"/i
        )?.[1];
        const stars = parseCompactCount(
            item.match(
                new RegExp(
                    `href="/${escapeRegExp(owner)}/${escapeRegExp(name)}/stargazers"[\\s\\S]*?<\\/svg>\\s*([^<]+)`,
                    "i"
                )
            )?.[1] || ""
        );
        const forks = parseCompactCount(
            item.match(
                new RegExp(
                    `href="/${escapeRegExp(owner)}/${escapeRegExp(name)}/forks"[\\s\\S]*?<\\/svg>\\s*([^<]+)`,
                    "i"
                )
            )?.[1] || ""
        );

        repos.push({
            id: id ? Number(id) : `${owner}/${name}`,
            name,
            full_name: `${owner}/${name}`,
            html_url: `https://github.com/${owner}/${name}`,
            description,
            language: language || null,
            stargazers_count: stars,
            forks_count: forks,
            fork: false,
            owner: { login: owner },
            license: null,
        });
    }

    return repos;
}

async function fetchRepoDetails(username, repoName) {
    const headers = {
        "User-Agent": "portfolio-app",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    };

    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    try {
        const response = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}`,
            { headers }
        );
        return response.ok ? response.json() : null;
    } catch {
        return null;
    }
}

function mergeRepoDetails(htmlRepo, apiRepo) {
    if (!apiRepo) return htmlRepo;

    return {
        ...apiRepo,
        id: apiRepo.id ?? htmlRepo.id,
        name: apiRepo.name || htmlRepo.name,
        full_name: apiRepo.full_name || htmlRepo.full_name,
        html_url: apiRepo.html_url || htmlRepo.html_url,
        description: apiRepo.description || htmlRepo.description,
        language: apiRepo.language || htmlRepo.language,
        stargazers_count:
            apiRepo.stargazers_count ?? htmlRepo.stargazers_count ?? 0,
        forks_count: apiRepo.forks_count ?? htmlRepo.forks_count ?? 0,
        license: apiRepo.license ?? htmlRepo.license,
    };
}

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const username = (process.env.GITHUB_USERNAME || "").trim();
    if (!username) {
        return res.status(500).json({
            error:
                "GITHUB_USERNAME is not set. Add it to .env.local and restart dev.",
        });
    }

    try {
        const now = Date.now();
        if (cache && now - cacheTime < CACHE_DURATION) {
            return res.status(200).json({ repos: cache });
        }

        const response = await fetch(`https://github.com/${username}`, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
                Accept: "text/html",
            },
        });

        if (!response.ok) {
            throw new Error(
                `GitHub responded ${response.status} for /${username}`
            );
        }

        const html = await response.text();
        const pinnedRepos = parsePinnedReposFromHtml(html, username);

        // If we still have nothing, fall back to the user's most-starred public repos.
        if (pinnedRepos.length === 0) {
            const reposRes = await fetch(
                `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&type=owner`,
                {
                    headers: {
                        "User-Agent": "portfolio-app",
                        Accept: "application/vnd.github.v3+json",
                    },
                }
            );
            if (reposRes.ok) {
                const all = await reposRes.json();
                const top = all
                    .filter((r) => !r.fork)
                    .sort(
                        (a, b) =>
                            (b.stargazers_count || 0) - (a.stargazers_count || 0)
                    )
                    .slice(0, 6);

                cache = top;
                cacheTime = now;
                res.setHeader(
                    "Cache-Control",
                    "public, s-maxage=600, stale-while-revalidate=1200"
                );
                return res.status(200).json({ repos: top, fallback: true });
            }
        }

        const repoDetails = await Promise.all(
            pinnedRepos
                .slice(0, 6)
                .map((repo) => fetchRepoDetails(repo.owner.login, repo.name))
        );
        const repos = pinnedRepos
            .slice(0, 6)
            .map((repo, index) => mergeRepoDetails(repo, repoDetails[index]));

        cache = repos;
        cacheTime = now;

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=600, stale-while-revalidate=1200"
        );

        return res.status(200).json({ repos });
    } catch (error) {
        console.error("Error fetching pinned repos:", error);
        if (cache) return res.status(200).json({ repos: cache });
        return res.status(500).json({
            error: "Failed to fetch pinned repos",
            detail: String(error),
        });
    }
}
