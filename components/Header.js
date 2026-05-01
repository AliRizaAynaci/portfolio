import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";

const NAV = [
    { href: "/",         label: "Front" },
    { href: "/writing",  label: "Writing" },
    { href: "/projects", label: "Projects" },
    { href: "/stack",    label: "Stack" },
    { href: "/about",    label: "About" },
    { href: "/letters",  label: "Letters" },
];

const ISSUE_NUMBER = 37;
const VOL = "VOL. III";

function formatLongDate(d) {
    const day = d.toLocaleDateString("en-US", { weekday: "long" });
    const month = d.toLocaleDateString("en-US", { month: "long" });
    return `${day}, ${month} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function Header() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [today, setToday] = useState(null);

    useEffect(() => {
        setToday(new Date());
    }, []);

    const isActive = (href) => {
        if (href === "/")        return router.pathname === "/";
        if (href === "/writing") {
            return router.pathname === "/writing" ||
                router.pathname.startsWith("/writing/") ||
                router.pathname.startsWith("/blog");
        }
        return router.pathname === href || router.pathname.startsWith(href + "/");
    };

    const editionLabel = (() => {
        if (!today) return "EVE. ED.";
        const h = today.getHours();
        if (h < 5)  return "NIGHT ED.";
        if (h < 12) return "MORN. ED.";
        if (h < 18) return "DAY ED.";
        return "EVE. ED.";
    })();

    return (
        <>
            <header className="masthead">
                <div className="masthead__row">
                    <div className="masthead__meta">
                        <span><strong>{VOL}</strong> &nbsp;·&nbsp; <strong>NO. {ISSUE_NUMBER}</strong></span>
                        <span>{today ? formatLongDate(today).toUpperCase() : ""}</span>
                    </div>

                    <Link href="/" className="masthead__title-wrap" aria-label="Home" style={{ textAlign: "center" }}>
                        <h1 className="masthead__title">The Aynacı Quarterly</h1>
                        <div className="masthead__sub">
                            Backend &nbsp;·&nbsp; Distributed Systems &nbsp;·&nbsp; Occasional Opinions
                        </div>
                    </Link>

                    <div className="masthead__actions">
                        <button
                            type="button"
                            className="action-chip"
                            onClick={() => {
                                const evt = new CustomEvent("aq:open-search");
                                window.dispatchEvent(evt);
                            }}
                            aria-label="Search"
                        >
                            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="11" cy="11" r="7" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <span>Search</span>
                            <span className="action-chip__kbd">⌘K</span>
                        </button>

                        <button
                            type="button"
                            className="action-chip"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                        >
                            <span>{editionLabel}</span>
                        </button>
                    </div>
                </div>
            </header>

            <nav className="topnav" aria-label="Primary">
                <div className="topnav__inner">
                    <ul className="topnav__list">
                        {NAV.map((item, idx) => (
                            <li key={item.href} style={{ display: "inline-flex", alignItems: "center" }}>
                                <Link
                                    href={item.href}
                                    className={`topnav__link ${isActive(item.href) ? "is-active" : ""}`}
                                >
                                    {item.label}
                                </Link>
                                {idx < NAV.length - 1 && (
                                    <span className="topnav__sep" aria-hidden="true">·</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </>
    );
}
