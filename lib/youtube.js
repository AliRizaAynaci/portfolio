export async function fetchYouTubeVideos() {
    try {
        const res = await fetch("/api/youtube");
        if (!res.ok) throw new Error("Failed to fetch videos");
        const data = await res.json();
        return data.videos;
    } catch (err) {
        console.error("Error fetching YouTube videos:", err);
        return [];
    }
}

export function formatVideoDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
