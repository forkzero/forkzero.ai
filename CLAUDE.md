# CLAUDE.md

Instructions for Claude Code when working in this repository.

## Project Overview

**forkzero.ai** — Marketing website for Forkzero. React 19 + Vite + TypeScript SPA. Hosted on S3 (`forkzero-web-prod`) + CloudFront.

## Development Commands

```bash
# Install dependencies
npm ci

# Dev server
npm run dev

# Pre-commit gate (ALWAYS run before committing)
make pre-commit

# Pre-push gate (ALWAYS run before pushing)
make pre-push
```

**Important**: Always run `make pre-commit` before any commit and `make pre-push` before any push. This matches what CI checks and prevents push-then-fix cycles.

## Branding

- "Forkzero" in prose, "FORKZERO" in logo (FORK bold, ZERO thin)
- Never "ForkZero"

## Shared Constants

Install URLs and commands are defined in `src/constants.ts`. Import from there rather than hardcoding URLs.
