# DevLog

**Developer micro-blogging.** Share TILs, code snippets, and dev notes with markdown rendering and syntax highlighting.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Status: Backburner.** Functional but not actively marketed. Good starting point for a dev content platform.

## Quick Start

```bash
git clone https://github.com/SpencerStiles/devlog
cd devlog
pnpm install && pnpm prisma generate && pnpm prisma migrate dev
cp .env.example .env.local
pnpm dev
```

## Features

- Markdown posts with GFM (tables, task lists, strikethrough)
- Syntax highlighting with GitHub Dark theme
- Tags, author profiles, likes, view tracking
- Pinned posts and live preview editor

## Tech Stack

Next.js 14 · TypeScript · Prisma · SQLite · Tailwind CSS

## License

MIT
