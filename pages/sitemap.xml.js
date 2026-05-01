import { fetchMediumPosts, toEditorialPost } from "@/lib/medium";

const SITE_URL = "https://www.aynacialiriza.me";

function escapeXml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export async function getServerSideProps({ res }) {
    const raw = await fetchMediumPosts();
    const posts = (raw || []).map(toEditorialPost);
    const staticRoutes = ["", "writing", "projects", "stack", "about", "letters"];

    const urls = [
        ...staticRoutes.map((route) => ({
            loc: `${SITE_URL}/${route}`,
            lastmod: new Date().toISOString(),
        })),
        ...posts.map((post) => ({
            loc: `${SITE_URL}/writing/${post.slug}`,
            lastmod: post.pubDate ? new Date(post.pubDate).toISOString() : new Date().toISOString(),
        })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
  </url>`
    )
    .join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.write(xml);
    res.end();

    return { props: {} };
}

export default function Sitemap() {
    return null;
}
