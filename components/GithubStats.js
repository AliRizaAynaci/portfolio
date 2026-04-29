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

const CACHE_PREFIX = "portfolio:github-stats:";
const METRIC_KEYS = ["followers", "following", "publicRepos", "totalStars"];

function isMetricValue(value) {
    return typeof value === "number" && Number.isFinite(value);
}

function hasUsableStats(data) {
    return METRIC_KEYS.some((key) => isMetricValue(data?.[key]) && data[key] > 0);
}

function formatMetric(value) {
    return isMetricValue(value) ? value.toLocaleString() : "—";
}

function fallbackStats(username) {
    return {
        username,
        htmlUrl: `https://github.com/${username}`,
        topLanguages: [],
    };
}

function readCachedStats(cacheKey) {
    try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        return hasUsableStats(parsed) ? { ...parsed, stale: true } : null;
    } catch (error) {
        console.warn("Failed to read cached GitHub stats:", error);
        return null;
    }
}

function writeCachedStats(cacheKey, data) {
    if (!hasUsableStats(data)) return;

    try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
        console.warn("Failed to cache GitHub stats:", error);
    }
}

export default function GithubStats({ username = process.env.NEXT_PUBLIC_GITHUB_USERNAME }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchStats() {
            if (!username) {
                setLoading(false);
                return;
            }

            const cacheKey = `${CACHE_PREFIX}${username}`;
            const cachedStats = readCachedStats(cacheKey);

            if (cachedStats) {
                setStats(cachedStats);
                setLoading(false);
            } else {
                setLoading(true);
            }

            try {
                const res = await fetch(
                    `/api/github-stats?username=${encodeURIComponent(username)}`
                );
                if (!res.ok) throw new Error("Failed");

                const data = await res.json();
                if (cancelled) return;

                if (hasUsableStats(data)) {
                    setStats(data);
                    writeCachedStats(cacheKey, data);
                } else if (!cachedStats) {
                    setStats({ ...fallbackStats(username), ...data });
                }
            } catch (e) {
                console.error(e);
                if (!cancelled && !cachedStats) {
                    setStats(fallbackStats(username));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchStats();

        return () => {
            cancelled = true;
        };
    }, [username]);

    const title = (
        <h3 className="section-title">
            <span>GitHub Stats</span>
            {stats?.htmlUrl && (
                <a
                    href={stats.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-link widget-link"
                    aria-label="Open GitHub profile"
                >
                    <ExternalIcon />
                </a>
            )}
        </h3>
    );

    if (loading) {
        return (
            <div className="github-stats loading-skeleton">
                <h3 className="section-title">
                    <span>GitHub Stats</span>
                </h3>
                <div className="github-stats__skeleton"></div>
            </div>
        );
    }

    if (!stats) return null;

    const profileUrl = stats.htmlUrl || `https://github.com/${stats.username || username}`;
    const metrics = [
        ["Followers", stats.followers],
        ["Following", stats.following],
        ["Repos", stats.publicRepos],
        ["Stars", stats.totalStars],
    ];

    return (
        <div className="github-stats">
            {title}

            <div className="github-card">
                <div className="github-header">
                    <div className="github-avatar">
                        {stats.avatar && (
                            <img
                                src={stats.avatar}
                                alt={`${stats.username} GitHub avatar`}
                                loading="lazy"
                            />
                        )}
                    </div>
                    <div className="github-info">
                        <span className="github-username">@{stats.username}</span>
                        {stats.bio && <span className="github-bio">{stats.bio}</span>}
                    </div>
                </div>

                <div className="github-metrics">
                    {metrics.map(([label, value]) => (
                        <div className="metric-item" key={label}>
                            <span className="metric-value">
                                {formatMetric(value)}
                            </span>
                            <span className="metric-label">{label}</span>
                        </div>
                    ))}
                </div>

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

                <div className="github-contributions">
                    <a
                        href={profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="github-view-btn"
                    >
                        View Profile
                        <ExternalIcon />
                    </a>
                </div>
            </div>
        </div>
    );
}
