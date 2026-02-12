// Fetches and parses Medium RSS feed
export async function fetchMediumPosts() {
    try {
        // If running on client side, use the API route to avoid CORS
        if (typeof window !== "undefined") {
            const res = await fetch("/api/medium");
            if (!res.ok) throw new Error("Failed to fetch posts via API");
            const data = await res.json();
            return data.posts;
        }

        // Server-side (getStaticProps): Fetch directly from RSS
        const RSS_URL = `https://medium.com/feed/@${process.env.MEDIUM_USERNAME}`;
        const res = await fetch(RSS_URL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        if (!res.ok) throw new Error("Failed to fetch Medium RSS");
        const xml = await res.text();

        // Parse XML manually (same logic as api/medium.js)
        const itemChunks = xml.split("<item>");
        itemChunks.shift(); // Remove feed header

        const posts = itemChunks.map((chunk) => {
            const extractTag = (tag, isCData = true) => {
                const regex = isCData
                    ? new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`)
                    : new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
                const match = chunk.match(regex);
                return match ? match[1].trim() : "";
            };

            const title = extractTag("title");
            const link = extractTag("link", false);
            const pubDate = extractTag("pubDate", false);
            const creator = extractTag("dc:creator");
            const guid = extractTag("guid", false);

            const contentMatch = chunk.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
            const content = contentMatch ? contentMatch[1] : "";

            const categories = [];
            const catRegex = /<category><!\[CDATA\[([^\]]*)\]\]><\/category>/g;
            let catMatch;
            while ((catMatch = catRegex.exec(chunk)) !== null) {
                categories.push(catMatch[1]);
            }

            let thumbnail = null;
            if (content) {
                const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
                if (imgMatch) thumbnail = imgMatch[1];
            }

            const contentSnippet = content
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .substring(0, 300);

            return {
                title,
                link,
                pubDate,
                creator: creator || "Ali Rıza Aynacı",
                categories,
                thumbnail,
                content,
                contentSnippet,
                guid: guid || link,
            };
        });

        return posts;

    } catch (err) {
        console.error("Error fetching Medium posts:", err);
        return [];
    }
}

export function stripHtml(html) {
    if (!html) return "";
    return html
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

export function extractExcerpt(html, maxLength = 200) {
    const text = stripHtml(html);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

export function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function slugify(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}
