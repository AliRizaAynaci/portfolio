import Head from "next/head";
import { useState, useEffect, useMemo } from "react";
import { fetchFeaturedProjects } from "@/lib/github";

function StarIcon() {
    return (
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

function ForkIcon() {
    return (
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="6" cy="3" r="2" />
            <circle cx="6" cy="21" r="2" />
            <circle cx="18" cy="6" r="2" />
            <path d="M18 8v2a4 4 0 0 1-4 4H8a4 4 0 0 0-4 4v1" />
        </svg>
    );
}

function ProjectCard({ project }) {
    const stars = typeof project.stars === "number" ? project.stars.toLocaleString() : null;
    const forks = typeof project.forks === "number" ? project.forks.toLocaleString() : null;
    const primaryRepo = project.repos?.[0];
    const githubUrl = project.githubUrl || primaryRepo?.githubUrl;

    return (
        <article className="proj-card">
            <div className="proj-card__head">
                <span className="proj-card__cat">{project.category}</span>
                <div className="proj-card__metrics">
                    {stars !== null && <span><StarIcon />{stars}</span>}
                    {forks !== null && <span><ForkIcon />{forks}</span>}
                </div>
            </div>

            <h2 className="proj-card__title">{project.title}</h2>
            <p className="proj-card__desc">{project.description}</p>

            {project.stack?.length > 0 && (
                <div className="proj-card__stack">
                    {project.stack.map((s) => (
                        <span key={s} className="proj-card__tag">{s}</span>
                    ))}
                </div>
            )}

            <div className="proj-card__foot">
                <span>
                    {project.achievement
                        ? project.achievement
                        : project.repos?.length > 1
                            ? `${project.repos.length} repos`
                            : "GitHub"}
                </span>
                {githubUrl && (
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                        Repo →
                    </a>
                )}
            </div>
        </article>
    );
}

export default function Projects() {
    const [projects, setProjects] = useState(null);
    const [error, setError] = useState(false);
    const [activeCat, setActiveCat] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchFeaturedProjects();
                setProjects(data || []);
            } catch (err) {
                console.error("Error loading projects:", err);
                setError(true);
                setProjects([]);
            }
        }
        load();
    }, []);

    const categories = useMemo(() => {
        if (!projects) return [];
        const counts = new Map();
        projects.forEach((p) => counts.set(p.category, (counts.get(p.category) || 0) + 1));
        return [...counts.entries()];
    }, [projects]);

    const filtered = useMemo(() => {
        if (!projects) return [];
        if (!activeCat) return projects;
        return projects.filter((p) => p.category === activeCat);
    }, [projects, activeCat]);

    return (
        <>
            <Head>
                <title>Projects — The Aynacı Quarterly</title>
                <meta
                    name="description"
                    content="Open source libraries, backend systems, hackathon projects, and distributed-systems demos by Ali Rıza Aynacı."
                />
            </Head>

            <main className="page">
                <header className="section-head">
                    <div>
                        <div className="mono-label section-head__kicker">Section C · Projects</div>
                        <h1 className="section-head__title">The Workshop</h1>
                    </div>
                    <div className="section-head__count">
                        {filtered.length} of {projects?.length || 0} pieces
                    </div>
                </header>

                <p className="section-lede">
                    Curated open-source, product, and hackathon work. Some entries
                    bundle several repositories that belong to the same competition or
                    product build.
                </p>

                {categories.length > 0 && (
                    <div className="field-filters" style={{ marginTop: 20 }}>
                        <div className="tag-chips">
                            <button
                                type="button"
                                className={`tag-chip ${!activeCat ? "is-active" : ""}`}
                                onClick={() => setActiveCat(null)}
                            >
                                All <span className="tag-chip__count">· {projects?.length || 0}</span>
                            </button>
                            {categories.map(([cat, count]) => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`tag-chip ${activeCat === cat ? "is-active" : ""}`}
                                    onClick={() => setActiveCat(activeCat === cat ? null : cat)}
                                >
                                    {cat} <span className="tag-chip__count">· {count}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {projects === null && (
                    <div className="projects-grid" aria-busy="true">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="proj-card">
                                <div className="proj-card__skel" />
                            </div>
                        ))}
                    </div>
                )}

                {projects && filtered.length > 0 && (
                    <div className="projects-grid">
                        {filtered.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}

                {projects && filtered.length === 0 && (
                    <div className="field-empty">
                        {error
                            ? "Couldn't load curated project metadata from GitHub."
                            : "No projects match that filter."}
                    </div>
                )}
            </main>
        </>
    );
}
