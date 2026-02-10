import { useEffect } from 'react'
import { colors, fonts, shadows, radius } from '../tokens'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { blogPosts, type BlogPost } from '../data/blog-posts'

// --- SEO helpers ---

function setMetaTag(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

function setOgTag(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.content = content
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = url
}

// --- Simple markdown-ish renderer ---

function renderContent(content: string) {
  const blocks: React.ReactNode[] = []
  const lines = content.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Headings
    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={i} style={s.h2}>
          {line.slice(3)}
        </h2>,
      )
      i++
      continue
    }

    // Horizontal rule
    if (line.trim() === '---') {
      blocks.push(<hr key={i} style={s.hr} />)
      i++
      continue
    }

    // Code blocks
    if (line.startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      blocks.push(
        <pre key={`code-${i}`} style={s.codeBlock}>
          <code>{codeLines.join('\n')}</code>
        </pre>,
      )
      continue
    }

    // Bullet lists
    if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2))
        i++
      }
      blocks.push(
        <ul key={`ul-${i}`} style={s.ul}>
          {items.map((item, j) => (
            <li key={j} style={s.li}>
              {renderInline(item)}
            </li>
          ))}
        </ul>,
      )
      continue
    }

    // Numbered lists
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      blocks.push(
        <ol key={`ol-${i}`} style={s.ol}>
          {items.map((item, j) => (
            <li key={j} style={s.li}>
              {renderInline(item)}
            </li>
          ))}
        </ol>,
      )
      continue
    }

    // Empty lines
    if (line.trim() === '') {
      i++
      continue
    }

    // Paragraph — collect consecutive non-empty, non-special lines
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('## ') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('- ') &&
      !/^\d+\.\s/.test(lines[i]) &&
      lines[i].trim() !== '---'
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      blocks.push(
        <p key={`p-${i}`} style={s.paragraph}>
          {renderInline(paraLines.join(' '))}
        </p>,
      )
    }
  }

  return blocks
}

function renderInline(text: string): React.ReactNode {
  // Process inline: **bold**, `code`, [link](url)
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/s)
    if (boldMatch) {
      if (boldMatch[1]) parts.push(<span key={key++}>{renderInline(boldMatch[1])}</span>)
      parts.push(<strong key={key++}>{renderInline(boldMatch[2])}</strong>)
      remaining = boldMatch[3]
      continue
    }

    // Inline code
    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)$/s)
    if (codeMatch) {
      if (codeMatch[1]) parts.push(<span key={key++}>{renderInline(codeMatch[1])}</span>)
      parts.push(
        <code key={key++} style={s.inlineCode}>
          {codeMatch[2]}
        </code>,
      )
      remaining = codeMatch[3]
      continue
    }

    // Link
    const linkMatch = remaining.match(/^(.*?)\[(.+?)\]\((.+?)\)(.*)$/s)
    if (linkMatch) {
      if (linkMatch[1]) parts.push(<span key={key++}>{renderInline(linkMatch[1])}</span>)
      parts.push(
        <a key={key++} href={linkMatch[3]} target="_blank" rel="noopener noreferrer" style={s.link}>
          {linkMatch[2]}
        </a>,
      )
      remaining = linkMatch[4]
      continue
    }

    // Plain text
    parts.push(<span key={key++}>{remaining}</span>)
    break
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>
}

// --- Styles ---

const s = {
  page: { background: colors.bgSecondary, minHeight: '100vh', fontFamily: fonts.system },
  container: { maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' },
  listContainer: { maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: colors.textPrimary,
    marginBottom: '0.5rem',
  },
  pageSubtitle: {
    color: colors.textMuted,
    fontSize: '1rem',
    marginBottom: '2.5rem',
  },
  postCard: {
    background: colors.bgCard,
    borderRadius: radius,
    padding: '2rem',
    boxShadow: shadows.md,
    border: `1px solid ${colors.borderColor}`,
    marginBottom: '1.5rem',
    textDecoration: 'none' as const,
    display: 'block',
    color: 'inherit',
    transition: 'box-shadow 0.2s, transform 0.2s',
  },
  postCardTitle: {
    fontSize: '1.35rem',
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: '0.5rem',
    lineHeight: 1.3,
  },
  postMeta: {
    fontSize: '0.85rem',
    color: colors.textMuted,
    marginBottom: '0.75rem',
  },
  postExcerpt: {
    color: colors.textSecondary,
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
  readMore: {
    color: colors.accentBlue,
    fontSize: '0.9rem',
    fontWeight: 500,
    marginTop: '0.75rem',
    display: 'inline-block',
  },
  // Single post styles
  article: {
    background: colors.bgCard,
    borderRadius: radius,
    padding: '3rem',
    boxShadow: shadows.md,
    border: `1px solid ${colors.borderColor}`,
  },
  articleTitle: {
    fontSize: '2.2rem',
    fontWeight: 700,
    color: colors.textPrimary,
    lineHeight: 1.25,
    marginBottom: '0.75rem',
  },
  articleMeta: {
    fontSize: '0.9rem',
    color: colors.textMuted,
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: `1px solid ${colors.borderColor}`,
  },
  paragraph: {
    color: colors.textSecondary,
    fontSize: '1.05rem',
    lineHeight: 1.75,
    marginBottom: '1.25rem',
  },
  h2: {
    fontSize: '1.4rem',
    fontWeight: 600,
    color: colors.textPrimary,
    marginTop: '2.5rem',
    marginBottom: '1rem',
  },
  hr: {
    border: 'none',
    borderTop: `1px solid ${colors.borderColor}`,
    margin: '2rem 0',
  },
  codeBlock: {
    background: '#1a1a2e',
    color: '#e2e8f0',
    padding: '1.25rem',
    borderRadius: radius,
    fontSize: '0.9rem',
    fontFamily: fonts.mono,
    overflowX: 'auto' as const,
    marginBottom: '1.25rem',
    lineHeight: 1.5,
  },
  inlineCode: {
    background: colors.bgSecondary,
    color: colors.accentBlue,
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    fontSize: '0.9em',
    fontFamily: fonts.mono,
  },
  link: {
    color: colors.accentBlue,
    textDecoration: 'none',
    borderBottom: `1px solid transparent`,
    transition: 'border-color 0.2s',
  },
  ul: { paddingLeft: '1.5rem', marginBottom: '1.25rem' },
  ol: { paddingLeft: '1.5rem', marginBottom: '1.25rem' },
  li: {
    color: colors.textSecondary,
    fontSize: '1.05rem',
    lineHeight: 1.75,
    marginBottom: '0.5rem',
  },
  backLink: {
    display: 'inline-block',
    color: colors.accentBlue,
    textDecoration: 'none',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
}

// --- Components ---

function BlogListing() {
  useEffect(() => {
    document.title = 'Blog — Forkzero'
    setMetaTag(
      'description',
      'Technical writing on knowledge coordination, context engineering, and AI-first developer tooling.',
    )
    setOgTag('og:title', 'Blog — Forkzero')
    setOgTag(
      'og:description',
      'Technical writing on knowledge coordination, context engineering, and AI-first developer tooling.',
    )
    setOgTag('og:type', 'website')
    setOgTag('og:url', 'https://forkzero.ai/blog')
    setCanonical('https://forkzero.ai/blog')
  }, [])

  return (
    <div style={s.page}>
      <Header />
      <div style={s.listContainer}>
        <h1 style={s.pageTitle}>Blog</h1>
        <p style={s.pageSubtitle}>
          Technical writing on knowledge coordination, context engineering, and AI-first developer tooling.
        </p>
        {blogPosts.map((post) => (
          <a key={post.id} href={`/blog/${post.slug}`} style={s.postCard}>
            <h2 style={s.postCardTitle}>{post.title}</h2>
            <div style={s.postMeta}>
              {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              {' \u00b7 '}
              {post.author}
            </div>
            <p style={s.postExcerpt}>{post.excerpt}</p>
            <span style={s.readMore}>Read more &rarr;</span>
          </a>
        ))}
      </div>
      <Footer />
    </div>
  )
}

function BlogPostView({ post }: { post: BlogPost }) {
  useEffect(() => {
    document.title = `${post.title} — Forkzero`
    setMetaTag('description', post.excerpt)
    setOgTag('og:title', post.title)
    setOgTag('og:description', post.excerpt)
    setOgTag('og:type', 'article')
    setOgTag('og:url', `https://forkzero.ai/blog/${post.slug}`)
    setCanonical(`https://forkzero.ai/blog/${post.slug}`)
  }, [post])

  return (
    <div style={s.page}>
      <Header />
      <div style={s.container}>
        <a href="/blog" style={s.backLink}>
          &larr; All posts
        </a>
        <article style={s.article}>
          <h1 style={s.articleTitle}>{post.title}</h1>
          <div style={s.articleMeta}>
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            {' \u00b7 '}
            {post.author}
          </div>
          {renderContent(post.content)}
        </article>
      </div>
      <Footer />
    </div>
  )
}

function BlogNotFound() {
  useEffect(() => {
    document.title = 'Post not found — Forkzero'
  }, [])

  return (
    <div style={s.page}>
      <Header />
      <div style={{ ...s.container, textAlign: 'center' as const, paddingTop: '4rem' }}>
        <h1 style={s.pageTitle}>Post not found</h1>
        <p style={{ color: colors.textMuted, marginBottom: '2rem' }}>The blog post you're looking for doesn't exist.</p>
        <a href="/blog" style={s.backLink}>
          Back to blog
        </a>
      </div>
      <Footer />
    </div>
  )
}

export function BlogPage({ slug }: { slug?: string }) {
  if (!slug) {
    return <BlogListing />
  }
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) {
    return <BlogNotFound />
  }
  return <BlogPostView post={post} />
}
