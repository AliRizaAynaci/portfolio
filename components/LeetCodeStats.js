import { useEffect, useState } from "react";

function ExternalIcon() {
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
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <path d="M15 3h6v6" />
            <path d="M10 14L21 3" />
        </svg>
    );
}

export default function LeetCodeStats({ username = process.env.NEXT_PUBLIC_LEETCODE_USERNAME }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            if (!username) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/leetcode?username=${username}`);
                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                setStats(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [username]);

    if (loading) {
        return (
            <div className="leetcode-stats loading-skeleton">
                <h3 className="section-title">
                    <span>LeetCode Stats</span>
                </h3>
                <div className="leetcode-stats__skeleton"></div>
            </div>
        );
    }

    if (!stats) return null;

    const totalSolved = Number(stats.totalSolved || 0);
    const progressBase = totalSolved || 1;
    const profileUrl = `https://leetcode.com/${username}/`;
    const difficulties = [
        {
            key: "easy",
            label: "Easy",
            solved: Number(stats.easySolved || 0),
            total: Number(stats.easyTotal || 0),
        },
        {
            key: "medium",
            label: "Medium",
            solved: Number(stats.mediumSolved || 0),
            total: Number(stats.mediumTotal || 0),
        },
        {
            key: "hard",
            label: "Hard",
            solved: Number(stats.hardSolved || 0),
            total: Number(stats.hardTotal || 0),
        },
    ];

    return (
        <div className="leetcode-stats">
            <h3 className="section-title">
                <span>LeetCode Stats</span>
                <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leetcode-link widget-link"
                    aria-label="Open LeetCode profile"
                >
                    <ExternalIcon />
                </a>
            </h3>

            <div className="leetcode-card">
                <div className="leetcode-header">
                    <div className="leetcode-total">
                        <span className="leetcode-total__count">{totalSolved}</span>
                        <span className="leetcode-total__label">Solved</span>
                    </div>
                    <div className="leetcode-rank">
                        <span className="leetcode-rank__label">Ranking</span>
                        <span className="leetcode-rank__val">
                            {stats.ranking
                                ? Number(stats.ranking).toLocaleString()
                                : "N/A"}
                        </span>
                    </div>
                </div>

                <div className="leetcode-progress">
                    <div className="progress-bar">
                        {difficulties.map((difficulty) =>
                            difficulty.solved > 0 ? (
                                <div
                                    key={difficulty.key}
                                    className={`progress-segment ${difficulty.key}`}
                                    style={{
                                        width: `${(difficulty.solved / progressBase) * 100}%`,
                                    }}
                                    title={`${difficulty.label}: ${difficulty.solved}`}
                                ></div>
                            ) : null
                        )}
                    </div>
                </div>

                <div className="leetcode-details">
                    {difficulties.map((difficulty) => (
                        <div className="stat-item" key={difficulty.key}>
                            <span className={`stat-label ${difficulty.key}-text`}>
                                {difficulty.label}
                            </span>
                            <span className="stat-value">
                                {difficulty.solved}
                                <span className="stat-total">/{difficulty.total}</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
