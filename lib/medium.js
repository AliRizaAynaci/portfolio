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
        const username = (process.env.MEDIUM_USERNAME || "aynacialiriza")
            .replace(/^@/, "")
            .trim();
        const RSS_URL = `https://medium.com/feed/@${username}`;
        const res = await fetch(RSS_URL, {
            headers: {
                "User-Agent": "aynacialiriza.me/1.0",
                Accept: "application/rss+xml, application/xml;q=0.9",
            },
        });

        if (!res.ok) throw new Error("Failed to fetch Medium RSS");
        const xml = await res.text();

        const itemChunks = xml.split("<item>");
        itemChunks.shift();

        const posts = itemChunks.map((chunk) => {
            const extractTag = (tag) => {
                const match = chunk.match(
                    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`)
                );
                if (!match) return "";
                return unwrapCdata(match[1]).trim();
            };

            const title = extractTag("title");
            const link = extractTag("link");
            const pubDate = extractTag("pubDate");
            const creator = extractTag("dc:creator");
            const guid = extractTag("guid");

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
    return decodeEntities(html)
        .replace(/<[^>]*>/g, " ")
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
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

function unwrapCdata(value = "") {
    const match = value.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
    return match ? match[1] : value;
}

export function decodeEntities(value = "") {
    const named = {
        amp: "&",
        lt: "<",
        gt: ">",
        quot: '"',
        apos: "'",
        nbsp: " ",
        "#39": "'",
    };

    return String(value).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code) => {
        const lower = code.toLowerCase();
        if (lower[0] === "#") {
            const isHex = lower[1] === "x";
            const parsed = parseInt(lower.slice(isHex ? 2 : 1), isHex ? 16 : 10);
            return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : entity;
        }
        return named[lower] || entity;
    });
}

export function slugFromMediumLink(link = "", fallbackTitle = "") {
    try {
        const url = new URL(link);
        const parts = url.pathname.split("/").filter(Boolean);
        const candidate = decodeURIComponent(parts[parts.length - 1] || "");
        if (candidate && candidate !== "p") return slugify(candidate);
    } catch (e) {}
    return slugify(fallbackTitle);
}

// Editorial helpers ---------------------------------------------------

const TR_CHARS = /[ğıİşçöüĞÇŞÖÜ]/g;

export function detectLang(text = "") {
    const m = text.match(TR_CHARS);
    return m && m.length >= 2 ? "TR" : "EN";
}

export function estimateReadMin(content = "") {
    const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
    if (!words) return 3;
    return Math.max(3, Math.round(words / 220));
}

export function shortDate(dateStr) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return { day: "", year: "" };
    const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    return {
        day: `${month} ${d.getDate()}`,
        year: String(d.getFullYear()),
    };
}

// Project a Medium post into the editorial Post shape used by the design.
export function toEditorialPost(post) {
    const lang = detectLang(`${post.title} ${post.contentSnippet || ""}`);
    const readMin = estimateReadMin(post.content);
    const tags = (post.categories || []).map((c) => c.toLowerCase());
    const excerpt = extractExcerpt(post.contentSnippet || post.content || "", 220);
    const dateParts = shortDate(post.pubDate);
    return {
        ...post,
        slug: slugFromMediumLink(post.link, post.title),
        lang,
        readMin,
        tags,
        excerpt,
        dateDay: dateParts.day,
        dateYear: dateParts.year,
    };
}
