export default function TechStack() {
    const stacks = [
        {
            name: "Go",
            icon: "https://www.vectorlogo.zone/logos/golang/golang-ar21.svg",
        },
        {
            name: "Fiber",
            icon: "https://raw.githubusercontent.com/gofiber/docs/master/static/img/logo.svg",
        },
        {
            name: "Java",
            icon: "https://www.vectorlogo.zone/logos/java/java-ar21.svg",
        },
        {
            name: "C++",
            icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/cplusplus/cplusplus-original.svg",
        },
        {
            name: "PostgreSQL",
            icon: "https://www.vectorlogo.zone/logos/postgresql/postgresql-ar21.svg",
        },
        {
            name: "Redis",
            icon: "https://www.vectorlogo.zone/logos/redis/redis-ar21.svg",
        },
        {
            name: "MongoDB",
            icon: "https://www.vectorlogo.zone/logos/mongodb/mongodb-ar21.svg",
        },
        {
            name: "Kafka",
            icon: "https://www.vectorlogo.zone/logos/apache_kafka/apache_kafka-ar21.svg",
        },
        {
            name: "gRPC",
            icon: "https://grpc.io/img/logos/grpc-icon-color.png",
        },
        {
            name: "Spring",
            icon: "https://www.vectorlogo.zone/logos/springio/springio-ar21.svg",
        },
        {
            name: "Next.js",
            icon: "https://www.vectorlogo.zone/logos/nextjs/nextjs-ar21.svg",
        },
        {
            name: "Docker",
            icon: "https://www.vectorlogo.zone/logos/docker/docker-ar21.svg",
        },
        {
            name: "Git",
            icon: "https://www.vectorlogo.zone/logos/git-scm/git-scm-ar21.svg"
        },
        {
            name: "Linux",
            icon: "https://www.vectorlogo.zone/logos/linux/linux-ar21.svg"
        },
        {
            name: "GitHub",
            icon: "https://www.vectorlogo.zone/logos/github/github-ar21.svg"
        },
        {
            name: "Heroku",
            icon: "https://www.vectorlogo.zone/logos/heroku/heroku-ar21.svg"
        },
        {
            name: "Vercel",
            icon: "https://www.vectorlogo.zone/logos/vercel/vercel-ar21.svg"
        }
    ];

    return (
        <div className="tech-stack">
            <h3 className="section-title">Tech Stack</h3>
            <div className="tech-stack__grid">
                {stacks.map((tech) => (
                    <div key={tech.name} className="tech-item" title={tech.name}>
                        <div className="tech-item__icon">
                            <img src={tech.icon} alt={tech.name} loading="lazy" />
                        </div>
                        {/* Some logos have text included (ar21), but keep name for accessibility/tooltip or if image fails. 
                However, user prompt shows only logos. Let's keep names small or hide if needed. 
                The current CSS shows names. The provided logos are mostly "Wordmark" logos (ar21), so text might be redundant.
                But let's keep it for uniformity as some are just icons (C++, gRPC).
            */}
                        {/* <span className="tech-item__name">{tech.name}</span> */}
                    </div>
                ))}
            </div>
        </div>
    );
}
