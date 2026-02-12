export async function fetchPinnedRepos() {
    try {
        const res = await fetch("/api/github-pinned");
        if (!res.ok) throw new Error("Failed to fetch pinned repos");
        const data = await res.json();
        return data.repos;
    } catch (err) {
        console.error("Error fetching pinned repos:", err);
        return [];
    }
}

// Language colors for GitHub
export const languageColors = {
    Go: "#00ADD8",
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Java: "#b07219",
    C: "#555555",
    "C++": "#f34b7d",
    "C#": "#178600",
    "Jupyter Notebook": "#DA5B0B",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Dockerfile: "#384d54",
    Rust: "#dea584",
    Ruby: "#701516",
    Kotlin: "#A97BFF",
};
