import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import TechStack from "../components/TechStack";
import LeetCodeStats from "../components/LeetCodeStats";
import GithubStats from "../components/GithubStats";
import { fetchMediumPosts, formatDate, slugify } from "../lib/medium";
import { fetchYouTubeVideos, formatVideoDate } from "../lib/youtube";

export async function getStaticProps() {
    const posts = await fetchMediumPosts();
    return {
        props: { posts },
        revalidate: 3600,
    };
}

function Arrow({ size = 14 }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cta__arrow"
            aria-hidden="true"
        >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );
}

function DownloadIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M7 10l5 5 5-5" />
            <path d="M12 15V3" />
        </svg>
    );
}

function MailIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
        </svg>
    );
}

function PostMeta({ post }) {
    return (
        <div className="post__meta">
            <time dateTime={post.pubDate}>{formatDate(post.pubDate)}</time>
            {post.categories && post.categories.length > 0 && (
                <>
                    <span className="post__sep" aria-hidden="true">
                        /
                    </span>
                    <ul className="post__tags">
                        {post.categories.slice(0, 3).map((cat) => (
                            <li key={cat} className="tag">
                                {cat.toLowerCase()}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

function postHref(post) {
    return {
        pathname: `/blog/${slugify(post.title)}`,
        query: { guid: post.guid || post.link },
    };
}

function FeaturedPost({ post }) {
    return (
        <Link
            href={postHref(post)}
            className="post post--featured"
        >
            <span className="post__badge">Latest</span>
            <PostMeta post={post} />
            <h3 className="post__title">{post.title}</h3>
            {post.contentSnippet && (
                <p className="post__excerpt">{post.contentSnippet}</p>
            )}
            <span className="post__cta">
                Read article
                <Arrow />
            </span>
        </Link>
    );
}

function PostRow({ post }) {
    return (
        <Link href={postHref(post)} className="post post--row">
            <PostMeta post={post} />
            <h3 className="post__title">{post.title}</h3>
            {post.contentSnippet && (
                <p className="post__excerpt">{post.contentSnippet}</p>
            )}
            <span className="post__cta">
                Read article
                <Arrow />
            </span>
        </Link>
    );
}

const SOCIALS = [
    {
        label: "GitHub",
        href: "https://github.com/AliRizaAynaci",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
                aria-hidden="true"
            >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
        ),
    },
    {
        label: "LinkedIn",
        href: "https://linkedin.com/in/alirizaaynaci",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
                aria-hidden="true"
            >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
        ),
    },
    {
        label: "Medium",
        href: "https://medium.com/@aynacialiriza",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
                aria-hidden="true"
            >
                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
            </svg>
        ),
    },
    {
        label: "YouTube",
        href: "https://www.youtube.com/@aynacialiriza",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
                aria-hidden="true"
            >
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
        ),
    },
];

export default function Home({ posts }) {
    const [videos, setVideos] = useState(null);

    useEffect(() => {
        fetchYouTubeVideos().then(setVideos);
    }, []);

    const safePosts = posts || [];
    const [featured, ...restPosts] = safePosts;
    const latestVideo = Array.isArray(videos) && videos.length > 0 ? videos[0] : null;

    return (
        <>
            <Head>
                <title>Ali Rıza Aynacı — Backend Engineer</title>
                <meta
                    name="description"
                    content="Portfolio and writing of Ali Rıza Aynacı — backend engineer focused on Go, distributed systems, and scalable infrastructure."
                />
                <link rel="icon" href="/favicon_aa.png" />
            </Head>

            <div className="page">
                <section className="page-hero home-hero">
                    <div className="page-hero__inner">
                        <span className="pill hero__pill">
                            <span className="pill__dot" aria-hidden="true" />
                            Open to opportunities &amp; collaborations
                        </span>

                        <h1 className="hero__name">Ali Rıza Aynacı</h1>
                        <p className="hero__role">
                            Backend Engineer · Go · Distributed systems
                        </p>
                        <p className="hero__bio">
                            Computer Engineering student at Erciyes University. I build
                            scalable infrastructure, contribute to open source, and write
                            about what I learn along the way.
                        </p>

                        <div className="hero__links">
                            {SOCIALS.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="iconlink"
                                >
                                    {s.icon}
                                    <span>{s.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <aside className="hero-cv" aria-labelledby="hero-cv-title">
                        <span className="eyebrow">Interested?</span>
                        <h2 id="hero-cv-title" className="hero-cv__title">
                            Let&apos;s build something reliable.
                        </h2>
                        <p className="hero-cv__body">
                            If you&apos;re looking for backend, distributed systems, or
                            product-minded engineering work, my CV has the short version.
                        </p>
                        <div className="hero-cv__actions">
                            <a
                                href="/AliRizaAynaciResume.pdf"
                                download
                                className="hero-cv__button hero-cv__button--primary"
                            >
                                <DownloadIcon />
                                Download CV
                            </a>
                            <a
                                href="mailto:aynacialiriza@gmail.com"
                                className="hero-cv__button"
                            >
                                <MailIcon />
                                Email
                            </a>
                        </div>
                    </aside>
                </section>

                <div className="home-grid">
                    <main className="home-main">
                        <section>
                            <header className="section-head">
                                <div className="section-head__main">
                                    <span className="eyebrow">Writing</span>
                                    <h2 className="section-head__title">Latest essays</h2>
                                </div>
                                <a
                                    href="https://medium.com/@aynacialiriza"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cta"
                                >
                                    View all on Medium
                                    <Arrow />
                                </a>
                            </header>

                            {safePosts.length > 0 ? (
                                <div className="posts">
                                    {featured && <FeaturedPost post={featured} />}
                                    {restPosts.length > 0 && (
                                        <ul className="posts__list">
                                            {restPosts.map((post) => (
                                                <li key={post.guid || post.link}>
                                                    <PostRow post={post} />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <div className="empty">
                                    <p>
                                        No posts yet — set <code>MEDIUM_USERNAME</code> in{" "}
                                        <code>.env.local</code> and restart the dev server.
                                    </p>
                                </div>
                            )}
                        </section>
                    </main>

                    <aside className="rail">
                        <div className="rail__block">
                            <header className="rail__head">
                                <span className="eyebrow">On YouTube</span>
                                <a
                                    href="https://www.youtube.com/@aynacialiriza"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cta"
                                >
                                    Channel
                                    <Arrow />
                                </a>
                            </header>

                            {videos === null ? (
                                <div className="video video--skel" aria-hidden="true">
                                    <div className="video__thumb" />
                                    <div className="video__body">
                                        <div className="skel skel--text" />
                                        <div className="skel skel--text skel--short" />
                                    </div>
                                </div>
                            ) : latestVideo ? (
                                <a
                                    href={latestVideo.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="video"
                                >
                                    <div className="video__thumb">
                                        <img
                                            src={latestVideo.thumbnail}
                                            alt={latestVideo.title}
                                            loading="lazy"
                                        />
                                        <span className="video__play" aria-hidden="true">
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </span>
                                    </div>
                                    <div className="video__body">
                                        <h3 className="video__title">{latestVideo.title}</h3>
                                        <time className="video__date">
                                            {formatVideoDate(latestVideo.pubDate)}
                                        </time>
                                    </div>
                                </a>
                            ) : (
                                <p
                                    style={{
                                        fontSize: 12,
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    No videos yet.
                                </p>
                            )}
                        </div>

                        <GithubStats username="AliRizaAynaci" />
                        <LeetCodeStats username="AliRiza" />
                        <TechStack />
                    </aside>
                </div>
            </div>
        </>
    );
}
