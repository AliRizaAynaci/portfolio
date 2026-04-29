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

let videoCache = null;
let videoCacheTime = 0;
const VIDEO_CACHE_DURATION = 10 * 60 * 1000;

let channelIdCache = null;

async function resolveChannelId() {
    const explicit = (process.env.YOUTUBE_CHANNEL_ID || "").trim();
    if (explicit) return explicit;

    if (channelIdCache) return channelIdCache;

    const handle = (process.env.YOUTUBE_HANDLE || "").replace(/^@/, "").trim();
    if (!handle) return "";

    const response = await fetch(`https://www.youtube.com/@${handle}`, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        },
    });

    if (!response.ok) {
        throw new Error(
            `Could not load YouTube handle page (HTTP ${response.status})`
        );
    }
    const html = await response.text();

    const patterns = [
        /"channelId":"(UC[\w-]+)"/,
        /<meta itemprop="channelId" content="(UC[\w-]+)"/,
        /<meta property="og:url" content="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]+)"/,
        /href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]+)"/,
    ];

    for (const re of patterns) {
        const match = html.match(re);
        if (match && match[1]) {
            channelIdCache = match[1];
            return channelIdCache;
        }
    }

    return "";
}

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const now = Date.now();
        if (videoCache && now - videoCacheTime < VIDEO_CACHE_DURATION) {
            return res.status(200).json({ videos: videoCache });
        }

        const channelId = await resolveChannelId();
        if (!channelId) {
            return res.status(500).json({
                error:
                    "Set YOUTUBE_CHANNEL_ID (preferred) or YOUTUBE_HANDLE in .env.local, then restart dev.",
            });
        }

        const feed = await parser.parseURL(
            `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
        );

        const videos = feed.items.slice(0, 6).map((item) => {
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

        videoCache = videos;
        videoCacheTime = now;

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=600, stale-while-revalidate=1200"
        );
        return res.status(200).json({ videos });
    } catch (error) {
        console.error("Error fetching YouTube feed:", error);
        if (videoCache) return res.status(200).json({ videos: videoCache });
        return res.status(500).json({
            error: "Failed to fetch YouTube feed",
            detail: String(error),
        });
    }
}
