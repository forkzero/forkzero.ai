# forkzero.ai

Landing page and hosted lattice reader for [Forkzero](https://forkzero.ai).

## Projects

- **[Lattice](https://github.com/forkzero/lattice)** — Knowledge coordination protocol for human-agent collaboration
- **[Team of Rivals](https://github.com/forkzero/team-of-rivals-v2)** — Multi-agent debate system
- **[s3proxy](https://github.com/forkzero/s3proxy)** — Streaming S3 proxy

## Hosted Reader

The site includes a hosted lattice reader at `/reader`. Any project that exports `lattice export --format json` can render its documentation here:

```
https://forkzero.ai/reader?url=<your-published-json-url>
```

## Lattice

This repo is tracked with [Lattice](https://github.com/forkzero/lattice). The `.lattice/` directory contains branding strategy and website requirements.

**[View Lattice Documentation](https://forkzero.ai/reader?url=https://forkzero.github.io/forkzero.ai/lattice-data.json)**

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # Production build → dist/
```

## Stack

React 19 + Vite + TypeScript. Inline styles (no CSS framework). Deployed to S3 + CloudFront.
