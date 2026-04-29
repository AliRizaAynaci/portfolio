import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "@/lib/theme";

const NAV = [
    { href: "/", label: "Blog" },
    { href: "/projects", label: "Projects" },
    { href: "/about", label: "About" },
];

export default function Header() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const isActive = (path) => {
        if (path === "/") {
            return router.pathname === "/" || router.pathname.startsWith("/blog");
        }
        return router.pathname === path || router.pathname.startsWith(path + "/");
    };

    return (
        <header className="header">
            <div className="header__inner">
                <Link href="/" className="header__logo" aria-label="Home">
                    <img src="/logo.png" alt="" />
                    <span>aynacialiriza</span>
                </Link>

                <div className="header__right">
                    <nav>
                        <ul className="header__nav">
                            {NAV.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={isActive(item.href) ? "active" : ""}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                    >
                        {theme === "light" ? (
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        ) : (
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="4.5" />
                                <line x1="12" y1="2" x2="12" y2="4" />
                                <line x1="12" y1="20" x2="12" y2="22" />
                                <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
                                <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                                <line x1="2" y1="12" x2="4" y2="12" />
                                <line x1="20" y1="12" x2="22" y2="12" />
                                <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
                                <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
