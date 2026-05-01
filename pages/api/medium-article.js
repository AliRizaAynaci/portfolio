function isAllowedMediumUrl(rawUrl = "") {
    try {
        const url = new URL(rawUrl);
        return (
            url.protocol === "https:" &&
            (url.hostname === "medium.com" || url.hostname.endsWith(".medium.com"))
        );
    } catch (e) {
        return false;
    }
}

function extractArticleHtml(html = "") {
    const article =
        html.match(/<article[\s\S]*?<\/article>/i)?.[0] ||
        html.match(/<main[\s\S]*?<\/main>/i)?.[0] ||
        "";

    return article
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/\sdata-[a-z0-9-]+="[^"]*"/gi, "")
        .trim();
}

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const url = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;
    if (!isAllowedMediumUrl(url)) {
        return res.status(400).json({ error: "Invalid Medium URL" });
    }

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "aynacialiriza.me/1.0",
                Accept: "text/html",
            },
        });

        if (!response.ok) {
            throw new Error(`Medium article failed: ${response.status}`);
        }

        const html = await response.text();
        const content = extractArticleHtml(html);
        return res.status(200).json({ content });
    } catch (error) {
        console.error("Error fetching Medium article:", error);
        return res.status(502).json({ error: "Failed to fetch Medium article" });
    }
}
