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
import { INSTALL_CMD, GITHUB_REPO_URL, GITHUB_ORG_URL } from '../src/constants.js'

const distDir = join(import.meta.dirname, '..', 'dist')
const template = readFileSync(join(distDir, 'index.html'), 'utf-8')

interface RouteMeta {
  path: string
  title: string
  description: string
  canonical: string
  ogImage?: string
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
    ogImage: post.ogImage,
  })),
  {
    path: '/getting-started',
    title: 'Get Started with Lattice — Forkzero',
    description: 'Install Lattice and start building a knowledge-coordinated codebase in under five minutes.',
    canonical: 'https://forkzero.ai/getting-started',
  },
  {
    path: '/reader',
    title: 'Lattice Dashboard — Forkzero',
    description:
      'Interactive viewer for Lattice knowledge graphs. Explore sources, theses, requirements, and implementations.',
    canonical: 'https://forkzero.ai/reader',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy — Forkzero',
    description: 'Forkzero privacy policy. How we handle your data.',
    canonical: 'https://forkzero.ai/privacy',
  },
  // Homepage last — it overwrites dist/index.html (template is already in memory)
  {
    path: '/',
    title: 'Lattice by Forkzero — Knowledge Graph for AI-Native Teams',
    description:
      'Lattice captures the research, decisions, and requirements behind your code in a Git-native knowledge graph. Any collaborator — human or AI — picks up where the last one left off.',
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

  // og:image — per-route override, otherwise site default
  const ogImageUrl = `https://forkzero.ai${route.ogImage ?? '/og-default.png'}`

  // Add OG tags and canonical
  const seoTags = [
    `<meta property="og:title" content="${escapeAttr(route.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(route.description)}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:url" content="${route.canonical}" />`,
    `<meta property="og:image" content="${ogImageUrl}" />`,
    `<meta property="og:site_name" content="Forkzero" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(route.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(route.description)}" />`,
    `<meta name="twitter:image" content="${ogImageUrl}" />`,
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

// --- Generate 404.html ---
{
  let html404 = template
  html404 = html404.replace(/<title>.*?<\/title>/, '<title>Page not found — Forkzero</title>')
  html404 = html404.replace(
    /<meta name="description" content=".*?".*?\/?>/,
    '<meta name="description" content="The page you are looking for does not exist." />',
  )
  const seoTags404 = [
    '<meta name="robots" content="noindex" />',
    '<meta property="og:title" content="Page not found — Forkzero" />',
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="Forkzero" />',
  ].join('\n    ')
  html404 = html404.replace('</head>', `    ${seoTags404}\n  </head>`)
  const noscript404 = `<noscript><div style="max-width:800px;margin:0 auto;padding:4rem 2rem;font-family:sans-serif;text-align:center"><h1>Page not found</h1><p>The page you're looking for doesn't exist or has been moved.</p><p><a href="/">Back to homepage</a></p></div></noscript>`
  html404 = html404.replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript404}`)
  writeFileSync(join(distDir, '404.html'), html404)
  console.log('Generated: /404.html')
}

// --- Generate sitemap.xml ---
// Note: <changefreq> and <priority> are ignored by Google and omitted per best practice.
const today = new Date().toISOString().split('T')[0]
const latestPostDate = blogPosts.length > 0 ? blogPosts[0].date : today
const sitemapUrls: { loc: string; lastmod: string }[] = [
  { loc: 'https://forkzero.ai/', lastmod: today },
  { loc: 'https://forkzero.ai/getting-started', lastmod: today },
  { loc: 'https://forkzero.ai/blog', lastmod: latestPostDate },
  ...blogPosts.map((post) => ({
    loc: `https://forkzero.ai/blog/${post.slug}`,
    lastmod: post.date,
  })),
  { loc: 'https://forkzero.ai/privacy', lastmod: today },
]

const sitemapXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapUrls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`),
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
        `<h1>Your agent writes the code. Who remembers why?</h1>`,
        `<p>The research, reasoning, and requirements behind your code vanish into chat logs. Lattice captures them in a Git-native knowledge graph — so any collaborator, human or AI, can pick up where the last one left off.</p>`,
        `<h2>Why Lattice?</h2>`,
        `<ul>`,
        `<li>Stop losing the &quot;why&quot; — every requirement traces back to the research that motivated it</li>`,
        `<li>Requirements before code, not after — give your agent a spec to implement</li>`,
        `<li>Onboard anyone in minutes — human or AI</li>`,
        `</ul>`,
        `<h2>Projects</h2>`,
        `<ul>${projectList}</ul>`,
        `<nav><p><a href="/getting-started">Get Started</a> · <a href="/blog">Blog</a> · <a href="/privacy">Privacy</a></p></nav>`,
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

  if (route.path === '/reader') {
    return wrap(
      `<h1>Lattice Dashboard</h1><p>Interactive viewer for Lattice knowledge graphs. Requires JavaScript to run.</p><p><a href="/">Back to homepage</a></p>`,
    )
  }

  if (route.path === '/privacy') {
    return wrap(
      [
        `<h1>Privacy Policy</h1>`,
        `<p>If you subscribe to our mailing list, we collect your email address. We do not use cookies, tracking pixels, or third-party analytics. Lattice is open-source software that runs entirely on your machine and does not collect telemetry.</p>`,
        `<p>Contact: privacy@forkzero.ai</p>`,
      ].join(''),
    )
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
      sameAs: [GITHUB_ORG_URL],
      description:
        'Forkzero builds developer tools for AI-native teams. Lattice captures research, decisions, and requirements in a Git-native knowledge graph.',
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
      '@type': 'CollectionPage',
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
        dateModified: post.date,
        image: 'https://forkzero.ai/og-default.png',
        author: {
          '@type': 'Person',
          name: post.author.name,
          ...(post.author.github ? { url: post.author.github } : {}),
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

  if (route.path === '/reader') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Lattice Dashboard — Forkzero',
      description: route.description,
      url: route.canonical,
    })
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://forkzero.ai/' },
        { '@type': 'ListItem', position: 2, name: 'Dashboard', item: 'https://forkzero.ai/reader' },
      ],
    })
  }

  if (route.path === '/privacy') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Privacy Policy — Forkzero',
      description: route.description,
      url: route.canonical,
    })
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://forkzero.ai/' },
        { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: 'https://forkzero.ai/privacy' },
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
