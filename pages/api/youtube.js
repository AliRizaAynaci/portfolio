import Parser from "rss-parser";

const parser = new Parser({
    customFields: {
        item: [
            ["media:group", "mediaGroup"],
            ["media:thumbnail", "mediaThumbnail"],
            ["media:community", "mediaCommunity"],
        ],
    },
});

const YOUTUBE_FEED_URL =
    `https://www.youtube.com/feeds/videos.xml?channel_id=${process.env.YOUTUBE_CHANNEL_ID}`;

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
            return res.status(200).json({ videos: cache });
        }

        const feed = await parser.parseURL(YOUTUBE_FEED_URL);

        const videos = feed.items.slice(0, 3).map((item) => {
            // Extract video ID from the link
            const videoId = item.link
                ? new URL(item.link).searchParams.get("v")
                : null;

            return {
                title: item.title,
                link: item.link,
                videoId,
                pubDate: item.pubDate || item.isoDate,
                thumbnail: videoId
                    ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
                    : null,
            };
        });

        cache = videos;
        cacheTime = now;

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=600, stale-while-revalidate=1200"
        );

        return res.status(200).json({ videos });
    } catch (error) {
        console.error("Error fetching YouTube feed:", error);
        if (cache) {
            return res.status(200).json({ videos: cache });
        }
        return res.status(500).json({ error: "Failed to fetch YouTube feed" });
    }
}
