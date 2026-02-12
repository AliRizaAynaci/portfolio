import Head from "next/head";
import { useState, useEffect } from "react";
import { fetchPinnedRepos, languageColors } from "@/lib/github";

export default function Projects() {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadRepos() {
            try {
                const data = await fetchPinnedRepos();
                setRepos(data);
            } catch (err) {
                console.error("Error loading repos:", err);
            } finally {
                setLoading(false);
            }
        }
        loadRepos();
    }, []);

    return (
        <>
            <Head>
                <title>Projects — Ali Rıza Aynacı</title>
                <meta
                    name="description"
                    content="Pinned open source projects by Ali Rıza Aynacı. Go libraries, backend services, and more."
                />
            </Head>

            <main>
                <section className="section" style={{ paddingTop: "48px" }}>
                    <div className="container container--wide">
                        <h1 className="section__title" style={{ fontSize: "28px", marginBottom: "8px" }}>
                            Projects
                        </h1>
                        <p
                            style={{
                                color: "var(--text-secondary)",
                                fontSize: "15px",
                                marginBottom: "32px",
                            }}
                        >
                            Pinned repositories from my GitHub profile.
                        </p>

                        {loading && (
                            <div className="loading">
                                <div className="loading__spinner"></div>
                                Loading projects...
                            </div>
                        )}

                        {!loading && repos.length > 0 && (
                            <div className="projects-grid">
                                {repos.map((repo) => (
                                    <a
                                        key={repo.id}
                                        href={repo.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="project-card"
                                        style={{ textDecoration: "none", color: "inherit" }}
                                    >
                                        <div className="project-card__header">
                                            <span className="project-card__name">{repo.name}</span>
                                            {repo.stargazers_count > 0 && (
                                                <span className="project-card__stars">
                                                    ★ {repo.stargazers_count}
                                                </span>
                                            )}
                                        </div>
                                        <p className="project-card__desc">
                                            {repo.description || "No description available."}
                                        </p>
                                        <div className="project-card__meta">
                                            {repo.language && (
                                                <span className="project-card__lang">
                                                    <span
                                                        className="project-card__lang-dot"
                                                        style={{
                                                            backgroundColor:
                                                                languageColors[repo.language] || "#888",
                                                        }}
                                                    ></span>
                                                    {repo.language}
                                                </span>
                                            )}
                                            {repo.forks_count > 0 && (
                                                <span
                                                    style={{
                                                        fontSize: "12px",
                                                        color: "var(--text-muted)",
                                                    }}
                                                >
                                                    🍴 {repo.forks_count}
                                                </span>
                                            )}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}

                        {!loading && repos.length === 0 && (
                            <div className="error">
                                <p className="error__title">Couldn&apos;t load projects</p>
                                <p>Please try again later.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}
