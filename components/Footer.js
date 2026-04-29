const LINKS = [
    { label: "GitHub", href: "https://github.com/AliRizaAynaci" },
    { label: "LinkedIn", href: "https://linkedin.com/in/alirizaaynaci" },
    { label: "Medium", href: "https://medium.com/@aynacialiriza" },
    { label: "YouTube", href: "https://www.youtube.com/@aynacialiriza" },
    { label: "Email", href: "mailto:aynacialiriza@gmail.com" },
];

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__brand">
                    <span>© {new Date().getFullYear()} Ali Rıza Aynacı</span>
                </div>
                <nav aria-label="Social links">
                    <div className="footer__links">
                        {LINKS.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target={link.href.startsWith("http") ? "_blank" : undefined}
                                rel={
                                    link.href.startsWith("http")
                                        ? "noopener noreferrer"
                                        : undefined
                                }
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </nav>
            </div>
        </footer>
    );
}
