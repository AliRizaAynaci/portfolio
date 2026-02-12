import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "@/lib/theme";

export default function Header() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const isActive = (path) => {
        if (path === "/") return router.pathname === "/";
        return router.pathname.startsWith(path);
    };

    return (
        <header className="header">
            <div className="header__inner">
                <Link href="/" className="header__logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                    aynacialiriza
                </Link>

                <div className="header__right">
                    <nav>
                        <ul className="header__nav">
                            <li>
                                <Link href="/" className={isActive("/") ? "active" : ""}>
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/projects"
                                    className={isActive("/projects") ? "active" : ""}
                                >
                                    Projects
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    className={isActive("/about") ? "active" : ""}
                                >
                                    About
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                    >
                        <div className="theme-toggle__track">
                            <div className="theme-toggle__thumb">
                                {theme === "light" ? (
                                    // Sun icon
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="5" />
                                        <line x1="12" y1="1" x2="12" y2="3" />
                                        <line x1="12" y1="21" x2="12" y2="23" />
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                        <line x1="1" y1="12" x2="3" y2="12" />
                                        <line x1="21" y1="12" x2="23" y2="12" />
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                    </svg>
                                ) : (
                                    // Moon icon
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
}
