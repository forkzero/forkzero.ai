/**
 * Pre-render script: generates static HTML for blog routes after vite build.
 * Run via: npx tsx scripts/prerender.ts
 *
 * Reads dist/index.html as a template, injects route-specific <title>, <meta>,
 * OG tags, and a <noscript> fallback with the article content for crawlers.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { blogPosts } from '../src/data/blog-posts.js'

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

  // Add OG tags and canonical
  const seoTags = [
    `<meta property="og:title" content="${escapeAttr(route.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(route.description)}" />`,
    `<meta property="og:type" content="${route.path === '/blog' ? 'website' : 'article'}" />`,
    `<meta property="og:url" content="${route.canonical}" />`,
    `<link rel="canonical" href="${route.canonical}" />`,
  ].join('\n    ')
  html = html.replace('</head>', `    ${seoTags}\n  </head>`)

  // Inject content for crawlers via <noscript>
  if (route.path === '/blog') {
    const listHtml = blogPosts
      .map((p) => `<article><h2><a href="/blog/${p.slug}">${esc(p.title)}</a></h2><p>${esc(p.excerpt)}</p></article>`)
      .join('\n')
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root"></div>\n    <noscript><div style="max-width:800px;margin:0 auto;padding:2rem;font-family:sans-serif"><h1>Blog</h1>${listHtml}</div></noscript>`,
    )
  } else {
    const post = blogPosts.find((p) => `/blog/${p.slug}` === route.path)
    if (post) {
      const articleHtml = [
        `<article style="max-width:800px;margin:0 auto;padding:2rem;font-family:sans-serif">`,
        `<h1>${esc(post.title)}</h1>`,
        `<p><em>${post.date} · ${esc(post.author)}</em></p>`,
        contentToHtml(post.content),
        `</article>`,
      ].join('')
      html = html.replace('<div id="root"></div>', `<div id="root"></div>\n    <noscript>${articleHtml}</noscript>`)
    }
  }

  // Write to dist/<route>/index.html
  const outDir = join(distDir, route.path.slice(1))
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true })
  }
  writeFileSync(join(outDir, 'index.html'), html)
  console.log(`Pre-rendered: ${route.path}`)
}

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
