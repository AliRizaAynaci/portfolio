// Minimal contact endpoint. Logs the submission server-side and returns 200.
// To enable real delivery, set RESEND_API_KEY and CONTACT_TO env vars
// and the route will forward via Resend's HTTP API. Otherwise it acts as a
// no-op accept so the UI can show the success state and the user can fall
// back to the direct email link in the panel.

import { clientIp, rateLimit } from "@/lib/rate-limit";

const NAME_MAX = 80;
const BODY_MAX = 4000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function isEmail(s) {
    return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function clean(s, max) {
    return String(s || "").trim().slice(0, max);
}

async function sendViaResend({ name, from, body }) {
    const key = process.env.RESEND_API_KEY || process.env.CONTACT_RESEND_API_KEY;
    const to = process.env.CONTACT_TO || "aynacialiriza@gmail.com";
    const fromAddr = process.env.CONTACT_FROM || "letters@aynacialiriza.me";
    if (!key) return false;

    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: fromAddr,
            to: [to],
            reply_to: from,
            subject: `Letter from ${name}`,
            text: `From: ${name} <${from}>\n\n${body}`,
        }),
    });

    return res.ok;
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const name = clean(req.body?.name, NAME_MAX) || "Anonymous";
    const from = clean(req.body?.from, 200);
    const body = clean(req.body?.body, BODY_MAX);
    const honeypot = clean(req.body?.website, 200);

    if (honeypot) return res.status(200).json({ ok: true });

    const limit = rateLimit(`contact:${clientIp(req)}`, {
        limit: MAX_PER_WINDOW,
        windowMs: WINDOW_MS,
    });
    if (!limit.ok) {
        res.setHeader("Retry-After", String(limit.retryAfter));
        return res.status(429).json({ error: "Too many letters. Try again later." });
    }
    if (!isEmail(from)) return res.status(400).json({ error: "Valid email required" });
    if (!body) return res.status(400).json({ error: "Letter body required" });
    if (String(req.body?.body || "").length > BODY_MAX) {
        return res.status(400).json({ error: "Letter body is too long" });
    }

    try {
        const sent = await sendViaResend({ name, from, body });
        if (!sent) {
            console.log("[letters] (no resend key) received letter:", { name, from, length: body.length });
        }
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("[letters] error:", err);
        return res.status(500).json({ error: "Failed to deliver letter" });
    }
}
