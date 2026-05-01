// Best-effort in-memory rate limiter for API routes.
// Survives a single Node process; serverless cold starts reset it. Combine
// with a managed store (Upstash, Vercel KV) once traffic justifies it.

const buckets = new Map();
let lastSweep = 0;
const SWEEP_INTERVAL = 5 * 60 * 1000;

function sweep(now) {
    if (now - lastSweep < SWEEP_INTERVAL) return;
    lastSweep = now;
    for (const [key, entry] of buckets) {
        if (entry.resetAt <= now) buckets.delete(key);
    }
}

export function clientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
    const real = req.headers["x-real-ip"];
    if (typeof real === "string") return real.trim();
    return req.socket?.remoteAddress || "unknown";
}

// Returns { ok: boolean, retryAfter: seconds }.
export function rateLimit(key, { limit, windowMs }) {
    const now = Date.now();
    sweep(now);

    const entry = buckets.get(key);
    if (!entry || entry.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true, retryAfter: 0 };
    }

    entry.count += 1;
    if (entry.count > limit) {
        return {
            ok: false,
            retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
        };
    }
    return { ok: true, retryAfter: 0 };
}
