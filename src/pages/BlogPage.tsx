import { useEffect } from 'react'
import { colors, fonts, shadows, radius } from '../tokens'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { BlogComments } from '../components/BlogComments'
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

// --- Lattice flow diagram ---

function LatticeFlowDiagram() {
  const nodes = [
    { label: 'Sources', color: colors.accentBlue },
    { label: 'Theses', color: colors.accentPurple },
    { label: 'Requirements', color: colors.accentYellow },
    { label: 'Implementations', color: colors.accentGreen },
  ]
  const edges = ['supports', 'derives', 'satisfies']

  return (
    <div style={s.diagramContainer}>
      <div style={s.diagramFlow}>
        {nodes.map((node, i) => (
          <div key={node.label} style={s.diagramSegment}>
            <div style={s.diagramNode}>
              <span style={{ ...s.diagramDot, background: node.color }} />
              <span style={s.diagramLabel}>{node.label}</span>
            </div>
            {i < edges.length && (
              <div style={s.diagramEdge}>
                <span style={s.diagramArrow}>&rarr;</span>
                <span style={s.diagramEdgeLabel}>{edges[i]}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Simple markdown-ish renderer ---

export function renderContent(content: string) {
  const blocks: React.ReactNode[] = []
  const lines = content.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Diagram marker
    if (line.trim() === '<!-- diagram:lattice-flow -->') {
      blocks.push(<LatticeFlowDiagram key={`diagram-${i}`} />)
      i++
      continue
    }

    // Callout blocks (:::insight ... :::)
    if (line.trim().startsWith(':::')) {
      const calloutType = line.trim().slice(3).trim()
      const calloutLines: string[] = []
      i++
      while (i < lines.length && lines[i].trim() !== ':::') {
        calloutLines.push(lines[i])
        i++
      }
      i++ // skip closing :::
      const calloutStyle =
        calloutType === 'insight'
          ? { borderColor: colors.accentPurple, bg: `${colors.accentPurple}08` }
          : { borderColor: colors.accentBlue, bg: `${colors.accentBlue}08` }
      blocks.push(
        <div
          key={`callout-${i}`}
          style={{
            ...s.callout,
            borderLeftColor: calloutStyle.borderColor,
            background: calloutStyle.bg,
          }}
        >
          {calloutLines.map((cl, j) => {
            const trimmed = cl.trim()
            if (trimmed === '') return null
            return (
              <p key={j} style={j === 0 ? s.calloutFirstLine : s.calloutText}>
                {renderInline(trimmed)}
              </p>
            )
          })}
        </div>,
      )
      continue
    }

    // Blockquotes (> lines, with optional > — attribution)
    if (line.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      // Check for attribution line (starts with "— " or "- ")
      let attribution: string | null = null
      const lastLine = quoteLines[quoteLines.length - 1]
      if (lastLine && lastLine.startsWith('— ')) {
        attribution = lastLine.slice(2)
        quoteLines.pop()
      }
      blocks.push(
        <blockquote key={`bq-${i}`} style={s.blockquote}>
          <p style={s.blockquoteText}>{renderInline(quoteLines.join(' '))}</p>
          {attribution && <footer style={s.blockquoteAttribution}>{renderInline(attribution)}</footer>}
        </blockquote>,
      )
      continue
    }

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
      !lines[i].startsWith('> ') &&
      !lines[i].trim().startsWith(':::') &&
      !lines[i].trim().startsWith('<!-- diagram:') &&
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

export function renderInline(text: string): React.ReactNode {
  // Process inline: **bold**, *italic*, `code`, [link](url)
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

    // Italic (single *)
    const italicMatch = remaining.match(/^(.*?)\*(.+?)\*(.*)$/s)
    if (italicMatch) {
      if (italicMatch[1]) parts.push(<span key={key++}>{renderInline(italicMatch[1])}</span>)
      parts.push(<em key={key++}>{renderInline(italicMatch[2])}</em>)
      remaining = italicMatch[3]
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

// --- Source cards ---

function SourceCards({ post }: { post: BlogPost }) {
  if (!post.sources || post.sources.length === 0) return null
  return (
    <div style={s.sourceCardsSection}>
      <h3 style={s.sourceCardsTitle}>Sources</h3>
      <div style={s.sourceCardsGrid}>
        {post.sources.map((source) => (
          <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" style={s.sourceCard}>
            <div style={s.sourceCardName}>{source.name}</div>
            <div style={s.sourceCardAuthor}>{source.author}</div>
            <div style={s.sourceCardDesc}>{source.description}</div>
          </a>
        ))}
      </div>
    </div>
  )
}

// --- Author bio ---

function AuthorBio({ post }: { post: BlogPost }) {
  return (
    <div style={s.authorBio}>
      <div style={s.authorInfo}>
        <div style={s.authorName}>{post.author.name}</div>
        <div style={s.authorBioText}>{post.author.bio}</div>
        <div style={s.authorLinks}>
          {post.author.github && (
            <a href={post.author.github} target="_blank" rel="noopener noreferrer" style={s.authorLink}>
              GitHub
            </a>
          )}
          {post.author.x && (
            <a href={post.author.x} target="_blank" rel="noopener noreferrer" style={s.authorLink}>
              X
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Discussion CTA ---

function DiscussionCTA({ prompt }: { prompt: string }) {
  return (
    <div style={s.ctaSection}>
      <h3 style={s.ctaTitle}>Join the conversation</h3>
      <p style={s.ctaText}>{prompt}</p>
    </div>
  )
}

// --- Share links ---

function ShareLinks({ post }: { post: BlogPost }) {
  const url = `https://forkzero.ai/blog/${post.slug}`
  const title = post.title

  const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  const hnUrl = `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`

  return (
    <div style={s.shareSection}>
      <span style={s.shareLabel}>Share</span>
      <a href={xUrl} target="_blank" rel="noopener noreferrer" style={s.sharePill}>
        X
      </a>
      <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" style={s.sharePill}>
        LinkedIn
      </a>
      <a href={hnUrl} target="_blank" rel="noopener noreferrer" style={s.sharePill}>
        Hacker News
      </a>
    </div>
  )
}

// --- Styles ---

const s: Record<string, React.CSSProperties> = {
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

  // Blockquote
  blockquote: {
    borderLeft: `3px solid ${colors.accentBlue}`,
    background: `${colors.accentBlue}06`,
    margin: '1.5rem 0',
    padding: '1rem 1.25rem',
    borderRadius: `0 ${radius} ${radius} 0`,
  },
  blockquoteText: {
    color: colors.textSecondary,
    fontSize: '1.05rem',
    lineHeight: 1.75,
    fontStyle: 'italic',
    margin: 0,
  },
  blockquoteAttribution: {
    color: colors.textMuted,
    fontSize: '0.9rem',
    marginTop: '0.5rem',
  },

  // Callout
  callout: {
    borderLeft: `3px solid ${colors.accentPurple}`,
    background: `${colors.accentPurple}08`,
    margin: '1.5rem 0',
    padding: '1rem 1.25rem',
    borderRadius: `0 ${radius} ${radius} 0`,
  },
  calloutFirstLine: {
    color: colors.textPrimary,
    fontSize: '1.05rem',
    lineHeight: 1.75,
    fontWeight: 600,
    margin: 0,
    marginBottom: '0.25rem',
  },
  calloutText: {
    color: colors.textSecondary,
    fontSize: '1.05rem',
    lineHeight: 1.75,
    margin: 0,
  },

  // Diagram
  diagramContainer: {
    margin: '2rem 0',
    padding: '1.5rem',
    background: colors.bgSecondary,
    borderRadius: radius,
    border: `1px solid ${colors.borderColor}`,
    overflowX: 'auto' as const,
  },
  diagramFlow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0',
    minWidth: 'fit-content',
  },
  diagramSegment: {
    display: 'flex',
    alignItems: 'center',
  },
  diagramNode: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.4rem',
  },
  diagramDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  diagramLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: colors.textPrimary,
    whiteSpace: 'nowrap' as const,
  },
  diagramEdge: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '0 0.75rem',
    gap: '0.2rem',
  },
  diagramArrow: {
    fontSize: '1.1rem',
    color: colors.textMuted,
  },
  diagramEdgeLabel: {
    fontSize: '0.7rem',
    color: colors.textMuted,
    fontStyle: 'italic',
    whiteSpace: 'nowrap' as const,
  },

  // Source cards
  sourceCardsSection: {
    marginTop: '2.5rem',
    paddingTop: '2rem',
    borderTop: `1px solid ${colors.borderColor}`,
  },
  sourceCardsTitle: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: '1rem',
  },
  sourceCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
  },
  sourceCard: {
    background: colors.bgSecondary,
    borderRadius: radius,
    padding: '1rem 1.25rem',
    border: `1px solid ${colors.borderColor}`,
    textDecoration: 'none',
    color: 'inherit',
    transition: 'box-shadow 0.2s, transform 0.2s',
    display: 'block',
  },
  sourceCardName: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: '0.25rem',
  },
  sourceCardAuthor: {
    fontSize: '0.8rem',
    color: colors.accentBlue,
    marginBottom: '0.4rem',
  },
  sourceCardDesc: {
    fontSize: '0.8rem',
    color: colors.textMuted,
    lineHeight: 1.5,
  },

  // Author bio
  authorBio: {
    marginTop: '2.5rem',
    paddingTop: '1.5rem',
    borderTop: `1px solid ${colors.borderColor}`,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: '1rem',
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: '0.25rem',
  },
  authorBioText: {
    fontSize: '0.9rem',
    color: colors.textSecondary,
    lineHeight: 1.5,
    marginBottom: '0.4rem',
  },
  authorLinks: {
    display: 'flex',
    gap: '0.75rem',
  },
  authorLink: {
    fontSize: '0.85rem',
    color: colors.accentBlue,
    textDecoration: 'none',
    fontWeight: 500,
  },

  // Discussion CTA
  ctaSection: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: colors.bgSecondary,
    borderRadius: radius,
    border: `1px solid ${colors.borderColor}`,
  },
  ctaTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: colors.textPrimary,
    margin: 0,
    marginBottom: '0.5rem',
  },
  ctaText: {
    fontSize: '0.95rem',
    color: colors.textSecondary,
    lineHeight: 1.6,
    margin: 0,
  },

  // Share links
  shareSection: {
    marginTop: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  shareLabel: {
    fontSize: '0.85rem',
    color: colors.textMuted,
    fontWeight: 500,
    marginRight: '0.25rem',
  },
  sharePill: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: colors.accentBlue,
    background: `${colors.accentBlue}0a`,
    border: `1px solid ${colors.accentBlue}30`,
    borderRadius: '100px',
    padding: '0.3rem 0.75rem',
    textDecoration: 'none',
    transition: 'background 0.2s',
  },

  // Comments wrapper
  commentsSection: {
    marginTop: '2rem',
  },
}

// --- Components ---

function BlogListing() {
  useEffect(() => {
    document.title = 'Blog \u2014 Forkzero'
    setMetaTag(
      'description',
      'Technical writing on knowledge coordination, context engineering, and AI-first developer tooling.',
    )
    setOgTag('og:title', 'Blog \u2014 Forkzero')
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
              {post.author.name}
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
    document.title = `${post.title} \u2014 Forkzero`
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
            {post.author.name}
          </div>
          {renderContent(post.content)}
          <SourceCards post={post} />
          <AuthorBio post={post} />
        </article>

        {post.discussionPrompt && <DiscussionCTA prompt={post.discussionPrompt} />}
        <ShareLinks post={post} />
        <div style={s.commentsSection}>
          <BlogComments slug={post.slug} />
        </div>
      </div>
      <Footer />
    </div>
  )
}

function BlogNotFound() {
  useEffect(() => {
    document.title = 'Post not found \u2014 Forkzero'
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
