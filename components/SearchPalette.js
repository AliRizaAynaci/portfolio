import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { fetchMediumPosts, toEditorialPost } from "@/lib/medium";
import { fetchFeaturedProjects } from "@/lib/github";

function rankItem(item, query) {
    const q = query.toLowerCase();
    const haystack = `${item.title} ${item.subtitle || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
    if (!q) return 0;
    if (haystack.includes(q)) return 1;
    return -1;
}

export default function SearchPalette() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIdx, setActiveIdx] = useState(0);
    const [posts, setPosts] = useState([]);
    const [projects, setProjects] = useState([]);
    const inputRef = useRef(null);

    // Mount-time: subscribe to open events + ⌘K
    useEffect(() => {
        const onOpen = () => setOpen(true);
        const onKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen((v) => !v);
            } else if (e.key === "Escape") {
                setOpen(false);
            }
        };
        window.addEventListener("aq:open-search", onOpen);
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("aq:open-search", onOpen);
            window.removeEventListener("keydown", onKey);
        };
    }, []);

    // Lazy-load index when first opened
    useEffect(() => {
        if (!open || posts.length || projects.length) return;
        (async () => {
            try {
                const [raw, projs] = await Promise.all([
                    fetchMediumPosts(),
                    fetchFeaturedProjects(),
                ]);
                setPosts((raw || []).map(toEditorialPost));
                setProjects(projs || []);
            } catch (e) {
                /* ignore */
            }
        })();
    }, [open, posts.length, projects.length]);

    // Focus on open
    useEffect(() => {
        if (open) {
            setActiveIdx(0);
            setQuery("");
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    const items = useMemo(() => {
        const all = [
            ...posts.map((p) => ({
                kind: "Writing",
                title: p.title,
                subtitle: p.excerpt,
                tags: p.tags,
                href: { pathname: `/writing/${p.slug}`, query: { guid: p.guid || p.link } },
            })),
            ...projects.map((p) => ({
                kind: "Project",
                title: p.title,
                subtitle: p.description || p.desc,
                tags: p.stack,
                href: p.githubUrl || p.repos?.[0]?.githubUrl,
                external: true,
            })),
        ];
        const ranked = all
            .map((it) => ({ it, score: rankItem(it, query) }))
            .filter((r) => r.score >= 0)
            .map((r) => r.it);
        return query ? ranked.slice(0, 12) : all.slice(0, 8);
    }, [posts, projects, query]);

    const navigate = (item) => {
        if (!item) return;
        setOpen(false);
        if (item.external && typeof item.href === "string") {
            window.open(item.href, "_blank", "noopener,noreferrer");
        } else if (item.href) {
            router.push(item.href);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx((i) => Math.min(items.length - 1, i + 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx((i) => Math.max(0, i - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            navigate(items[activeIdx]);
        }
    };

    if (!open) return null;

    return (
        <div className="palette__overlay" role="dialog" aria-modal="true" onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
        }}>
            <div className="palette">
                <input
                    ref={inputRef}
                    className="palette__input"
                    placeholder="Search writing and projects…"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
                    onKeyDown={onKeyDown}
                />
                {items.length === 0 ? (
                    <div className="palette__empty">No matches</div>
                ) : (
                    <div className="palette__list">
                        {items.map((it, idx) => (
                            <button
                                key={`${it.kind}-${it.title}-${idx}`}
                                type="button"
                                className={`palette__item ${idx === activeIdx ? "is-active" : ""}`}
                                onMouseEnter={() => setActiveIdx(idx)}
                                onClick={() => navigate(it)}
                            >
                                <span className="palette__item-kind">{it.kind}</span>
                                <span className="palette__item-title">{it.title}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
