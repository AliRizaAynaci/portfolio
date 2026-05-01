import Head from "next/head";
import Link from "next/link";
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

function WireItem({ post }) {
    return (
        <Link href={postHref(post)} className="wire-item">
            <div className="wire-item__meta">
                <span><strong>{post.dateDay}</strong></span>
                <span>{post.readMin} min</span>
                <span className="lang-badge">{post.lang}</span>
            </div>
            <h3 className="wire-item__title">{post.title}</h3>
            <p className="wire-item__excerpt">{post.excerpt}</p>
        </Link>
    );
}

export default function FrontPage({ posts }) {
    const wirePosts = (posts || []).slice(0, 4);
    const totalPosts = (posts || []).length;

    return (
        <>
            <Head>
                <title>The Aynacı Quarterly — Ali Rıza Aynacı</title>
                <meta
                    name="description"
                    content="The Aynacı Quarterly — long-form writing on backend engineering, distributed systems, and the bugs that survived the test suite."
                />
            </Head>

            <main className="page">
                <section className="front">
                    <div className="front-lede">
                        <div className="mono-label front-lede__kicker">From the desk of · {posts?.[0]?.dateDay || "Today"} {posts?.[0]?.dateYear || ""}</div>

                        <h2 className="front-lede__title">
                            On building things that have to <em>survive</em> the network.
                        </h2>

                        <div className="front-lede__byline">
                            <span>Ali Rıza Aynacı</span>
                            <span>—</span>
                            <span>Backend Engineer</span>
                            <span>—</span>
                            <span>Kayseri, TR</span>
                        </div>

                        <div className="front-lede__body">
                            <p>
                                I build backend systems in Go — rate limiters, distributed
                                services, and the small pieces of infrastructure that hold
                                them together. Most of what I write here starts from trying
                                to understand how software infrastructure behaves when real
                                users, traffic, and failure modes meet the design.
                            </p>
                            <p>
                                I&apos;m a Computer Engineering student at Erciyes University,
                                an open-source contributor, and the writer of slightly-too-long
                                Medium pieces on consensus, sharding, and the small mercies of
                                a well-placed <em>select</em> statement. Currently obsessed
                                with understanding the infrastructure of software.
                            </p>
                            <p>
                                You&apos;ll find writing in the column on the right, projects
                                on their own page, and a way to send me a letter at the
                                bottom. Hit <em>⌘K</em> if you&apos;re in a hurry.
                            </p>
                        </div>

                        <div className="front-lede__cta-row">
                            <Link href="/writing" className="cta-btn">
                                Continue reading
                                <span aria-hidden="true">→</span>
                            </Link>
                            <Link href="/projects" className="cta-btn cta-btn--ghost">
                                See projects
                                <span aria-hidden="true">→</span>
                            </Link>
                        </div>

                        <blockquote className="front-pull">
                            <q>
                                The interesting part of software is usually beneath the
                                feature: the queues, caches, limits, retries, and contracts
                                that decide whether a system stays understandable under load.
                            </q>
                        </blockquote>
                    </div>

                    <div className="front__divider" aria-hidden="true" />

                    <aside className="wire">
                        <div className="wire__head">
                            <span className="mono-label mono-label--accent">On the wire</span>
                            <span className="mono-label">·</span>
                            <span className="mono-label">Latest writing</span>
                        </div>

                        {wirePosts.length > 0 ? (
                            <>
                                <div className="wire__list">
                                    {wirePosts.map((p) => (
                                        <WireItem key={p.guid || p.link} post={p} />
                                    ))}
                                </div>
                                <Link href="/writing" className="wire__more">
                                    All {totalPosts} posts <span aria-hidden="true">→</span>
                                </Link>
                            </>
                        ) : (
                            <p className="field-empty">No posts loaded yet.</p>
                        )}
                    </aside>
                </section>

                <div className="section-banner">
                    <span>Section C · Projects</span>
                    <Link href="/projects">All projects →</Link>
                </div>
            </main>
        </>
    );
}
