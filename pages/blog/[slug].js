import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useRef, useMemo } from "react";
import {
    fetchMediumPosts,
    formatDate,
    stripHtml,
    detectLang,
    estimateReadMin,
    slugify,
    slugFromMediumLink,
} from "@/lib/medium";
import hljs from "highlight.js";

const HTML_ENTITIES = {
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
};

function decodeBasicEntities(str) {
    return str.replace(/&(lt|gt|amp|quot|apos|nbsp|#39);/g, (m) => HTML_ENTITIES[m] || m);
}

function highlightCodeText(text) {
    try {
        const result = hljs.highlightAuto(text);
        const langClass = result.language ? ` language-${result.language}` : "";
        return `<code class="hljs${langClass}">${result.value}</code>`;
    } catch (e) {
        const escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        return `<code class="hljs">${escaped}</code>`;
    }
}

function processContent(html) {
    if (!html) return "";
    let content = html;

    const dropTags = [
        "script", "style", "iframe", "object", "embed", "form",
        "input", "textarea", "select", "button", "link", "meta",
        "base", "frame", "frameset", "noscript",
    ];
    dropTags.forEach((tag) => {
        content = content.replace(
            new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}>`, "gi"),
            ""
        );
        content = content.replace(
            new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi"),
            ""
        );
    });

    content = content.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
    content = content.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");
    content = content.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "");

    const neutralizeUrl = (attr, value) => {
        const trimmed = value.trim().toLowerCase();
        if (trimmed.startsWith("javascript:") || trimmed.startsWith("vbscript:")) return `${attr}="#"`;
        if (trimmed.startsWith("data:") && !trimmed.startsWith("data:image/")) return `${attr}="#"`;
        return null;
    };
    content = content.replace(
        /(href|src|xlink:href|action|formaction)\s*=\s*"([^"]*)"/gi,
        (m, attr, value) => neutralizeUrl(attr, value) || m
    );
    content = content.replace(
        /(href|src|xlink:href|action|formaction)\s*=\s*'([^']*)'/gi,
        (m, attr, value) => neutralizeUrl(attr, value) || m
    );

    content = content.replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/gi, "");

    content = content.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (m, inner) => {
        const text = decodeBasicEntities(
            inner
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
                .replace(/<\/div>\s*<div[^>]*>/gi, "\n")
                .replace(/<[^>]+>/g, "")
        );
        return `<pre>${highlightCodeText(text)}</pre>`;
    });

    content = content.replace(/<a[^>]*>Continue reading on Medium.*?<\/a>/gi, "");
    content = content.replace(/(<hr[^>]*\/?>|<hr[^>]*>)\s*$/gi, "");
    return content;
}

export default function BlogPost() {
    const router = useRouter();
    const { slug, guid } = router.query;
    const routeSlug = Array.isArray(slug) ? slug[0] : slug || "";
    const routeGuid = Array.isArray(guid) ? guid[0] : guid;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fullContent, setFullContent] = useState(null);

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [likePending, setLikePending] = useState(false);

    const [comments, setComments] = useState([]);
    const [commentName, setCommentName] = useState("");
    const [commentText, setCommentText] = useState("");
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [commentError, setCommentError] = useState("");

    const interactionSlug = post ? slugify(post.title) : "";
    const storageKey = interactionSlug ? `blog_${interactionSlug}` : null;
    const contentRef = useRef(null);

    useEffect(() => {
        if (!router.isReady) return;

        async function loadPost() {
            try {
                const posts = await fetchMediumPosts();
                let found = null;
                if (routeGuid) {
                    found = posts.find((p) => p.guid === routeGuid || p.link === routeGuid);
                }
                if (!found && routeSlug) {
                    found = posts.find((p) =>
                        slugify(p.title) === routeSlug ||
                        slugFromMediumLink(p.link, p.title) === routeSlug
                    );
                }
                if (found) {
                    setPost(found);
                    setFullContent(found.content || "");
                    if (!found.content || found.content.length < 1000) {
                        fetchFullContent(found.link);
                    }
                }
            } catch (err) {
                console.error("Error loading post:", err);
            } finally {
                setLoading(false);
            }
        }

        loadPost();
    }, [router.isReady, routeSlug, routeGuid]);

    const fetchFullContent = async (url) => {
        try {
            const res = await fetch(`/api/medium-article?url=${encodeURIComponent(url)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.content) setFullContent(data.content);
            }
        } catch (e) {
            console.error("Failed to fetch full content", e);
        }
    };

    const renderedHtml = useMemo(
        () => processContent(fullContent || post?.content || ""),
        [fullContent, post]
    );

    useEffect(() => {
        if (!storageKey || !interactionSlug) return;
        let cancelled = false;

        try {
            const savedLike = localStorage.getItem(`${storageKey}_liked`);
            if (savedLike === "true") setLiked(true);
        } catch (e) {}

        async function loadInteractions() {
            try {
                const response = await fetch(
                    `/api/blog-interactions?slug=${encodeURIComponent(interactionSlug)}`
                );
                if (!response.ok) throw new Error("Failed to load interactions");
                const data = await response.json();
                if (cancelled) return;
                setLikeCount(Number(data.likeCount) || 0);
                setComments(Array.isArray(data.comments) ? data.comments : []);
                setCommentError("");
            } catch (error) {
                console.warn("Unable to load Supabase blog interactions:", error);
                if (!cancelled) {
                    setCommentError("Comments and saves could not be loaded from Supabase.");
                }
            }
        }

        loadInteractions();
        return () => { cancelled = true; };
    }, [interactionSlug, storageKey]);

    const handleLike = async () => {
        if (!storageKey || !interactionSlug || likePending) return;
        const previousLiked = liked;
        const previousCount = likeCount;
        const newLiked = !liked;
        const newCount = newLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
        setLiked(newLiked);
        setLikeCount(newCount);
        localStorage.setItem(`${storageKey}_liked`, String(newLiked));
        setLikePending(true);

        try {
            const response = await fetch("/api/blog-interactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "like",
                    slug: interactionSlug,
                    delta: newLiked ? 1 : -1,
                }),
            });
            if (!response.ok) throw new Error("Failed to update like");
            const data = await response.json();
            const nextCount = Number(data.likeCount);
            if (Number.isFinite(nextCount)) {
                setLikeCount(nextCount);
            }
        } catch (error) {
            console.warn("Unable to update Supabase like:", error);
            setLiked(previousLiked);
            setLikeCount(previousCount);
            localStorage.setItem(`${storageKey}_liked`, String(previousLiked));
        } finally {
            setLikePending(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || !interactionSlug || commentSubmitting) return;

        setCommentSubmitting(true);
        setCommentError("");

        try {
            const response = await fetch("/api/blog-interactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "comment",
                    slug: interactionSlug,
                    name: commentName.trim() || "Anonymous",
                    text: commentText.trim(),
                }),
            });
            if (!response.ok) throw new Error("Failed to save comment");
            const data = await response.json();
            if (data.comment) {
                setComments((current) => [data.comment, ...current]);
                setCommentName("");
                setCommentText("");
            }
        } catch (error) {
            console.warn("Unable to save Supabase comment:", error);
            setCommentError("Comment could not be saved to Supabase. Please try again.");
        } finally {
            setCommentSubmitting(false);
        }
    };


    const formatCommentDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner" />
                Loading article…
            </div>
        );
    }

    if (!post) {
        return (
            <>
                <Head><title>Post Not Found — The Aynacı Quarterly</title></Head>
                <div className="error">
                    <h2>Post not found</h2>
                    <p style={{ marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                        <Link href="/writing" style={{ color: "var(--accent)" }}>← Back to writing</Link>
                    </p>
                </div>
            </>
        );
    }

    const lang = detectLang(`${post.title} ${post.contentSnippet || ""}`);
    const readMin = estimateReadMin(fullContent || post.content);

    return (
        <>
            <Head>
                <title>{post.title} — The Aynacı Quarterly</title>
                <meta
                    name="description"
                    content={stripHtml(post.contentSnippet || (fullContent || "")).substring(0, 160)}
                />
                {post.link && <link rel="canonical" href={post.link} />}
            </Head>

            <main className="page">
                <ReadingProgress />
                <article className="post-page">
                    <div className="post-page__inner">
                        <Link href="/writing" className="post-page__back">
                            <span aria-hidden="true">←</span>
                            Back to writing
                        </Link>

                        <div className="post-page__kicker">
                            <span><strong>{formatDate(post.pubDate).toUpperCase()}</strong></span>
                            <span>{readMin} min</span>
                            <span className="lang-badge">{lang}</span>
                        </div>

                        <h1 className="post-page__title">{post.title}</h1>

                        <div className="post-page__byline">
                            <span>Ali Rıza Aynacı</span>
                            {post.categories?.slice(0, 4).map((c) => (
                                <span key={c}>· #{c.toLowerCase()}</span>
                            ))}
                        </div>

                        <div
                            className="post-prose"
                            ref={contentRef}
                            dangerouslySetInnerHTML={{ __html: renderedHtml }}
                        />

                        <div className="post-actions">
                            <button
                                type="button"
                                className={`like-pill ${liked ? "is-liked" : ""}`}
                                onClick={handleLike}
                                disabled={likePending}
                                aria-label={liked ? "Unlike this post" : "Like this post"}
                            >
                                <svg viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                <span>{liked ? "Saved" : "Save"}</span>
                                {likeCount > 0 && (
                                    <span style={{ borderLeft: "1px solid currentColor", paddingLeft: 8, opacity: 0.85 }}>
                                        {likeCount}
                                    </span>
                                )}
                            </button>

                            <a
                                href={post.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="post-actions__read-on"
                            >
                                Read original on Medium →
                            </a>
                        </div>
                    </div>
                </article>

                <section className="post-comments">
                    <h2 className="post-comments__title">Letters in reply</h2>
                    <div className="post-comments__sub">
                        Comments {comments.length > 0 ? `· ${comments.length}` : "· be the first"}
                    </div>

                    <form className="post-comments__form" onSubmit={handleCommentSubmit}>
                        <input
                            type="text"
                            placeholder="Your name"
                            value={commentName}
                            onChange={(e) => setCommentName(e.target.value)}
                            maxLength={50}
                        />
                        <textarea
                            placeholder="Write a comment…"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            rows={4}
                            required
                            maxLength={1000}
                        />
                        <div className="post-comments__form-foot">
                            <button
                                type="submit"
                                className="post-comments__submit"
                                disabled={!commentText.trim() || commentSubmitting}
                            >
                                {commentSubmitting ? "Posting…" : "Post comment →"}
                            </button>
                        </div>
                    </form>

                    {commentError && <p className="post-comments__notice">{commentError}</p>}

                    {comments.length > 0 && (
                        <div>
                            {comments.map((c) => (
                                <div key={c.id} className="comment-row">
                                    <div className="comment-row__head">
                                        <span className="comment-row__name">{c.name}</span>
                                        <time className="comment-row__date">{formatCommentDate(c.date)}</time>
                                    </div>
                                    <p className="comment-row__text">{c.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}

function ReadingProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const update = () => {
            const doc = document.documentElement;
            const max = doc.scrollHeight - window.innerHeight;
            setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, []);

    return (
        <div
            className="reading-progress"
            aria-hidden="true"
            style={{ transform: `scaleX(${progress})` }}
        />
    );
}
