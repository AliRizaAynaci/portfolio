import Head from "next/head";
import Link from "next/link";

const HIGHLIGHTS = [
    {
        title: "NASA Space Apps Global Nominee",
        body: "Built with a competition team that reached the global nominee stage in 2025.",
    },
    {
        title: "GoRL — Open Source",
        body: "Maintains an open-source Go rate-limiting library shaped around practical backend workloads.",
    },
    {
        title: "RLaaS",
        body: "Designed a rate-limiting service with Go, Redis, PostgreSQL, and a Next.js dashboard.",
    },
    {
        title: "Software Technologies Club",
        body: "Led activities and events for students exploring software engineering at Erciyes University.",
    },
];

export default function About() {
    return (
        <>
            <Head>
                <title>About — The Aynacı Quarterly</title>
                <meta
                    name="description"
                    content="About Ali Rıza Aynacı — Computer Engineering student, backend developer, and open-source contributor."
                />
            </Head>

            <main className="page">
                <header className="section-head">
                    <div>
                        <div className="mono-label section-head__kicker">Section E · About</div>
                        <h1 className="section-head__title">The Author</h1>
                    </div>
                    <div className="section-head__count">Backend · Distributed</div>
                </header>

                <section className="about">
                    <div className="about__main">
                        <p>
                            Ali Rıza Aynacı is a third-year Computer Engineering student
                            at Erciyes University and a backend engineer based in Kayseri,
                            Turkey. He focuses on Go, distributed systems, and
                            infrastructure that stays simple under pressure.
                        </p>
                        <p>
                            He led the Activities &amp; Events Department at the Erciyes
                            University Software Technologies Club. Before that he served
                            as Embedded Software Lead for the TEKNOFEST Rocket Team,
                            building real-time flight software around telemetry from
                            multiple sensors.
                        </p>

                        <h2>On the work</h2>
                        <p>
                            Most of what appears in this paper starts from trying to
                            understand how software infrastructure behaves when real users,
                            traffic, and failure modes meet the design. Recurring themes
                            include Redis sharding strategies, Go concurrency patterns,
                            backend reliability, and the small engineering decisions that
                            make services easier to operate.
                        </p>
                        <p>
                            Open to backend / distributed-systems work, full-time or
                            contract — see the <Link href="/letters">letters</Link> page
                            for the slow channel and direct contacts.
                        </p>
                    </div>

                    <aside className="about-side">
                        <div className="about-side__block">
                            <div className="mono-label about-side__title">Particulars</div>
                            <div className="about-side__list">
                                <div className="about-side__item">
                                    <span>Role</span>
                                    <div>Backend Engineer</div>
                                </div>
                                <div className="about-side__item">
                                    <span>Based</span>
                                    <div>Kayseri, TR (UTC+3)</div>
                                </div>
                                <div className="about-side__item">
                                    <span>Edu</span>
                                    <div>Erciyes Univ. — Computer Eng.</div>
                                </div>
                                <div className="about-side__item">
                                    <span>Status</span>
                                    <div>Open to opportunities</div>
                                </div>
                            </div>
                        </div>

                        <div className="about-side__block">
                            <div className="mono-label about-side__title">Find me</div>
                            <div className="about-side__list">
                                <div className="about-side__item">
                                    <span>Email</span>
                                    <a href="mailto:aynacialiriza@gmail.com">aynacialiriza@gmail.com</a>
                                </div>
                                <div className="about-side__item">
                                    <span>GitHub</span>
                                    <a href="https://github.com/AliRizaAynaci" target="_blank" rel="noopener noreferrer">@AliRizaAynaci</a>
                                </div>
                                <div className="about-side__item">
                                    <span>LinkedIn</span>
                                    <a href="https://linkedin.com/in/alirizaaynaci" target="_blank" rel="noopener noreferrer">/in/alirizaaynaci</a>
                                </div>
                                <div className="about-side__item">
                                    <span>Medium</span>
                                    <a href="https://medium.com/@aynacialiriza" target="_blank" rel="noopener noreferrer">@aynacialiriza</a>
                                </div>
                                <div className="about-side__item">
                                    <span>YouTube</span>
                                    <a href="https://www.youtube.com/@aynacialiriza" target="_blank" rel="noopener noreferrer">@aynacialiriza</a>
                                </div>
                            </div>
                        </div>

                        <div className="about-side__block">
                            <div className="mono-label about-side__title">Notable</div>
                            <div className="about-highlights">
                                {HIGHLIGHTS.map((h) => (
                                    <article key={h.title} className="about-highlight">
                                        <h3 className="about-highlight__title">{h.title}</h3>
                                        <p className="about-highlight__body">{h.body}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </aside>
                </section>
            </main>
        </>
    );
}
