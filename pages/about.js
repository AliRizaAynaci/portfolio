import Head from "next/head";

function Icon({ children }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

const highlights = [
    {
        title: "NASA Space Apps Global Nominee",
        body: "Built with a competition team that reached the global nominee stage in 2025.",
        icon: (
            <Icon>
                <path d="M12 3l2.7 5.47 6.03.88-4.36 4.25 1.03 6-5.4-2.84-5.4 2.84 1.03-6-4.36-4.25 6.03-.88L12 3z" />
            </Icon>
        ),
    },
    {
        title: "GoRL",
        body: "Maintains an open source Go rate limiting library shaped around practical backend workloads.",
        icon: (
            <Icon>
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
            </Icon>
        ),
    },
    {
        title: "RLaaS",
        body: "Designed a rate limiting service with Go, Redis, and a Next.js interface.",
        icon: (
            <Icon>
                <path d="M4 13a8 8 0 0 1 16 0" />
                <path d="M12 13l4-4" />
                <path d="M5 19h14" />
                <path d="M7 16h10" />
            </Icon>
        ),
    },
    {
        title: "Software Technologies Club",
        body: "Leads activities and events for students exploring software engineering at Erciyes University.",
        icon: (
            <Icon>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </Icon>
        ),
    },
];

const stackGroups = [
    {
        title: "Languages",
        items: ["Go", "Java", "JavaScript", "C++", "C"],
    },
    {
        title: "Backend",
        items: [
            "Spring Boot",
            "Fiber",
            "REST API",
            "WebSockets",
            "gRPC",
            "OAuth2",
            "JWT",
        ],
    },
    {
        title: "Data",
        items: [
            "Redis",
            "PostgreSQL",
            "SQL",
            "NoSQL",
            "Kafka",
        ],
    },
    {
        title: "Concepts & Architecture",
        items: [
            "Hexagonal Architecture",
            "Onion Architecture",
            "CQRS",
            "Rate Limiting",
            "Consistent Hashing",
        ],
    },
    {
        title: "Delivery",
        items: [
            "Docker",
            "GitHub Actions",
            "Prometheus & Grafana",
            "Vercel",
            "Heroku",
            "Linux",
            "Git & GitHub",
        ],
    },
];

const contacts = [
    {
        label: "Email",
        value: "aynacialiriza@gmail.com",
        href: "mailto:aynacialiriza@gmail.com",
        icon: (
            <Icon>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
            </Icon>
        ),
    },
    {
        label: "LinkedIn",
        value: "linkedin.com/in/alirizaaynaci",
        href: "https://linkedin.com/in/alirizaaynaci",
        icon: (
            <Icon>
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
            </Icon>
        ),
    },
    {
        label: "GitHub",
        value: "github.com/AliRizaAynaci",
        href: "https://github.com/AliRizaAynaci",
        icon: (
            <Icon>
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </Icon>
        ),
    },
    {
        label: "Medium",
        value: "medium.com/@aynacialiriza",
        href: "https://medium.com/@aynacialiriza",
        icon: (
            <Icon>
                <circle cx="7" cy="12" r="5" />
                <ellipse cx="17" cy="12" rx="3" ry="5" />
                <path d="M22 7v10" />
            </Icon>
        ),
    },
];

const heroLinks = [
    {
        label: "GitHub",
        href: "https://github.com/AliRizaAynaci",
        icon: contacts[2].icon,
    },
    {
        label: "Writing",
        href: "https://medium.com/@aynacialiriza",
        icon: contacts[3].icon,
    },
    {
        label: "Email",
        href: "mailto:aynacialiriza@gmail.com",
        icon: contacts[0].icon,
    },
];

export default function About() {
    return (
        <>
            <Head>
                <title>About - Ali Rıza Aynacı</title>
                <meta
                    name="description"
                    content="Ali Rıza Aynacı - Computer Engineering student, backend developer, and open source contributor based in Kocaeli, Turkey."
                />
            </Head>

            <main className="page">
                <section className="about-hero">
                    <div>
                        <span className="eyebrow">About</span>
                        <h1 className="hero__name">
                            Backend-focused Computer Engineering student
                        </h1>
                        <div className="about-prose">
                            <p>
                                I&apos;m a 3rd-year Computer Engineering student at Erciyes
                                University, based in Kocaeli, Turkey. I focus on Go,
                                distributed systems, and infrastructure that stays simple
                                under pressure.
                            </p>
                            <p>
                                I lead the Activities &amp; Events Department at the Erciyes
                                University Software Technologies Club. Before that, I worked
                                as Embedded Software Lead for our TEKNOFEST Rocket Team,
                                building real-time flight software around telemetry from
                                multiple sensors.
                            </p>
                            <p>
                                I also write about the systems I study and build: rate
                                limiting algorithms, Redis sharding strategies, Go
                                concurrency patterns, and the small engineering decisions
                                that make backend services easier to operate.
                            </p>
                        </div>

                        <div className="hero__links about-hero__links">
                            {heroLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target={link.href.startsWith("http") ? "_blank" : undefined}
                                    rel={
                                        link.href.startsWith("http")
                                            ? "noopener noreferrer"
                                            : undefined
                                    }
                                    className="iconlink"
                                >
                                    {link.icon}
                                    <span>{link.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="about-hero__avatar" aria-hidden="true">
                        <img src="/logo.png" alt="" />
                    </div>
                </section>

                <section className="about-section">
                    <header className="section-head">
                        <div className="section-head__main">
                            <span className="eyebrow">Highlights</span>
                            <h2 className="section-head__title">Work with a clear backend bias</h2>
                        </div>
                    </header>

                    <div className="highlights-grid">
                        {highlights.map((item) => (
                            <article key={item.title} className="highlight">
                                <span className="highlight__icon">{item.icon}</span>
                                <h3 className="highlight__title">{item.title}</h3>
                                <p className="highlight__body">{item.body}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="about-section">
                    <header className="section-head">
                        <div className="section-head__main">
                            <span className="eyebrow">Stack</span>
                            <h2 className="section-head__title">Tools I reach for often</h2>
                        </div>
                    </header>

                    <div className="about-stack-grid">
                        {stackGroups.map((group) => (
                            <article key={group.title} className="about-stack__group">
                                <h3 className="about-stack__title">{group.title}</h3>
                                <div className="about-stack__items">
                                    {group.items.map((item) => (
                                        <span key={item} className="about-stack__item">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="about-section page-section">
                    <header className="section-head">
                        <div className="section-head__main">
                            <span className="eyebrow">Contact</span>
                            <h2 className="section-head__title">Where to find me</h2>
                        </div>
                    </header>

                    <div className="contact-grid">
                        {contacts.map((contact) => (
                            <a
                                key={contact.label}
                                href={contact.href}
                                target={contact.href.startsWith("http") ? "_blank" : undefined}
                                rel={
                                    contact.href.startsWith("http")
                                        ? "noopener noreferrer"
                                        : undefined
                                }
                                className="contact-card"
                            >
                                <span className="contact-card__icon">{contact.icon}</span>
                                <span className="contact-card__body">
                                    <span className="contact-card__label">
                                        {contact.label}
                                    </span>
                                    <span className="contact-card__value">
                                        {contact.value}
                                    </span>
                                </span>
                            </a>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}
