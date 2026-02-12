# aynacialiriza — Personal Blog & Portfolio

A personal blog and portfolio site built with Next.js. Aggregates content from Medium, GitHub, LeetCode, and YouTube into a single, clean interface with dark/light theme support.

## Features

- **Blog** — Automatically fetches and renders articles from Medium via RSS. Includes full-article view with syntax highlighting (Highlight.js, Darcula theme).
- **Projects** — Displays pinned GitHub repositories with language breakdown, star count, and fork info.
- **GitHub Stats** — Shows profile metrics (followers, repos, stars) and top languages by repo count.
- **LeetCode Stats** — Displays solved problem count by difficulty with a visual progress bar and global ranking.
- **About** — Static page with background, highlights, tech stack, and contact links.
- **Dark / Light Theme** — Toggle with persisted preference via `localStorage`.

## Tech Stack

- **Framework:** Next.js 16 (Pages Router)
- **Language:** JavaScript (React 19)
- **Styling:** Vanilla CSS
- **Syntax Highlighting:** Highlight.js
- **Deployment:** Vercel

## Project Structure

```
├── components/
│   ├── Header.js          # Navigation bar with theme toggle
│   ├── Footer.js          # Site footer with social links
│   ├── GithubStats.js     # GitHub profile stats widget
│   ├── LeetCodeStats.js   # LeetCode stats widget
│   └── TechStack.js       # Tech stack display
├── lib/
│   ├── github.js          # GitHub API helpers
│   ├── medium.js          # Medium RSS parser
│   ├── youtube.js         # YouTube data helpers
│   └── theme.js           # Theme context provider
├── pages/
│   ├── api/
│   │   ├── github-pinned.js
│   │   ├── github-stats.js
│   │   ├── leetcode.js
│   │   ├── medium.js
│   │   └── youtube.js
│   ├── blog/
│   │   └── [slug].js      # Dynamic blog post page
│   ├── index.js            # Home — blog feed
│   ├── projects.js         # Pinned repositories
│   └── about.js            # About page
├── styles/
│   ├── globals.css
│   └── stats.css
└── public/
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## API Routes

All external data is fetched through internal API routes under `/api` to avoid CORS issues on the client side:

| Route | Source | Description |
|---|---|---|
| `/api/medium` | Medium RSS | Fetches and parses blog posts |
| `/api/github-stats` | GitHub API | Profile stats and top languages |
| `/api/github-pinned` | GitHub API | Pinned repository data |
| `/api/leetcode` | LeetCode API | Problem solve counts and ranking |
| `/api/youtube` | YouTube API | Latest video data |

## Deployment

The site is designed to run on [Vercel](https://vercel.com). Push to `main` and Vercel handles the rest — no additional configuration needed.

```bash
npm run build
```

## License

This project is for personal use.
