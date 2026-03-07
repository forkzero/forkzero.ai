/**
 * Pre-render script: generates static HTML for all routes after vite build.
 * Also generates sitemap.xml from the route list.
 * Run via: npx tsx scripts/prerender.ts
 *
 * Reads dist/index.html as a template, injects route-specific <title>, <meta>,
 * OG tags, JSON-LD structured data, and a <noscript> fallback for crawlers.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { blogPosts } from '../src/data/blog-posts.js'
import { projects } from '../src/data/projects.js'
import { INSTALL_CMD, GITHUB_REPO_URL } from '../src/constants.js'

const distDir = join(import.meta.dirname, '..', 'dist')
const template = readFileSync(join(distDir, 'index.html'), 'utf-8')

interface RouteMeta {
  path: string
  title: string
  description: string
  canonical: string
}

const routes: RouteMeta[] = [
  {
    path: '/blog',
    title: 'Blog — Forkzero',
    description: 'Technical writing on knowledge coordination, context engineering, and AI-first developer tooling.',
    canonical: 'https://forkzero.ai/blog',
  },
  ...blogPosts.map((post) => ({
    path: `/blog/${post.slug}`,
    title: `${post.title} — Forkzero`,
    description: post.excerpt,
    canonical: `https://forkzero.ai/blog/${post.slug}`,
  })),
  {
    path: '/getting-started',
    title: 'Getting Started — Forkzero',
    description: 'Install Lattice and start building a knowledge-coordinated codebase in under five minutes.',
    canonical: 'https://forkzero.ai/getting-started',
  },
  // Homepage last — it overwrites dist/index.html (template is already in memory)
  {
    path: '/',
    title: 'Forkzero — Knowledge Coordination for AI-Native Teams',
    description:
      'Forkzero builds developer tools that connect research, strategy, requirements, and implementation into a traversable knowledge graph.',
    canonical: 'https://forkzero.ai/',
  },
]

for (const route of routes) {
  let html = template

  // Replace <title>
  html = html.replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)

  // Replace meta description
  html = html.replace(
    /<meta name="description" content=".*?".*?\/?>/,
    `<meta name="description" content="${escapeAttr(route.description)}" />`,
  )

  // og:type — 'article' only for /blog/{slug}, 'website' for everything else
  const ogType = /^\/blog\/.+/.test(route.path) ? 'article' : 'website'

  // Add OG tags and canonical
  const seoTags = [
    `<meta property="og:title" content="${escapeAttr(route.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(route.description)}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:url" content="${route.canonical}" />`,
    `<meta property="og:image" content="https://forkzero.ai/og-default.svg" />`,
    `<meta property="og:site_name" content="Forkzero" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(route.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(route.description)}" />`,
    `<meta name="twitter:image" content="https://forkzero.ai/og-default.svg" />`,
    `<link rel="canonical" href="${route.canonical}" />`,
  ].join('\n    ')

  // Inject JSON-LD structured data
  const jsonLd = buildJsonLd(route)

  html = html.replace('</head>', `    ${seoTags}\n    ${jsonLd}\n  </head>`)

  // Inject content for crawlers via <noscript>
  const noscript = buildNoscript(route)
  if (noscript) {
    html = html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript}`)
  }

  // Write output — homepage goes to dist/index.html, others to dist/<route>/index.html
  if (route.path === '/') {
    writeFileSync(join(distDir, 'index.html'), html)
  } else {
    const outDir = join(distDir, route.path.slice(1))
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true })
    }
    writeFileSync(join(outDir, 'index.html'), html)
  }
  console.log(`Pre-rendered: ${route.path}`)
}

// --- Generate sitemap.xml ---
// Note: <changefreq> and <priority> are ignored by Google and omitted per best practice.
const sitemapUrls: { loc: string; lastmod?: string }[] = [
  { loc: 'https://forkzero.ai/' },
  { loc: 'https://forkzero.ai/getting-started' },
  { loc: 'https://forkzero.ai/blog' },
  ...blogPosts.map((post) => ({
    loc: `https://forkzero.ai/blog/${post.slug}`,
    lastmod: post.date,
  })),
]

const sitemapXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapUrls.map((u) => {
    const lastmod = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''
    return `  <url>\n    <loc>${u.loc}</loc>${lastmod}\n  </url>`
  }),
  '</urlset>',
  '',
].join('\n')

writeFileSync(join(distDir, 'sitemap.xml'), sitemapXml)
console.log('Generated: /sitemap.xml')

// --- Noscript fallback builder ---

function buildNoscript(route: RouteMeta): string | null {
  const wrap = (inner: string) =>
    `<noscript><div style="max-width:800px;margin:0 auto;padding:2rem;font-family:sans-serif">${inner}</div></noscript>`

  if (route.path === '/') {
    const projectList = projects
      .map((p) => `<li><strong>${esc(p.name)}</strong> — ${esc(p.tagline)}: ${esc(p.description)}</li>`)
      .join('\n')
    return wrap(
      [
        `<h1>Forkzero — Knowledge Coordination for AI-Native Teams</h1>`,
        `<p>Connect research, strategy, requirements, and implementation into a traversable knowledge graph.</p>`,
        `<h2>Why Forkzero</h2>`,
        `<ul>`,
        `<li>Every decision traces back to its source</li>`,
        `<li>Agents and humans share the same knowledge layer</li>`,
        `<li>Context stays structured, not scattered</li>`,
        `</ul>`,
        `<h2>Projects</h2>`,
        `<ul>${projectList}</ul>`,
      ].join(''),
    )
  }

  if (route.path === '/getting-started') {
    return wrap(
      [
        `<h1>Getting Started with Lattice</h1>`,
        `<h2>Install</h2>`,
        `<pre><code>${esc(INSTALL_CMD)}</code></pre>`,
        `<h2>Quick Start</h2>`,
        `<ol>`,
        `<li>Install Lattice with the command above</li>`,
        `<li>Run <code>lattice init --skill</code> to initialize your project</li>`,
        `<li>Start adding knowledge nodes to build your graph</li>`,
        `</ol>`,
      ].join(''),
    )
  }

  if (route.path === '/blog') {
    const listHtml = blogPosts
      .map((p) => `<article><h2><a href="/blog/${p.slug}">${esc(p.title)}</a></h2><p>${esc(p.excerpt)}</p></article>`)
      .join('\n')
    return wrap(`<h1>Blog</h1>${listHtml}`)
  }

  // Blog post
  const post = blogPosts.find((p) => `/blog/${p.slug}` === route.path)
  if (post) {
    const articleHtml = [
      `<article style="max-width:800px;margin:0 auto;padding:2rem;font-family:sans-serif">`,
      `<h1>${esc(post.title)}</h1>`,
      `<p><em>${post.date} · ${esc(post.author.name)}</em></p>`,
      contentToHtml(post.content),
      `</article>`,
    ].join('')
    return `<noscript>${articleHtml}</noscript>`
  }

  return null
}

// --- JSON-LD builder ---

function buildJsonLd(route: RouteMeta): string {
  const schemas: Record<string, unknown>[] = []

  if (route.path === '/') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Forkzero',
      url: 'https://forkzero.ai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://forkzero.ai/logo.svg',
      },
      sameAs: ['https://github.com/forkzero'],
      description:
        'Forkzero builds developer tools that connect research, strategy, requirements, and implementation into a traversable knowledge graph.',
    })
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Forkzero',
      url: 'https://forkzero.ai',
    })
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Lattice',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'macOS, Linux, Windows',
      description:
        'Knowledge coordination protocol that connects research, strategy, requirements, and implementation into a traversable knowledge graph.',
      url: GITHUB_REPO_URL,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    })
  }

  if (route.path === '/blog') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Blog — Forkzero',
      description: route.description,
      url: route.canonical,
    })
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://forkzero.ai/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://forkzero.ai/blog' },
      ],
    })
  }

  if (/^\/blog\/.+/.test(route.path)) {
    const post = blogPosts.find((p) => `/blog/${p.slug}` === route.path)
    if (post) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        image: 'https://forkzero.ai/og-default.svg',
        author: {
          '@type': 'Person',
          name: post.author.name,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Forkzero',
          url: 'https://forkzero.ai',
          logo: {
            '@type': 'ImageObject',
            url: 'https://forkzero.ai/logo.svg',
          },
        },
        mainEntityOfPage: route.canonical,
      })
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://forkzero.ai/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://forkzero.ai/blog' },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: route.canonical,
          },
        ],
      })
    }
  }

  if (route.path === '/getting-started') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Getting Started — Forkzero',
      description: route.description,
      url: route.canonical,
    })
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://forkzero.ai/' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Getting Started',
          item: 'https://forkzero.ai/getting-started',
        },
      ],
    })
  }

  if (schemas.length === 0) return ''

  return schemas.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n    ')
}

// --- Utility functions ---

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function contentToHtml(content: string): string {
  return content
    .split('\n\n')
    .map((block) => {
      if (block.startsWith('## ')) return `<h2>${esc(block.slice(3))}</h2>`
      if (block.startsWith('```')) {
        const code = block.replace(/```\w*\n?/, '').replace(/\n```$/, '')
        return `<pre><code>${esc(code)}</code></pre>`
      }
      if (block.startsWith('- ')) {
        const items = block.split('\n').filter((l) => l.startsWith('- '))
        return `<ul>${items.map((l) => `<li>${esc(l.slice(2))}</li>`).join('')}</ul>`
      }
      return `<p>${esc(block)}</p>`
    })
    .join('\n')
}
