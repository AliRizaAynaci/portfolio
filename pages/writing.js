import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { fetchMediumPosts, toEditorialPost } from "@/lib/medium";

export async function getStaticProps() {
    const raw = await fetchMediumPosts();
    const posts = (raw || []).map(toEditorialPost).map(({ content, contentSnippet, ...post }) => post);
    return {
        props: { posts },
        revalidate: 3600,
    };
}

function postHref(post) {
    return {
        pathname: `/writing/${post.slug}`,
        query: { guid: post.guid || post.link },
    };
}

function buildTagCounts(posts) {
    const counts = new Map();
    posts.forEach((p) => {
        (p.tags || []).forEach((t) => {
            counts.set(t, (counts.get(t) || 0) + 1);
        });
    });
    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export default function WritingIndex({ posts = [] }) {
    const [query, setQuery] = useState("");
    const [lang, setLang] = useState("ALL"); // ALL | EN | TR
    const [sort, setSort] = useState("NEWEST"); // NEWEST | LONGEST
    const [activeTag, setActiveTag] = useState(null);

    const tagCounts = useMemo(() => buildTagCounts(posts), [posts]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = posts.filter((p) => {
            if (lang !== "ALL" && p.lang !== lang) return false;
            if (activeTag && !(p.tags || []).includes(activeTag)) return false;
            if (!q) return true;
            const hay = `${p.title} ${p.excerpt} ${(p.tags || []).join(" ")}`.toLowerCase();
            return hay.includes(q);
        });
        if (sort === "NEWEST") {
            list = list.slice().sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        } else if (sort === "LONGEST") {
            list = list.slice().sort((a, b) => (b.readMin || 0) - (a.readMin || 0));
        }
        return list;
    }, [posts, query, lang, sort, activeTag]);

    const clearFilters = () => {
        setQuery("");
        setLang("ALL");
        setSort("NEWEST");
        setActiveTag(null);
    };

    return (
        <>
            <Head>
                <title>Writing — The Aynacı Quarterly</title>
                <meta
                    name="description"
                    content="Field Notes — long-form pieces on backend engineering, distributed systems, and the bugs that survived the test suite."
                />
            </Head>

            <main className="page">
                <header className="section-head">
                    <div>
                        <div className="mono-label section-head__kicker">Section B · Writing</div>
                        <h1 className="section-head__title">Field Notes</h1>
                    </div>
                    <div className="section-head__count">
                        {filtered.length} of {posts.length} pieces
                    </div>
                </header>

                <p className="section-lede">
                    Long-form pieces on backend engineering, distributed systems, and
                    the bugs that survived the test suite. Mostly in English, sometimes
                    in Turkish.
                </p>

                <div className="field-filters">
                    <div className="field-filters__row">
                        <label className="field-filters__search">
                            <svg className="field-filters__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="11" cy="11" r="7" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by title, tag, or excerpt…"
                                aria-label="Search"
                            />
                        </label>

                        <div className="toggle-group" role="group" aria-label="Language">
                            {["ALL", "EN", "TR"].map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    className={`toggle-group__btn ${lang === opt ? "is-active" : ""}`}
                                    onClick={() => setLang(opt)}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        <div className="toggle-group" role="group" aria-label="Sort">
                            {["NEWEST", "LONGEST"].map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    className={`toggle-group__btn ${sort === opt ? "is-active" : ""}`}
                                    onClick={() => setSort(opt)}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        {(query || lang !== "ALL" || sort !== "NEWEST" || activeTag) && (
                            <button type="button" className="field-clear" onClick={clearFilters}>
                                Clear
                            </button>
                        )}
                    </div>

                    {tagCounts.length > 0 && (
                        <div className="tag-chips">
                            {tagCounts.map(([tag, count]) => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`tag-chip ${activeTag === tag ? "is-active" : ""}`}
                                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                                >
                                    #{tag}
                                    <span className="tag-chip__count">· {count}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="field-list">
                    {filtered.length === 0 ? (
                        <div className="field-empty">No pieces match those filters.</div>
                    ) : (
                        filtered.map((post) => (
                            <Link
                                key={post.guid || post.link}
                                href={postHref(post)}
                                className="field-row"
                            >
                                <div className="field-row__date">
                                    <strong>{post.dateDay}</strong>
                                    <span>{post.dateYear}</span>
                                </div>

                                <div>
                                    <h2 className="field-row__title">{post.title}</h2>
                                    {post.excerpt && (
                                        <p className="field-row__excerpt">{post.excerpt}</p>
                                    )}
                                    {post.tags?.length > 0 && (
                                        <div className="field-row__tags">
                                            {post.tags.slice(0, 4).map((t) => (
                                                <span key={t} className="field-row__tag">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="field-row__meta">
                                    <strong>{post.readMin} min</strong>
                                    <span className="lang-badge" style={{ marginTop: 6, display: "inline-block" }}>{post.lang}</span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </>
    );
}
