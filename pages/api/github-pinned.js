// API route to fetch pinned repositories from GitHub profile
// GitHub REST API doesn't support pinned repos, so we scrape the profile page

let cache = null;
let cacheTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const now = Date.now();
        if (cache && now - cacheTime < CACHE_DURATION) {
            return res.status(200).json({ repos: cache });
        }

        const username = process.env.GITHUB_USERNAME;
        const response = await fetch(`https://github.com/${username}`, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                Accept: "text/html",
            },
        });

        if (!response.ok) throw new Error("Failed to fetch GitHub profile");

        const html = await response.text();

        // Extract pinned repo names from the HTML
        const pinnedRepoNames = [];
        const pinnedRegex = new RegExp(
            `/${username}/([\\w.-]+).*?class="[^"]*repo"`,
            "gi"
        );

        // A more reliable approach: find the pinned items section
        const pinnedSection = html.match(
            /class="js-pinned-items-reorder-container"[\s\S]*?<\/ol>/
        );

        if (pinnedSection) {
            const repoLinkRegex = new RegExp(
                `href="/${username}/([^"]+)"[^>]*>\\s*<span[^>]*class="[^"]*repo[^"]*"`,
                "gi"
            );
            let match;
            while ((match = repoLinkRegex.exec(pinnedSection[0])) !== null) {
                if (!pinnedRepoNames.includes(match[1])) {
                    pinnedRepoNames.push(match[1]);
                }
            }
        }

        // If regex didn't catch them, try an alternative pattern
        if (pinnedRepoNames.length === 0) {
            const altRegex = new RegExp(
                `data-filterable-for="pinned-repos"[\\s\\S]*?href="/${username}/([^"]+)"`,
                "gi"
            );
            let match;
            while ((match = altRegex.exec(html)) !== null) {
                if (!pinnedRepoNames.includes(match[1])) {
                    pinnedRepoNames.push(match[1]);
                }
            }
        }

        // Fallback: just find all repo links in pinned section area
        if (pinnedRepoNames.length === 0) {
            const fallbackRegex = new RegExp(`class="pinned-item-list-item[\\s\\S]*?href="\\/${username}\\/([^"]+)"`, 'g');
            let match;
            while ((match = fallbackRegex.exec(html)) !== null) {
                if (!pinnedRepoNames.includes(match[1])) {
                    pinnedRepoNames.push(match[1]);
                }
            }
        }

        if (pinnedRepoNames.length === 0) {
            // Last resort: hardcoded pinned repos (will be overridden if scraping works)
            // This ensures the page still works even if GitHub changes their HTML structure
            pinnedRepoNames.push("gorl", "rlaas", "rlaas-frontend", "LeetCode", "flight-reservation");
        }

        // Fetch full repo details from GitHub REST API
        const repoPromises = pinnedRepoNames.map((name) =>
            fetch(`https://api.github.com/repos/${username}/${name}`, {
                headers: {
                    "User-Agent": "blog-page-app",
                    Accept: "application/vnd.github.v3+json",
                },
            }).then((r) => (r.ok ? r.json() : null))
        );

        const repos = (await Promise.all(repoPromises)).filter(Boolean);

        cache = repos;
        cacheTime = now;

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=600, stale-while-revalidate=1200"
        );

        return res.status(200).json({ repos });
    } catch (error) {
        console.error("Error fetching pinned repos:", error);

        // If cache exists, return stale cache
        if (cache) {
            return res.status(200).json({ repos: cache });
        }

        return res.status(500).json({ error: "Failed to fetch pinned repos" });
    }
}
