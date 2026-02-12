// Custom Medium RSS parser that ensures title and content stay in sync
const MEDIUM_FEED_URL = `https://medium.com/feed/@${process.env.MEDIUM_USERNAME}`;

let cache = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const now = Date.now();
        if (cache && now - cacheTime < CACHE_DURATION) {
            return res.status(200).json({ posts: cache });
        }

        const response = await fetch(MEDIUM_FEED_URL, {
            headers: { "User-Agent": "blog-page-app/1.0" },
        });

        if (!response.ok) throw new Error("Failed to fetch Medium RSS");
        const xml = await response.text();

        // Split by <item> to keep fields strictly associated with their item
        // Medium's RSS is weird: content:encoded comes AFTER the </item> tag sometimes
        // So splitting by <item> puts the content in the same chunk as the title
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

            // Handle simple tags first
            const title = extractTag("title");
            const link = extractTag("link", false);
            const pubDate = extractTag("pubDate", false);
            const creator = extractTag("dc:creator");
            const guid = extractTag("guid", false);

            // Extract content:encoded from the chunk (it might be after </item>)
            const contentMatch = chunk.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
            const content = contentMatch ? contentMatch[1] : "";

            // Extract all categories
            const categories = [];
            const catRegex = /<category><!\[CDATA\[([^\]]*)\]\]><\/category>/g;
            let catMatch;
            while ((catMatch = catRegex.exec(chunk)) !== null) {
                categories.push(catMatch[1]);
            }

            // Thumbnail
            let thumbnail = null;
            if (content) {
                const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
                if (imgMatch) thumbnail = imgMatch[1];
            }

            // Snippet
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

        cache = posts;
        cacheTime = now;

        res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
        return res.status(200).json({ posts });
    } catch (error) {
        console.error("Error fetching Medium feed:", error);
        if (cache) return res.status(200).json({ posts: cache });
        return res.status(500).json({ error: "Failed to fetch Medium feed" });
    }
}
