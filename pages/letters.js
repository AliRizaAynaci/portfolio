import Head from "next/head";
import { useState } from "react";

const DIRECT = [
    { label: "Email",    value: "aynacialiriza@gmail.com",   href: "mailto:aynacialiriza@gmail.com" },
    { label: "GitHub",   value: "@AliRizaAynaci",            href: "https://github.com/AliRizaAynaci" },
    { label: "LinkedIn", value: "/in/alirizaaynaci",         href: "https://linkedin.com/in/alirizaaynaci" },
    { label: "Medium",   value: "@aynacialiriza",            href: "https://medium.com/@aynacialiriza" },
    { label: "YouTube",  value: "@aynacialiriza",            href: "https://www.youtube.com/@aynacialiriza" },
];

export default function Letters() {
    const [name, setName] = useState("");
    const [from, setFrom] = useState("");
    const [body, setBody] = useState("");
    const [website, setWebsite] = useState(""); // honeypot
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!from.trim() || !body.trim() || submitting) return;
        setSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, from, body, website }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Could not send letter");
            }
            setSent(true);
        } catch (err) {
            setError(err.message || "Could not send letter");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Head>
                <title>Letters — The Aynacı Quarterly</title>
                <meta
                    name="description"
                    content="Open to backend gigs, distributed-systems consulting, technical reviews, and a well-argued disagreement."
                />
            </Head>

            <main className="page">
                <header className="section-head">
                    <div>
                        <div className="mono-label section-head__kicker">Section F · Letters</div>
                        <h1 className="section-head__title">Correspondence</h1>
                    </div>
                </header>

                <p className="section-lede">
                    Open to backend gigs, distributed-systems consulting, technical
                    reviews, and a well-argued disagreement. Letters typeset as
                    received; selected ones may appear in a future edition.
                </p>

                <section className="letters">
                    {sent ? (
                        <div className="letters__form">
                            <div className="mono-label letters__form-head">Write a letter</div>
                            <div className="letters__success">
                                Letter received. I&apos;ll write back from{" "}
                                <strong style={{ fontStyle: "normal" }}>aynacialiriza@gmail.com</strong> —
                                usually within a few days.
                            </div>
                        </div>
                    ) : (
                        <form className="letters__form" onSubmit={handleSubmit} noValidate>
                            <div className="mono-label letters__form-head">Write a letter</div>

                            <input
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={80}
                                aria-label="Your name"
                            />
                            <input
                                type="email"
                                placeholder="Return address (email)"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                required
                                maxLength={200}
                                aria-label="Return email"
                            />
                            <input
                                type="text"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                tabIndex={-1}
                                autoComplete="off"
                                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                                aria-hidden="true"
                            />
                            <textarea
                                placeholder="Dear A.R.A., …"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                required
                                maxLength={4000}
                                aria-label="Letter body"
                            />

                            <div className="letters__form-foot">
                                <button
                                    type="submit"
                                    className="letters__submit"
                                    disabled={!from.trim() || !body.trim() || submitting}
                                >
                                    {submitting ? "Sending…" : "Post →"}
                                </button>
                            </div>

                            {error && (
                                <div style={{ padding: "10px 20px", color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.06em" }}>
                                    {error}
                                </div>
                            )}
                        </form>
                    )}

                    <div>
                        <div className="mono-label letters__direct-head">Or reach out directly</div>
                        <div className="letters__direct">
                            {DIRECT.map((row) => (
                                <div key={row.label} className="letters__direct-row">
                                    <span>{row.label}</span>
                                    <a
                                        href={row.href}
                                        target={row.href.startsWith("http") ? "_blank" : undefined}
                                        rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                    >
                                        {row.value}
                                    </a>
                                </div>
                            ))}
                        </div>

                        <div className="letters__status">
                            <div className="mono-label letters__status-title">Status</div>
                            <div className="letters__status-body">
                                ● Open to backend / distributed-systems work, full-time or
                                contract. Based in Kayseri (UTC+3), comfortable with remote
                                and partial overlap.
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
