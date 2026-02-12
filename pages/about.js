import Head from "next/head";

export default function About() {
    return (
        <>
            <Head>
                <title>About — Ali Rıza Aynacı</title>
                <meta
                    name="description"
                    content="Ali Rıza Aynacı — Computer Engineering student, backend developer, open source contributor. Based in Kocaeli, Turkey."
                />
            </Head>

            <main>
                <section className="about">
                    <div className="container">
                        <h1 className="about__title">About Me</h1>

                        <div className="about__content">
                            <p>
                                I&apos;m a 3rd-year Computer Engineering student at Erciyes University,
                                based in Kocaeli, Turkey. I focus on backend development with Go,
                                distributed systems, and building scalable infrastructure.
                            </p>

                            <p>
                                Currently, I lead the Activities &amp; Events Department at the Erciyes
                                University Software Technologies Club. Previously, I served as the
                                Embedded Software Lead for our TEKNOFEST Rocket Team, where I engineered
                                real-time flight software processing telemetry data from multiple sensors.
                            </p>

                            <p>
                                I enjoy writing about the topics I explore — from rate limiting
                                algorithms to Redis sharding strategies to Go concurrency
                                patterns. You can find my articles on{" "}
                                <a
                                    href="https://medium.com/@aynacialiriza"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Medium
                                </a>
                                .
                            </p>

                            <h2 className="about__section-title">Highlights</h2>
                            <ul className="about__list">
                                <li>
                                    🏆 NASA Space Apps Challenge 2025 — Global Nominee (Top 11% among
                                    114,000+ participants)
                                </li>
                                <li>
                                    ⭐ GoRL — Open source rate limiting library in Go with 97+ stars
                                </li>
                                <li>
                                    🚀 RLaaS — Rate Limiting as a Service platform (Go, Redis,
                                    Next.js)
                                </li>
                                <li>
                                    💻 309+ LeetCode problems solved (55%+ Medium/Hard)
                                </li>
                            </ul>

                            <h2 className="about__section-title">Tech Stack</h2>
                            <ul className="about__list">
                                <li>Languages: Go, Java, JavaScript/TypeScript, C</li>
                                <li>Backend: Fiber, Spring Boot, REST APIs, gRPC</li>
                                <li>Databases: Redis, PostgreSQL</li>
                                <li>DevOps: Docker, GitHub Actions, Vercel, Heroku</li>
                                <li>Other: OAuth2, JWT, Consistent Hashing, Rate Limiting Algorithms</li>
                            </ul>

                            <h2 className="about__section-title">Get in Touch</h2>
                            <ul className="about__list">
                                <li>
                                    📧{" "}
                                    <a href="mailto:aynacialiriza@gmail.com">
                                        aynacialiriza@gmail.com
                                    </a>
                                </li>
                                <li>
                                    🔗{" "}
                                    <a
                                        href="https://linkedin.com/in/alirizaaynaci"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        linkedin.com/in/alirizaaynaci
                                    </a>
                                </li>
                                <li>
                                    🐙{" "}
                                    <a
                                        href="https://github.com/AliRizaAynaci"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        github.com/AliRizaAynaci
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
