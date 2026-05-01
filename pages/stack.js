import Head from "next/head";

const STACK_GROUPS = [
    {
        title: "Languages",
        items: [
            { name: "Go", primary: true },
            { name: "Java" },
            { name: "JavaScript" },
            { name: "C++" },
            { name: "C" },
        ],
    },
    {
        title: "Backend",
        items: [
            { name: "Spring Boot" },
            { name: "Fiber" },
            { name: "REST API" },
            { name: "WebSockets" },
            { name: "gRPC" },
            { name: "OAuth2" },
            { name: "JWT" },
        ],
    },
    {
        title: "Data",
        items: [
            { name: "Redis", primary: true },
            { name: "PostgreSQL", primary: true },
            { name: "SQL" },
            { name: "NoSQL" },
            { name: "Kafka" },
            { name: "MongoDB" },
        ],
    },
    {
        title: "Architecture",
        items: [
            { name: "Hexagonal" },
            { name: "Onion" },
            { name: "CQRS" },
            { name: "Rate Limiting" },
            { name: "Consistent Hashing" },
        ],
    },
    {
        title: "Delivery",
        items: [
            { name: "Docker" },
            { name: "GitHub Actions" },
            { name: "Prometheus" },
            { name: "Grafana" },
            { name: "Vercel" },
            { name: "Heroku" },
            { name: "Linux" },
            { name: "Git" },
        ],
    },
    {
        title: "Frontend (occasional)",
        items: [
            { name: "Next.js" },
            { name: "React" },
        ],
    },
];

export default function StackPage() {
    const total = STACK_GROUPS.reduce((acc, g) => acc + g.items.length, 0);
    return (
        <>
            <Head>
                <title>Stack — The Aynacı Quarterly</title>
                <meta
                    name="description"
                    content="Tools, languages, and infrastructure Ali Rıza Aynacı reaches for on backend and distributed-systems work."
                />
            </Head>

            <main className="page">
                <header className="section-head">
                    <div>
                        <div className="mono-label section-head__kicker">Section D · Stack</div>
                        <h1 className="section-head__title">Tools of the Trade</h1>
                    </div>
                    <div className="section-head__count">{total} entries</div>
                </header>

                <p className="section-lede">
                    A current snapshot of what I reach for on backend, data, and
                    distributed-systems work. Items in <em>solid ink</em> are the
                    daily-drivers; the rest rotate by project.
                </p>

                <div className="stack-grid">
                    {STACK_GROUPS.map((group) => (
                        <div key={group.title} className="stack-group">
                            <div className="mono-label stack-group__title">{group.title}</div>
                            <div className="stack-group__items">
                                {group.items.map((item) => (
                                    <span
                                        key={item.name}
                                        className={`stack-pill ${item.primary ? "stack-pill--primary" : ""}`}
                                    >
                                        {item.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
}
