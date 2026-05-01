const OWNER = "AliRizaAynaci";
const CACHE_DURATION = 30 * 60 * 1000;

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
            "A public demo of the Liftio backend, demonstrating architecture and coding style while the complete product implementation stays private.",
        stack: ["Go", "Docker", "REST API", "Backend Architecture"],
        repos: ["liftio-backend"],
    },
    {
        id: "nasa-space-apps",
        title: "NASA Space Apps Challenge",
        category: "Hackathon + AI + Backend",
        achievement: "Local 2nd Place · Global Nominee",
        description:
            "A multi-repo clean-air project combining backend, frontend, and ML components for NASA Space Apps.",
        stack: ["AI", "Backend", "Frontend", "Machine Learning"],
        repos: ["clean-breathing", "clean-breathing-front", "clean-breathing-ml"],
    },
    {
        id: "tua-hackathon",
        title: "TUA Hackathon",
        category: "Hackathon + Optimization",
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
        stack: ["Redis", "Distributed Systems", "Sharding", "Go"],
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
        stack: ["Distributed Systems", "Raft", "Consensus", "Go"],
        repos: ["raft-demo"],
    },
];

let cache = null;
let cacheTime = 0;

function getHeaders() {
    const headers = {
        "User-Agent": "aynacialiriza.me/1.0",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    };

    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    return headers;
}

function repoUrl(name) {
    return `https://github.com/${OWNER}/${name}`;
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
            typeof source.forks_count === "number"
                ? source.forks_count
                : null,
        updatedAt: source.updated_at || null,
    };
}

function sumMetric(repos, key) {
    const values = repos
        .map((repo) => repo[key])
        .filter((value) => typeof value === "number");

    if (values.length === 0) return null;
    return values.reduce((total, value) => total + value, 0);
}

function latestDate(repos) {
    return (
        repos
            .map((repo) => (repo.updatedAt ? new Date(repo.updatedAt) : null))
            .filter((date) => date && !Number.isNaN(date.getTime()))
            .sort((a, b) => b - a)[0]?.toISOString() || null
    );
}

function firstLiveUrl(repos) {
    return repos.find((repo) => repo.liveUrl)?.liveUrl || "";
}

async function fetchRepos() {
    const response = await fetch(
        `https://api.github.com/users/${OWNER}/repos?per_page=100&sort=updated&type=owner`,
        { headers: getHeaders() }
    );

    if (!response.ok) {
        throw new Error(`GitHub repos failed: ${response.status}`);
    }

    const repos = await response.json();
    if (!Array.isArray(repos)) return new Map();

    return new Map(
        repos
            .filter((repo) => !repo.fork && !repo.archived)
            .map((repo) => [repo.name, repo])
    );
}

function buildProject(project, repoMap) {
    const repos = project.repos.map((name) => compactRepo(repoMap.get(name), name));

    return {
        ...project,
        githubUrl: repos[0]?.githubUrl || repoUrl(project.repos[0]),
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

    const now = Date.now();
    if (cache && now - cacheTime < CACHE_DURATION) {
        res.setHeader(
            "Cache-Control",
            "public, s-maxage=1800, stale-while-revalidate=3600"
        );
        return res.status(200).json({ projects: cache });
    }

    try {
        const repoMap = await fetchRepos();
        const projects = CURATED_PROJECTS.map((project) =>
            buildProject(project, repoMap)
        );

        cache = projects;
        cacheTime = now;

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=1800, stale-while-revalidate=3600"
        );
        return res.status(200).json({ projects });
    } catch (error) {
        console.error("Error fetching curated GitHub projects:", error);
        if (cache) return res.status(200).json({ projects: cache, stale: true });

        return res.status(200).json({
            projects: CURATED_PROJECTS.map((project) =>
                buildProject(project, new Map())
            ),
            fallback: true,
        });
    }
}
