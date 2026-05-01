// Custom Medium RSS parser that ensures title and content stay in sync.
let cache = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const username = (process.env.MEDIUM_USERNAME || "aynacialiriza")
        .replace(/^@/, "")
        .trim();

    try {
        const now = Date.now();
        if (cache && now - cacheTime < CACHE_DURATION) {
            return res.status(200).json({ posts: cache });
        }

        const feedUrl = `https://medium.com/feed/@${username}`;
        const response = await fetch(feedUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (compatible; PortfolioBot/1.0; +https://medium.com)",
                Accept: "application/rss+xml, application/xml;q=0.9",
            },
        });

        if (!response.ok) {
            throw new Error(
                `Medium responded ${response.status} for @${username}`
            );
        }
        const xml = await response.text();

        const itemChunks = xml.split("<item>");
        itemChunks.shift();

        const posts = itemChunks.map((chunk) => {
            const extractTag = (tag) => {
                const match = chunk.match(
                    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`)
                );
                if (!match) return "";
                const cdata = match[1].match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
                return (cdata ? cdata[1] : match[1]).trim();
            };

            const title = extractTag("title");
            const link = extractTag("link");
            const pubDate = extractTag("pubDate");
            const creator = extractTag("dc:creator");
            const guid = extractTag("guid");

            const contentMatch = chunk.match(
                /<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/
            );
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
                creator: creator || "",
                categories,
                thumbnail,
                content,
                contentSnippet,
                guid: guid || link,
            };
        });

        cache = posts;
        cacheTime = now;

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=300, stale-while-revalidate=600"
        );
        return res.status(200).json({ posts });
    } catch (error) {
        console.error("Error fetching Medium feed:", error);
        if (cache) return res.status(200).json({ posts: cache });
        return res
            .status(500)
            .json({ error: "Failed to fetch Medium feed", detail: String(error) });
    }
}
