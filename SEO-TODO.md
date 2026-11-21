# SEO backlog — forkzero.ai

Original audit: 2026-03-07 (health score 68/100). Re-checked against the code
and build output on 2026-11-21. Shipped work is recorded in REQ/IMP-WEB-010.

---

## Open

### High

- [ ] **Code-split routes with `React.lazy()`**
  Still one main bundle (now ~328 KB, up from 287 KB) with every page statically
  imported. Giscus is already split out. Lazy-load the Reader, Design System and
  Getting Started pages behind `Suspense`.
  File: `src/App.tsx`

- [ ] **Cross-link blog posts and Getting Started**
  None of the five posts link to each other or to `/lattice/getting-started`.
  Add contextual inline links where posts build on each other, and a "Get
  started" link at the end of each Lattice post.
  File: `src/data/blog-posts.ts`

### Medium

- [ ] **Self-host the Outfit font or drop it**
  Google Fonts CSS is still render-blocking (`index.html`). Outfit is used only
  for the hero brand title (weights 200 and 300). Self-host the WOFF2 files with
  `<link rel="preload">`, or use the system stack.
  Files: `index.html`, `public/fonts/` (new), `src/components/Hero.tsx`

- [ ] **Real `dateModified` for blog posts**
  BlogPosting JSON-LD has `dateModified`, but it always equals `datePublished`.
  Add an optional `updated` field to `BlogPost` and use it when set (several
  posts had editorial passes in November).
  Files: `src/data/blog-posts.ts`, `scripts/prerender.ts`

- [ ] **Expand the author bio and add a photo**
  Strengthens E-E-A-T signals.
  File: `src/data/blog-posts.ts`

- [ ] **Add `width`/`height` and `loading="lazy"` to blog images**
  The `<img>` in `renderInline()` has no dimensions, which can cause layout shift.
  File: `src/pages/BlogPage.tsx` (~line 329)

### Low

- [ ] **Add a `Content-Security-Policy` header** via the CloudFront response
  headers policy. Needs allowances for Giscus, the GitHub API and the subscribe
  endpoint.
  File: `infra/setup-cloudfront.sh`

- [ ] **Create an `/about` page** (company, team, contact) for Trust signals.
  Files: `src/pages/AboutPage.tsx` (new), `src/App.tsx`, `scripts/prerender.ts`

- [ ] **Publish more posts.** Five posts today; aim for 8–12 covering knowledge
  coordination, context engineering and developer tooling.

- [ ] **Add `<link rel="modulepreload">` for the JS bundle.**
  File: `scripts/prerender.ts` or `index.html`

- [ ] **Cache the GitHub star count** in `localStorage` with a TTL. The hero
  fetches `api.github.com` on every load.
  File: `src/components/Hero.tsx`

---

## Done (verified 2026-11-21)

- [x] `og:image`, `og:site_name` and Twitter Card tags on every page (PNG default, per-post overrides)
- [x] `publisher.logo` in BlogPosting schema
- [x] `Cache-Control` headers set in the deploy workflow (immutable assets, short-lived HTML)
- [x] Critical CSS inlined in `index.html`
- [x] Real 404s: pre-rendered `404.html` served by a CloudFront custom error response
- [x] `public/llms.txt`
- [x] `lastmod` on every sitemap URL
- [x] `logo` and `sameAs` on the Organization schema
- [x] Internal links in the homepage noscript fallback
- [x] `author.url` in BlogPosting schema
- [x] Explicit GPTBot, ClaudeBot and PerplexityBot rules in `robots.txt`
- [x] `CollectionPage` schema for `/blog`
