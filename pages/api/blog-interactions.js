const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const MAX_NAME_LENGTH = 50;
const MAX_COMMENT_LENGTH = 1000;

function hasSupabaseConfig() {
    return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function cleanText(value, maxLength) {
    return String(value || "").trim().slice(0, maxLength);
}

function normalizeSlug(value) {
    const slug = cleanText(value, 180);
    return /^[a-z0-9-]+$/i.test(slug) ? slug : "";
}

function supabaseHeaders(extra = {}) {
    return {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        ...extra,
    };
}

async function supabaseFetch(path, options = {}) {
    const response = await fetch(`${SUPABASE_URL}${path}`, {
        ...options,
        headers: supabaseHeaders(options.headers),
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`Supabase request failed: ${response.status} ${message}`);
    }

    if (response.status === 204) return null;
    return response.json();
}

function mapComment(comment) {
    return {
        id: comment.id,
        name: comment.name,
        text: comment.message,
        date: comment.created_at,
    };
}

async function getInteractions(slug) {
    const encodedSlug = encodeURIComponent(slug);
    const [comments, likes] = await Promise.all([
        supabaseFetch(
            `/rest/v1/blog_comments?slug=eq.${encodedSlug}&select=id,name,message,created_at&order=created_at.desc&limit=50`
        ),
        supabaseFetch(
            `/rest/v1/blog_likes?slug=eq.${encodedSlug}&select=like_count&limit=1`
        ),
    ]);

    return {
        comments: Array.isArray(comments) ? comments.map(mapComment) : [],
        likeCount: Array.isArray(likes) && likes[0] ? likes[0].like_count : 0,
    };
}

async function addComment(slug, body) {
    const name = cleanText(body.name, MAX_NAME_LENGTH) || "Anonymous";
    const message = cleanText(body.text, MAX_COMMENT_LENGTH);

    if (!message) {
        const error = new Error("Comment text is required");
        error.statusCode = 400;
        throw error;
    }

    const rows = await supabaseFetch("/rest/v1/blog_comments", {
        method: "POST",
        headers: {
            Prefer: "return=representation",
        },
        body: JSON.stringify({ slug, name, message }),
    });

    return mapComment(rows[0]);
}

async function updateLike(slug, delta) {
    const functionName = delta > 0 ? "increment_blog_like" : "decrement_blog_like";
    const result = await supabaseFetch(`/rest/v1/rpc/${functionName}`, {
        method: "POST",
        body: JSON.stringify({ target_slug: slug }),
    });

    if (typeof result === "number") return result;
    if (Array.isArray(result)) return Number(result[0]) || 0;
    if (result && typeof result === "object") {
        return Number(Object.values(result)[0]) || 0;
    }

    return 0;
}

export default async function handler(req, res) {
    if (!hasSupabaseConfig()) {
        return res.status(503).json({ error: "Supabase is not configured" });
    }

    const slug = normalizeSlug(req.method === "GET" ? req.query.slug : req.body?.slug);
    if (!slug) {
        return res.status(400).json({ error: "Valid slug is required" });
    }

    try {
        if (req.method === "GET") {
            const interactions = await getInteractions(slug);
            res.setHeader(
                "Cache-Control",
                "public, s-maxage=30, stale-while-revalidate=120"
            );
            return res.status(200).json(interactions);
        }

        if (req.method === "POST") {
            if (req.body?.action === "comment") {
                const comment = await addComment(slug, req.body);
                return res.status(201).json({ comment });
            }

            if (req.body?.action === "like") {
                const delta = req.body?.delta > 0 ? 1 : -1;
                const likeCount = await updateLike(slug, delta);
                return res.status(200).json({ likeCount });
            }

            return res.status(400).json({ error: "Unknown action" });
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (error) {
        console.error("Blog interaction API error:", error);
        return res
            .status(error.statusCode || 500)
            .json({ error: "Unable to update blog interactions" });
    }
}
