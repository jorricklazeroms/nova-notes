# Nova Notes v0.1

[![CI](https://github.com/jorrick/nova-notes/actions/workflows/ci.yml/badge.svg)](https://github.com/jorrick/nova-notes/actions/workflows/ci.yml)

## Pitch
Nova Notes is a lightweight OSS markdown notes app focused on speed and reliability: write in markdown, preview instantly, organize with tags, and keep everything local.

## Screenshots
- `docs/screenshots/editor-preview.png` (placeholder)
- `docs/screenshots/notes-list.png` (placeholder)
- `docs/screenshots/import-export.png` (placeholder)

## Features (OSS)
- Split view markdown editor + preview
- Notes list with title and `updatedAt`
- Tags with normalization (trim/lowercase/deduplicate)
- Local persistence in browser storage
- Export selected note as `.md`
- Import `.md` files (frontmatter supported)

## Pro Roadmap (No Pro code in this repo)
- End-to-end encryption and optional sync backends
- Full-text search across notes
- Shared workspaces and comments
- Version history and diff view

## Tech
- React 18 + Vite + TypeScript (strict)
- ESLint
- Vitest

## Local Development
```bash
npm install
npm run dev
```

## Quality Checks
```bash
npm run lint
npm test
npm run build
```

## License
MIT
