import { fetchMediumPosts, stripHtml, toEditorialPost } from "@/lib/medium";

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

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>The Aynacı Quarterly</title>
    <link>${SITE_URL}</link>
    <description>Backend, distributed systems, and occasional opinions by Ali Rıza Aynacı.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${posts
    .map((post) => {
        const link = `${SITE_URL}/writing/${post.slug}`;
        return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <pubDate>${new Date(post.pubDate).toUTCString()}</pubDate>
      <description>${escapeXml(stripHtml(post.excerpt || post.contentSnippet || ""))}</description>
    </item>`;
    })
    .join("\n")}
  </channel>
</rss>`;

    res.setHeader("Content-Type", "application/rss+xml");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.write(xml);
    res.end();

    return { props: {} };
}

export default function Rss() {
    return null;
}
