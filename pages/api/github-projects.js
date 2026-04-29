const OWNER = "AliRizaAynaci";

const CURATED_PROJECTS = [
    {
        id: "gorl",
        title: "gorl",
        category: "Open Source",
        description:
            "A production-minded Go rate limiting library with in-memory and Redis backends.",
        stack: ["Go", "Redis", "Rate Limiting", "Middleware"],
        repos: ["gorl"],
    },
    {
        id: "rlaas",
        title: "RLaaS",
        category: "SaaS / Backend",
        description:
            "A rate-limiting service with a Go API, Redis/PostgreSQL storage, and a Next.js dashboard.",
        stack: ["Go", "Redis", "PostgreSQL", "Next.js", "OAuth2"],
        repos: ["rlaas", "rlaas-frontend"],
    },
    {
        id: "liftio-backend",
        title: "Liftio Backend",
        category: "Product Demo / Go Backend",
        description:
            "A public demo of the real Liftio backend, demonstrating architecture and coding style while the complete product implementation stays private.",
        stack: ["Go", "Docker", "REST API", "Backend Architecture"],
        repos: ["liftio-backend"],
    },
    {
        id: "clean-breathing",
        title: "NASA Space Apps Challenge",
        category: "Hackathon / AI + Backend",
        achievement: "Local 2nd Place · Global Nominee",
        description:
            "A multi-repo clean-air project combining backend, frontend, and ML components for NASA Space Apps.",
        stack: ["AI", "Backend", "Frontend", "Machine Learning"],
        repos: ["clean-breathing", "clean-breathing-front", "clean-breathing-ml"],
    },
    {
        id: "tua-hackathon",
        title: "TUA Hackathon",
        category: "Hackathon / Optimization",
        achievement: "Local 4th Place",
        description:
            "An optimization-focused hackathon project built for the Turkish Space Agency competition.",
        stack: ["Optimization", "Algorithms", "Backend"],
        repos: ["tua-hackhathon"],
    },
    {
        id: "redis-sharding-demo",
        title: "Redis Sharding Demo",
        category: "Distributed Systems",
        description:
            "A technical deep dive demonstrating Redis sharding and distribution strategies.",
        stack: ["Redis", "Distributed Systems", "Sharding"],
        repos: ["redis-sharding-demo"],
    },
    {
        id: "ecommerce-backend",
        title: "E-commerce Backend",
        category: "Java Backend",
        description:
            "A Java Spring Boot backend project covering core e-commerce service patterns.",
        stack: ["Java", "Spring Boot", "REST API", "Backend"],
        repos: ["ecommerce-backend"],
    },
    {
        id: "raft-demo",
        title: "Raft Demo",
        category: "Engineering Demo",
        description:
            "A compact distributed-systems demo and article companion for exploring Raft concepts.",
        stack: ["Distributed Systems", "Raft", "Consensus"],
        repos: ["raft-demo"],
    },
];

let cache = null;
let cacheTime = 0;
let profileHtmlPromise = null;
const CACHE_DURATION = 10 * 60 * 1000;

function repoUrl(name) {
    return `https://github.com/${OWNER}/${name}`;
}

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
    if (!match) return null;

    const number = Number(match[1]);
    if (!Number.isFinite(number)) return null;
    if (match[2] === "m") return Math.round(number * 1_000_000);
    if (match[2] === "k") return Math.round(number * 1_000);
    return Math.round(number);
}

function getHeaders() {
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

async function fetchProfileHtml() {
    if (!profileHtmlPromise) {
        profileHtmlPromise = fetch(`https://github.com/${OWNER}`, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
                Accept: "text/html",
            },
        })
            .then((response) => (response.ok ? response.text() : ""))
            .catch(() => "");
    }

    return profileHtmlPromise;
}

async function fetchRepoFromProfile(name) {
    const html = await fetchProfileHtml();
    if (!html) return null;

    const section = html.match(
        /<div[^>]*class="[^"]*js-pinned-items-reorder-container[^"]*"[\s\S]*?<\/ol>\s*<\/div>/i
    )?.[0];
    const items = section?.match(
        /<li\b[^>]*class="[^"]*pinned-item-list-item[^"]*"[\s\S]*?<\/li>/gi
    ) || [];
    const item = items.find((candidate) =>
        new RegExp(
            `href="/${escapeRegExp(OWNER)}/${escapeRegExp(name)}"`,
            "i"
        ).test(candidate)
    );

    if (!item) return null;

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
                `href="/${escapeRegExp(OWNER)}/${escapeRegExp(name)}/stargazers"[\\s\\S]*?<\\/svg>\\s*([^<]+)`,
                "i"
            )
        )?.[1] || ""
    );
    const forks = parseCompactCount(
        item.match(
            new RegExp(
                `href="/${escapeRegExp(OWNER)}/${escapeRegExp(name)}/forks"[\\s\\S]*?<\\/svg>\\s*([^<]+)`,
                "i"
            )
        )?.[1] || ""
    );

    return {
        id: id ? Number(id) : `${OWNER}/${name}`,
        name,
        full_name: `${OWNER}/${name}`,
        html_url: repoUrl(name),
        homepage: "",
        description,
        language: language || null,
        stargazers_count: stars,
        forks_count: forks,
        updated_at: null,
    };
}

async function fetchRepo(name) {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${OWNER}/${name}`,
            { headers: getHeaders() }
        );
        return response.ok ? response.json() : fetchRepoFromProfile(name);
    } catch (error) {
        console.error(`Failed to fetch ${OWNER}/${name}:`, error);
        return fetchRepoFromProfile(name);
    }
}

function fallbackRepo(name) {
    return {
        id: `${OWNER}/${name}`,
        name,
        full_name: `${OWNER}/${name}`,
        html_url: repoUrl(name),
        homepage: "",
        description: "",
        language: null,
        stargazers_count: null,
        forks_count: null,
        updated_at: null,
    };
}

function compactRepo(repo, name) {
    const source = repo || fallbackRepo(name);

    return {
        id: source.id || `${OWNER}/${name}`,
        name: source.name || name,
        fullName: source.full_name || `${OWNER}/${name}`,
        githubUrl: source.html_url || repoUrl(name),
        liveUrl: source.homepage || "",
        description: source.description || "",
        language: source.language || null,
        stars:
            typeof source.stargazers_count === "number"
                ? source.stargazers_count
                : null,
        forks:
            typeof source.forks_count === "number" ? source.forks_count : null,
        updatedAt: source.updated_at || null,
    };
}

function latestDate(repos) {
    return repos
        .map((repo) => (repo.updatedAt ? new Date(repo.updatedAt) : null))
        .filter((date) => date && !Number.isNaN(date.getTime()))
        .sort((a, b) => b - a)[0]?.toISOString() || null;
}

function firstLiveUrl(repos) {
    return repos.find((repo) => repo.liveUrl)?.liveUrl || "";
}

function sumMetric(repos, key) {
    const values = repos
        .map((repo) => repo[key])
        .filter((value) => typeof value === "number");

    if (values.length === 0) return null;
    return values.reduce((total, value) => total + value, 0);
}

function buildProject(project, repoMap) {
    const repos = project.repos.map((name) => compactRepo(repoMap.get(name), name));
    const primaryRepo = repos[0];

    return {
        ...project,
        githubUrl: primaryRepo.githubUrl,
        liveUrl: firstLiveUrl(repos),
        stars: sumMetric(repos, "stars"),
        forks: sumMetric(repos, "forks"),
        updatedAt: latestDate(repos),
        repos,
    };
}

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const now = Date.now();
        if (cache && now - cacheTime < CACHE_DURATION) {
            return res.status(200).json({ projects: cache });
        }

        const repoNames = [
            ...new Set(CURATED_PROJECTS.flatMap((project) => project.repos)),
        ];
        const repoResults = await Promise.all(repoNames.map(fetchRepo));
        const repoMap = new Map(
            repoNames.map((name, index) => [name, repoResults[index]])
        );
        const projects = CURATED_PROJECTS.map((project) =>
            buildProject(project, repoMap)
        );

        cache = projects;
        cacheTime = now;

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=600, stale-while-revalidate=1200"
        );
        return res.status(200).json({ projects });
    } catch (error) {
        console.error("Error fetching curated GitHub projects:", error);
        if (cache) return res.status(200).json({ projects: cache });

        const fallbackProjects = CURATED_PROJECTS.map((project) =>
            buildProject(project, new Map())
        );
        return res.status(200).json({ projects: fallbackProjects, fallback: true });
    }
}
