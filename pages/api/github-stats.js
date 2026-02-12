export default async function handler(req, res) {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    try {
        // 1. Fetch User Info
        const userRes = await fetch(`https://api.github.com/users/${username}`);

        if (!userRes.ok) {
            console.warn("GitHub API rate limited or error");
            // Fallback for user request
            throw new Error("User fetch failed");
        }
        const user = await userRes.json();

        // 2. Fetch Repositories to calculate stars and languages
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&type=owner`);
        let repos = [];
        if (reposRes.ok) {
            repos = await reposRes.json();
        }

        // Calculate Total Stars
        const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);

        // Calculate Languages (Based on PRIMARY language of each repo)
        // Note: Without token, calculating byte-size accuracy requires too many calls.
        // We will use repo count per language as a proxy.
        const langCounts = {};
        let totalReposWithLang = 0;

        repos.forEach(repo => {
            if (repo.language) {
                langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
                totalReposWithLang++;
            }
        });

        const languageColors = {
            "JavaScript": "#f1e05a",
            "TypeScript": "#2b7489",
            "Go": "#00ADD8",
            "Java": "#b07219",
            "Python": "#3572A5",
            "C++": "#f34b7d",
            "C": "#555555",
            "HTML": "#e34c26",
            "CSS": "#563d7c",
            "Vue": "#41b883",
            "Shell": "#89e051"
        };

        const topLanguages = Object.entries(langCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({
                name,
                count,
                percentage: ((count / totalReposWithLang) * 100).toFixed(1),
                color: languageColors[name] || "#ccc"
            }));


        const stats = {
            username: user.login,
            name: user.name,
            avatar: user.avatar_url,
            followers: user.followers,
            following: user.following,
            publicRepos: user.public_repos,
            totalStars: totalStars,
            topLanguages: topLanguages,
            htmlUrl: user.html_url
        };

        // Cache for 1 hour
        res.setHeader(
            "Cache-Control",
            "public, s-maxage=3600, stale-while-revalidate=7200"
        );

        return res.status(200).json(stats);

    } catch (error) {
        console.error("Error fetching GitHub stats via REST:", error);
        // Return fallback data
        return res.status(200).json({
            username: username,
            name: username,
            publicRepos: 0,
            followers: 0,
            following: 0,
            totalStars: 0,
            topLanguages: [],
            htmlUrl: `https://github.com/${username}`
        });
    }
}
