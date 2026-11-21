# Adding a product

Every Forkzero product is defined once in `src/data/products.ts`. The blog tag
pill, the homepage "Open Source" grid, the Getting Started route, its
pre-rendered HTML and the sitemap entry all derive from that entry.

## Steps

1. **Register the product** in `src/data/products.ts`. Fill in every required
   field. `gettingStartedPath` must be `/{slug}/getting-started` (a test
   enforces this). Take URLs from `src/constants.ts` instead of hardcoding them;
   add new constants there if needed.

2. **Write the Getting Started page** as a component in `src/pages/`, then map
   it in `gettingStartedPages` in `src/App.tsx`:

   ```ts
   const NewProductGettingStartedPage = lazy(() =>
     import('./pages/NewProductGettingStartedPage').then((m) => ({ default: m.NewProductGettingStartedPage })),
   )

   export const gettingStartedPages: Record<string, LazyExoticComponent<ComponentType>> = {
     lattice: GettingStartedPage,
     newproduct: NewProductGettingStartedPage,
   }
   ```

   `App.test.ts` fails if a registered product has no page here. Pages are
   lazy-loaded, so define it with `lazy()` like the existing entries, and add
   its source file to `PAGE_SOURCES` in `scripts/prerender.ts` as
   `'getting-started:{slug}'`. The build fails if it is missing, because the
   pre-rendered page needs a `modulepreload` link for its chunk.

3. **Check the pre-rendered output.** `scripts/prerender.ts` picks up the new
   route, title (`Get Started with {name} — Forkzero`), description, JSON-LD and
   sitemap entry automatically. Its noscript fallback is generic (name and
   `gettingStartedDescription`); add a product-specific block in
   `buildNoscript()` if crawlers should see install steps.

4. **Homepage grid (optional).** Set `showOnHomepage: true` to list the product
   in the "Open Source" grid. Products come first, in registry order, so the
   first one is the featured card. Open-source projects without a product page
   stay in `otherProjects` in `src/data/projects.ts`.

5. **Blog posts.** Tag posts with `product: '{slug}'` in
   `src/data/blog-posts.ts` to show the product pill.

6. **CloudFront.** The URL rewrite function (`infra/cloudfront-url-rewrite.js`)
   serves `/{path}/index.html` for clean URLs, so new routes need no edge change.

7. **Lattice.** Record the work as a requirement and implementation in
   `.lattice/`, then run `make pre-commit`.
