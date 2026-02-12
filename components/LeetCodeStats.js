import { useEffect, useState } from "react";

export default function LeetCodeStats({ username = process.env.NEXT_PUBLIC_LEETCODE_USERNAME }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
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
                <h3 className="section-title">LeetCode Stats</h3>
                <div className="leetcode-stats__skeleton"></div>
            </div>
        );
    }

    if (!stats) return null;

    const easyPercent = (stats.easySolved / stats.totalSolved) * 100;
    const mediumPercent = (stats.mediumSolved / stats.totalSolved) * 100;
    const hardPercent = (stats.hardSolved / stats.totalSolved) * 100;

    return (
        <div className="leetcode-stats">
            <h3 className="section-title">
                LeetCode Stats
                <a
                    href={`https://leetcode.com/${username}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="leetcode-link"
                >
                    ↗
                </a>
            </h3>

            <div className="leetcode-card">
                <div className="leetcode-header">
                    <div className="leetcode-total">
                        <span className="leetcode-total__count">{stats.totalSolved}</span>
                        <span className="leetcode-total__label">Solved</span>
                    </div>
                    <div className="leetcode-rank">
                        <span className="leetcode-rank__label">Ranking</span>
                        <span className="leetcode-rank__val">
                            {stats.ranking.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="leetcode-progress">
                    <div className="progress-bar">
                        {stats.easySolved > 0 && (
                            <div
                                className="progress-segment easy"
                                style={{ width: `${easyPercent}%` }}
                                title={`Easy: ${stats.easySolved}`}
                            ></div>
                        )}
                        {stats.mediumSolved > 0 && (
                            <div
                                className="progress-segment medium"
                                style={{ width: `${mediumPercent}%` }}
                                title={`Medium: ${stats.mediumSolved}`}
                            ></div>
                        )}
                        {stats.hardSolved > 0 && (
                            <div
                                className="progress-segment hard"
                                style={{ width: `${hardPercent}%` }}
                                title={`Hard: ${stats.hardSolved}`}
                            ></div>
                        )}
                    </div>
                </div>

                <div className="leetcode-details">
                    <div className="stat-item">
                        <span className="stat-label easy-text">Easy</span>
                        <span className="stat-value">
                            {stats.easySolved}
                            <span className="stat-total">/{stats.easyTotal}</span>
                        </span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label medium-text">Medium</span>
                        <span className="stat-value">
                            {stats.mediumSolved}
                            <span className="stat-total">/{stats.mediumTotal}</span>
                        </span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label hard-text">Hard</span>
                        <span className="stat-value">
                            {stats.hardSolved}
                            <span className="stat-total">/{stats.hardTotal}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
