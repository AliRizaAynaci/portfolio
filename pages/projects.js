import Head from "next/head";
import { useState, useEffect } from "react";
import { fetchFeaturedProjects } from "@/lib/github";

function StarIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

function ForkIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="6" cy="3" r="2" />
            <circle cx="6" cy="21" r="2" />
            <circle cx="18" cy="6" r="2" />
            <path d="M18 8v2a4 4 0 0 1-4 4H8a4 4 0 0 0-4 4v1" />
        </svg>
    );
}

function ExternalIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

function ProjectSkeleton() {
    return (
        <div
            className="project project--curated"
            aria-hidden="true"
            style={{ pointerEvents: "none" }}
        >
            <div className="skel skel--text" style={{ width: "34%" }} />
            <div className="skel" style={{ height: 32, marginBottom: 16 }} />
            <div className="skel skel--text" />
            <div className="skel skel--text skel--short" />
        </div>
    );
}

function formatUpdatedDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatMetric(value) {
    return typeof value === "number" ? value.toLocaleString() : null;
}

function ProjectCard({ project }) {
    const updated = formatUpdatedDate(project.updatedAt);
    const stars = formatMetric(project.stars);
    const forks = formatMetric(project.forks);

    return (
        <article className="project project--curated">
            <div className="project__meta-row">
                <span className="project__category">{project.category}</span>
                {stars !== null && (
                    <span className="project__metric project__metric--highlight">
                        <StarIcon />
                        {stars}
                    </span>
                )}
                {forks !== null && (
                    <span className="project__metric project__metric--highlight">
                        <ForkIcon />
                        {forks}
                    </span>
                )}
                {project.achievement && (
                    <span className="project__achievement">
                        {project.achievement}
                    </span>
                )}
            </div>

            <div className="project__head">
                <h2 className="project__title">{project.title}</h2>
            </div>

            <p className="project__desc">{project.description}</p>

            <div className="project__tech" aria-label={`${project.title} tech stack`}>
                {project.stack.map((tech) => (
                    <span key={tech} className="project__tech-badge">
                        {tech}
                    </span>
                ))}
            </div>

            <div className="project__repos" aria-label={`${project.title} repositories`}>
                {project.repos.map((repo) => (
                    <a
                        key={repo.fullName}
                        href={repo.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project__repo-link"
                    >
                        {repo.name}
                    </a>
                ))}
            </div>

            <div className="project__foot">
                {updated && (
                    <span className="project__forks">
                        <CalendarIcon />
                        Updated {updated}
                    </span>
                )}
            </div>

            <div className="project__actions">
                <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project__action"
                >
                    <ExternalIcon />
                    GitHub
                </a>
                {project.liveUrl && (
                    <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project__action project__action--primary"
                    >
                        <ExternalIcon />
                        Live Demo
                    </a>
                )}
            </div>
        </article>
    );
}

export default function Projects() {
    const [projects, setProjects] = useState(null);
    const [error, setError] = useState(false);

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

    return (
        <>
            <Head>
                <title>Projects - Ali Rıza Aynacı</title>
                <meta
                    name="description"
                    content="Curated projects by Ali Rıza Aynacı: open source libraries, backend systems, hackathon projects, and distributed systems demos."
                />
            </Head>

            <div className="page">
                <section className="page-hero">
                    <div className="page-hero__inner">
                        <span className="eyebrow">Projects</span>
                        <h1 className="hero__name project-hero__title">
                            Featured engineering work
                        </h1>
                        <p className="hero__bio">
                            A curated set of open-source, product, hackathon, and
                            distributed-systems projects. Some cards group multiple
                            repositories that belong to the same product or competition
                            build.
                        </p>
                    </div>
                </section>

                <section className="page-section">
                    {projects === null && (
                        <div className="projects-grid" aria-busy="true">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <ProjectSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {projects && projects.length > 0 && (
                        <div className="projects-grid">
                            {projects.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    )}

                    {projects && projects.length === 0 && (
                        <div className="empty">
                            <p>
                                {error
                                    ? "Couldn't load curated project metadata from GitHub."
                                    : "No featured projects found."}
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
