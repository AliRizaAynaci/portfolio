export default function TechStack() {
    const stacks = [
        {
            name: "Go",
            group: "Language",
            icon: "https://www.vectorlogo.zone/logos/golang/golang-ar21.svg",
        },
        {
            name: "Fiber",
            group: "Backend",
            icon: "https://raw.githubusercontent.com/gofiber/docs/master/static/img/logo.svg",
        },
        {
            name: "Java",
            group: "Language",
            icon: "https://www.vectorlogo.zone/logos/java/java-ar21.svg",
        },
        {
            name: "C++",
            group: "Language",
            icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/cplusplus/cplusplus-original.svg",
        },
        {
            name: "PostgreSQL",
            group: "Database",
            icon: "https://www.vectorlogo.zone/logos/postgresql/postgresql-ar21.svg",
        },
        {
            name: "Redis",
            group: "Database",
            icon: "https://www.vectorlogo.zone/logos/redis/redis-ar21.svg",
        },
        {
            name: "MongoDB",
            group: "Database",
            icon: "https://www.vectorlogo.zone/logos/mongodb/mongodb-ar21.svg",
        },
        {
            name: "Kafka",
            group: "Streaming",
            icon: "https://www.vectorlogo.zone/logos/apache_kafka/apache_kafka-ar21.svg",
        },
        {
            name: "Prometheus",
            group: "Observability",
            icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/prometheus/prometheus-original.svg",
        },
        {
            name: "Grafana",
            group: "Observability",
            icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/grafana/grafana-original.svg",
        },
        {
            name: "gRPC",
            group: "Backend",
            icon: "https://grpc.io/img/logos/grpc-icon-color.png",
        },
        {
            name: "Spring",
            group: "Backend",
            icon: "https://www.vectorlogo.zone/logos/springio/springio-ar21.svg",
        },
        {
            name: "Next.js",
            group: "Frontend",
            icon: "https://www.vectorlogo.zone/logos/nextjs/nextjs-ar21.svg",
        },
        {
            name: "Docker",
            group: "DevOps",
            icon: "https://www.vectorlogo.zone/logos/docker/docker-ar21.svg",
        },
        {
            name: "Git",
            group: "Tooling",
            icon: "https://www.vectorlogo.zone/logos/git-scm/git-scm-ar21.svg",
        },
        {
            name: "Linux",
            group: "Platform",
            icon: "https://www.vectorlogo.zone/logos/linux/linux-ar21.svg",
        },
        {
            name: "GitHub",
            group: "Tooling",
            icon: "https://www.vectorlogo.zone/logos/github/github-ar21.svg",
        },
        {
            name: "Heroku",
            group: "Platform",
            icon: "https://www.vectorlogo.zone/logos/heroku/heroku-ar21.svg",
        },
        {
            name: "Vercel",
            group: "Platform",
            icon: "https://www.vectorlogo.zone/logos/vercel/vercel-ar21.svg",
        },
    ];

    return (
        <section className="tech-stack" aria-labelledby="tech-stack-title">
            <h3 className="section-title" id="tech-stack-title">
                <span>Tech Stack</span>
                <span className="widget-kicker">{stacks.length}</span>
            </h3>
            <div className="tech-stack__grid" role="list">
                {stacks.map((tech) => (
                    <div
                        key={tech.name}
                        className="tech-item"
                        title={`${tech.name} - ${tech.group}`}
                        role="listitem"
                        aria-label={`${tech.name}, ${tech.group}`}
                    >
                        <div className="tech-item__icon">
                            <img src={tech.icon} alt="" loading="lazy" />
                        </div>
                        <span className="tech-item__name">{tech.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
