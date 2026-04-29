import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { fetchMediumPosts, formatDate, stripHtml } from "@/lib/medium";
import hljs from "highlight.js";
// GitHub Dark theme for highlight.js will be loaded via CSS import in _app.js or here
// But Next.js page router prefers global styles in _app.js.
// We can dynamic import CSS here or use global styles.
// Importing here works if Next.js supports component-level CSS imports (it does for modules).
// Let's use standard import if configured, or just link in _app.js
// Actually, let's just use the CDN link in Head for simplicity or import in _app.js

export default function BlogPost() {
    const router = useRouter();
    const { slug, guid } = router.query;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fullContent, setFullContent] = useState(null); // For posts with empty content in RSS

    // Like state
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    // Comment state
    const [comments, setComments] = useState([]);
    const [commentName, setCommentName] = useState("");
    const [commentText, setCommentText] = useState("");
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [commentError, setCommentError] = useState("");
    const [likePending, setLikePending] = useState(false);

    const storageKey = slug ? `blog_${slug}` : null;
    const contentRef = useRef(null);

    useEffect(() => {
        if (!router.isReady) return;

        async function loadPost() {
            try {
                const posts = await fetchMediumPosts();

                let found = null;
                if (guid) {
                    found = posts.find((p) => p.guid === guid || p.link === guid);
                }
                if (!found && slug) {
                    found = posts.find((p) => {
                        const postSlug = p.title
                            .toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, "")
                            .replace(/\s+/g, "-")
                            .replace(/-+/g, "-")
                            .trim();
                        return postSlug === slug;
                    });
                }

                if (found) {
                    setPost(found);
                    setFullContent(found.content || "");
                    // Check if content is empty or too short (RSS limitation).
                    // Keep the RSS body visible while the richer article fetch tries.
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
    }, [router.isReady, slug, guid]);

    const fetchFullContent = async (url) => {
        try {
            const res = await fetch(`/api/medium-article?url=${encodeURIComponent(url)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.content) {
                    setFullContent(data.content);
                }
            }
        } catch (e) {
            console.error("Failed to fetch full content", e);
        }
    };

    // Apply syntax highlighting when content changes
    useEffect(() => {
        if (fullContent && contentRef.current) {
            // Highlight all code blocks
            contentRef.current.querySelectorAll("pre").forEach((block) => {
                // Ensure pre has a code child for proper highlighting
                if (!block.querySelector("code")) {
                    const code = document.createElement("code");
                    code.innerHTML = block.innerHTML;
                    block.innerHTML = "";
                    block.appendChild(code);
                }
                const codeElement = block.querySelector("code");
                if (codeElement) {
                    hljs.highlightElement(codeElement);
                }
            });
        }
    }, [fullContent]);

    // Load persisted browser state first, then replace counts/comments with Supabase data.
    useEffect(() => {
        if (!storageKey) return;

        let cancelled = false;

        try {
            const savedLike = localStorage.getItem(`${storageKey}_liked`);
            const savedLikeCount = localStorage.getItem(`${storageKey}_likes`);
            const savedComments = localStorage.getItem(`${storageKey}_comments`);
            if (savedLike === "true") setLiked(true);
            if (savedLikeCount) setLikeCount(parseInt(savedLikeCount, 10));
            if (savedComments) setComments(JSON.parse(savedComments));
        } catch (e) {
            // Ignore
        }

        async function loadInteractions() {
            try {
                const response = await fetch(
                    `/api/blog-interactions?slug=${encodeURIComponent(slug)}`
                );
                if (!response.ok) throw new Error("Failed to load interactions");

                const data = await response.json();
                if (cancelled) return;

                setLikeCount(Number(data.likeCount) || 0);
                setComments(Array.isArray(data.comments) ? data.comments : []);
            } catch (error) {
                console.warn("Using local blog interactions fallback:", error);
            }
        }

        loadInteractions();

        return () => {
            cancelled = true;
        };
    }, [slug, storageKey]);

    const handleLike = async () => {
        if (!storageKey || likePending) return;

        const newLiked = !liked;
        const newCount = newLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
        setLiked(newLiked);
        setLikeCount(newCount);
        localStorage.setItem(`${storageKey}_liked`, String(newLiked));
        localStorage.setItem(`${storageKey}_likes`, String(newCount));
        setLikePending(true);

        try {
            const response = await fetch("/api/blog-interactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "like",
                    slug,
                    delta: newLiked ? 1 : -1,
                }),
            });

            if (!response.ok) throw new Error("Failed to update like");

            const data = await response.json();
            const nextCount = Number(data.likeCount);
            if (Number.isFinite(nextCount)) {
                setLikeCount(nextCount);
                localStorage.setItem(`${storageKey}_likes`, String(nextCount));
            }
        } catch (error) {
            console.warn("Using local like fallback:", error);
        } finally {
            setLikePending(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || !storageKey || commentSubmitting) return;

        setCommentSubmitting(true);
        setCommentError("");

        const newComment = {
            id: `local-${Date.now()}`,
            name: commentName.trim() || "Anonymous",
            text: commentText.trim(),
            date: new Date().toISOString(),
        };

        const updatedComments = [newComment, ...comments];
        setComments(updatedComments);
        setCommentName("");
        setCommentText("");
        localStorage.setItem(
            `${storageKey}_comments`,
            JSON.stringify(updatedComments)
        );

        try {
            const response = await fetch("/api/blog-interactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "comment",
                    slug,
                    name: newComment.name,
                    text: newComment.text,
                }),
            });

            if (!response.ok) throw new Error("Failed to save comment");

            const data = await response.json();
            if (data.comment) {
                setComments((current) =>
                    current.map((comment) =>
                        comment.id === newComment.id ? data.comment : comment
                    )
                );
            }
        } catch (error) {
            console.warn("Comment stored locally only:", error);
            setCommentError("Comment is saved locally until the comment service is ready.");
        } finally {
            setCommentSubmitting(false);
        }
    };

    const processContent = (html) => {
        if (!html) return "";
        let content = html;
        content = content.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
        content = content.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
        content = content.replace(/<figcaption[^>]*>.*?<\/figcaption>/gi, "");
        // Convert <br> tags inside <pre> blocks to \n for proper highlighting
        content = content.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (match, code) => {
            // Decode HTML entities (optional, but <br> must be replaced)
            return `<pre>${code.replace(/<br\s*\/?>/gi, "\n")}</pre>`;
        });
        // Remove "Continue reading on Medium" links
        content = content.replace(/<a[^>]*>Continue reading on Medium.*?<\/a>/gi, "");
        content = content.replace(/(<hr[^>]*\/?>|\<hr[^>]*>)\s*$/gi, "");
        return content;
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
                <div className="loading__spinner"></div>
                Loading article...
            </div>
        );
    }

    if (!post) {
        return (
            <>
                <Head>
                    <title>Post Not Found — Ali Rıza Aynacı</title>
                </Head>
                <div className="error" style={{ minHeight: "60vh" }}>
                    <p className="error__title">Post not found</p>
                    <p>
                        <Link href="/">← Back to home</Link>
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>{post.title} — Ali Rıza Aynacı</title>
                <meta
                    name="description"
                    content={stripHtml(
                        post.contentSnippet || (fullContent || "")
                    ).substring(0, 160)}
                />
                {/* Force load GitHub Dark theme from CDN to ensure it appears */}
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
                />
            </Head>

            <div className="article-layout">
                {/* Main Article Column */}
                <article className="article">
                    <div className="article__inner">
                        <Link href="/" className="article__back">
                            <span aria-hidden="true">←</span>
                            Back to posts
                        </Link>

                        <time className="article__meta" dateTime={post.pubDate}>
                            {formatDate(post.pubDate)}
                        </time>
                        <h1 className="article__title">{post.title}</h1>

                        {post.categories && post.categories.length > 0 && (
                            <div className="article__tags">
                                {post.categories.map((cat) => (
                                    <span key={cat} className="tag">
                                        {cat.toLowerCase()}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div
                            className="article__content"
                            ref={contentRef}
                            dangerouslySetInnerHTML={{
                                __html: processContent(fullContent || post.content || ""),
                            }}
                        />
                    </div>
                </article>

                <aside className="comments-rail">
                    <div>
                        <div className="article-actions">
                            <button
                                type="button"
                                className={`like-btn ${liked ? "like-btn--liked" : ""}`}
                                onClick={handleLike}
                                disabled={likePending}
                                aria-label={liked ? "Unlike this post" : "Like this post"}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill={liked ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                <span>{likeCount > 0 ? likeCount : ""}</span>
                            </button>

                            <a
                                href={post.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="read-on"
                            >
                                Read on Medium →
                            </a>
                        </div>

                        <h2 className="comments__title">
                            Comments {comments.length > 0 && `(${comments.length})`}
                        </h2>

                        {/* Comment Form */}
                        <form className="comments__form" onSubmit={handleCommentSubmit}>
                            <input
                                type="text"
                                className="comments__input"
                                placeholder="Your name"
                                value={commentName}
                                onChange={(e) => setCommentName(e.target.value)}
                                maxLength={50}
                            />
                            <textarea
                                className="comments__textarea"
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                rows={3}
                                required
                                maxLength={1000}
                            />
                            <button
                                type="submit"
                                className="comments__submit"
                                disabled={!commentText.trim() || commentSubmitting}
                            >
                                {commentSubmitting ? "Posting..." : "Post Comment"}
                            </button>
                        </form>

                        {commentError && (
                            <p className="comments__notice">{commentError}</p>
                        )}

                        {/* Comments List */}
                        {comments.length > 0 && (
                            <div className="comments__list">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="comment">
                                        <div className="comment__head">
                                            <span className="comment__author">{comment.name}</span>
                                            <time className="comment__date">
                                                {formatCommentDate(comment.date)}
                                            </time>
                                        </div>
                                        <p className="comment__text">{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </>
    );
}
