import { useEffect, useState } from "react";

export default function GithubStats({ username = process.env.NEXT_PUBLIC_GITHUB_USERNAME }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch(`/api/github-stats?username=${username}`);
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
            <div className="github-stats loading-skeleton">
                <h3 className="section-title">GitHub Stats</h3>
                <div className="github-stats__skeleton"></div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="github-stats">
            <h3 className="section-title">
                GitHub Stats
                <a
                    href={stats.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-link"
                >
                    ↗
                </a>
            </h3>

            <div className="github-card">
                <div className="github-header">
                    <div className="github-avatar">
                        {stats.avatar && <img src={stats.avatar} alt={stats.username} />}
                    </div>
                    <div className="github-info">
                        <span className="github-username">@{stats.username}</span>
                        <span className="github-bio">{stats.bio}</span>
                    </div>
                </div>

                {/* Top 4 Metrics */}
                <div className="github-metrics" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="metric-item">
                        <span className="metric-value">{stats.followers}</span>
                        <span className="metric-label">Followers</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-value">{stats.following}</span>
                        <span className="metric-label">Following</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-value">{stats.publicRepos}</span>
                        <span className="metric-label">Repos</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-value">{stats.totalStars}</span>
                        <span className="metric-label">Total Stars</span>
                    </div>
                </div>

                {/* Top Languages */}
                {stats.topLanguages && stats.topLanguages.length > 0 && (
                    <div className="github-langs">
                        <h4 className="subset-title">Top Languages (by Repo Count)</h4>
                        <div className="lang-progress">
                            {stats.topLanguages.map((lang) => (
                                <div
                                    key={lang.name}
                                    className="lang-segment"
                                    style={{
                                        flex: lang.count,
                                        backgroundColor: lang.color
                                    }}
                                    title={`${lang.name}: ${lang.count} repos`}
                                ></div>
                            ))}
                        </div>
                        <div className="lang-list">
                            {stats.topLanguages.slice(0, 4).map((lang) => (
                                <div key={lang.name} className="lang-item">
                                    <span
                                        className="lang-dot"
                                        style={{ backgroundColor: lang.color }}
                                    ></span>
                                    <span className="lang-name">{lang.name}</span>
                                    <span className="lang-percent">{lang.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="github-contributions" style={{ marginTop: 'auto' }}>
                    <a href={stats.htmlUrl} target="_blank" className="github-view-btn">View Profile</a>
                </div>
            </div>
        </div>
    );
}
