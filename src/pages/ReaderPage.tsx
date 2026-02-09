import { useEffect, useState } from 'react'
import { colors, fonts, shadows, radius } from '../tokens'
import { PoweredByHeader } from '../components/Header'
import { Footer } from '../components/Footer'

// --- Types matching lattice export --format json ---

interface LatticeEdge {
  target: string
  version?: string
  rationale?: string
}

interface LatticeEdges {
  satisfies?: LatticeEdge[]
  derives_from?: LatticeEdge[]
  supports?: LatticeEdge[]
  depends_on?: LatticeEdge[]
  reveals_gap_in?: LatticeEdge[]
  challenges?: LatticeEdge[]
  validates?: LatticeEdge[]
  extends?: LatticeEdge[]
}

interface ResolutionInfo {
  status: string
  resolved_at?: string
  resolved_by?: string
}

interface LatticeNode {
  id: string
  type: string
  title: string
  body: string
  status: string
  version: string
  created_at: string
  created_by: string
  priority?: string
  category?: string
  tags?: string[]
  resolution?: ResolutionInfo
  meta?: Record<string, unknown>
  edges?: LatticeEdges
  url?: string
  citations?: string[]
}

// --- Statistics ---

interface Stats {
  sources: number
  theses: number
  requirements: number
  implementations: number
  implemented: number
  coveragePct: number
  verified: number
  blocked: number
  deferred: number
  unresolved: number
  wontfix: number
  p0: number
  p1: number
  p2: number
  p0Verified: number
  p1Verified: number
  p2Verified: number
}

function computeStats(nodes: LatticeNode[]): Stats {
  const sources = nodes.filter(n => n.type === 'source')
  const theses = nodes.filter(n => n.type === 'thesis')
  const requirements = nodes.filter(n => n.type === 'requirement')
  const implementations = nodes.filter(n => n.type === 'implementation')

  const implementedIds = new Set<string>()
  for (const impl of implementations) {
    for (const edge of impl.edges?.satisfies ?? []) {
      implementedIds.add(edge.target)
    }
  }

  const implemented = requirements.filter(r => implementedIds.has(r.id)).length
  const totalReqs = requirements.length
  const coveragePct = totalReqs > 0 ? Math.round((implemented * 100) / totalReqs) : 0

  let verified = 0, blocked = 0, deferred = 0, unresolved = 0, wontfix = 0
  let p0 = 0, p1 = 0, p2 = 0, p0Verified = 0, p1Verified = 0, p2Verified = 0

  for (const req of requirements) {
    const res = req.resolution?.status?.toLowerCase()
    const isVerified = res === 'verified'

    if (res === 'verified') verified++
    else if (res === 'blocked') blocked++
    else if (res === 'deferred') deferred++
    else if (res === 'wontfix') wontfix++
    else unresolved++

    const pri = req.priority?.toUpperCase()
    if (pri === 'P0') { p0++; if (isVerified) p0Verified++ }
    else if (pri === 'P1') { p1++; if (isVerified) p1Verified++ }
    else if (pri === 'P2') { p2++; if (isVerified) p2Verified++ }
  }

  return {
    sources: sources.length, theses: theses.length, requirements: totalReqs,
    implementations: implementations.length, implemented, coveragePct,
    verified, blocked, deferred, unresolved, wontfix,
    p0, p1, p2, p0Verified, p1Verified, p2Verified,
  }
}

// --- Traceability tree ---

interface TraceReq {
  id: string
  title: string
  priority?: string
  resolution?: string
  implementations: { id: string; title: string }[]
}

interface TraceThesis {
  id: string
  title: string
  requirements: TraceReq[]
}

function buildTraceability(nodes: LatticeNode[]): TraceThesis[] {
  const theses = nodes.filter(n => n.type === 'thesis')
  const requirements = nodes.filter(n => n.type === 'requirement')
  const implementations = nodes.filter(n => n.type === 'implementation')

  const reqToImpls = new Map<string, { id: string; title: string }[]>()
  for (const impl of implementations) {
    for (const edge of impl.edges?.satisfies ?? []) {
      const list = reqToImpls.get(edge.target) ?? []
      list.push({ id: impl.id, title: impl.title })
      reqToImpls.set(edge.target, list)
    }
  }

  const thesisToReqs = new Map<string, LatticeNode[]>()
  for (const req of requirements) {
    for (const edge of req.edges?.derives_from ?? []) {
      const list = thesisToReqs.get(edge.target) ?? []
      list.push(req)
      thesisToReqs.set(edge.target, list)
    }
  }

  return theses.map(t => ({
    id: t.id,
    title: t.title,
    requirements: (thesisToReqs.get(t.id) ?? []).map(r => ({
      id: r.id,
      title: r.title,
      priority: r.priority,
      resolution: r.resolution?.status?.toLowerCase(),
      implementations: reqToImpls.get(r.id) ?? [],
    })),
  }))
}

// --- Styles ---

const s = {
  page: { background: colors.bgSecondary, minHeight: '100vh', fontFamily: fonts.system },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
  title: { fontSize: '2rem', fontWeight: 700, color: colors.textPrimary, marginBottom: '0.25rem' },
  subtitle: { color: colors.textMuted, fontSize: '0.9rem', marginBottom: '2rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  statCard: {
    background: colors.bgCard, borderRadius: radius, padding: '1.5rem',
    boxShadow: shadows.md, border: `1px solid ${colors.borderColor}`,
    cursor: 'pointer', textDecoration: 'none' as const, color: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s', display: 'block',
  },
  statLabel: { fontSize: '0.85rem', color: colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '0.5rem' },
  statValue: { fontSize: '2rem', fontWeight: 700 },
  section: {
    background: colors.bgCard, borderRadius: radius, marginBottom: '1.5rem',
    boxShadow: shadows.md, border: `1px solid ${colors.borderColor}`, overflow: 'hidden',
  },
  sectionHeader: { background: colors.bgSecondary, padding: '1rem 1.5rem', borderBottom: `1px solid ${colors.borderColor}` },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 600, color: colors.textPrimary, margin: 0 },
  sectionContent: { padding: '1.5rem' },
  progressBar: { background: colors.bgSecondary, borderRadius: '9999px', height: '1rem', overflow: 'hidden', margin: '1rem 0' },
  progressFill: { height: '100%', background: `linear-gradient(90deg, ${colors.accentGreen}, ${colors.accentBlue})`, transition: 'width 0.3s' },
  resGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' },
  resItem: { textAlign: 'center' as const, padding: '1rem', background: colors.bgSecondary, borderRadius: radius },
  resCount: { fontSize: '1.5rem', fontWeight: 700 },
  resLabel: { fontSize: '0.75rem', color: colors.textMuted, textTransform: 'uppercase' as const },
  miniProgress: { height: '4px', background: colors.borderColor, borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' },
  miniProgressFill: { height: '100%', background: colors.accentGreen, transition: 'width 0.3s' },
  miniLabel: { fontSize: '0.7rem', color: colors.textMuted, marginTop: '0.25rem' },
  detailsSummary: {
    padding: '1rem 1.5rem', cursor: 'pointer', fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    borderBottom: `1px solid ${colors.borderColor}`, userSelect: 'none' as const,
  },
  detailsContent: { padding: '1rem 1.5rem', background: colors.bgSecondary },
  nodeId: { fontFamily: fonts.mono, fontSize: '0.85rem', color: colors.accentBlue, fontWeight: 500 },
  nodeTitle: { color: colors.textPrimary, marginLeft: '0.5rem' },
  nodeBody: { color: colors.textSecondary, fontSize: '0.9rem', marginTop: '0.5rem', whiteSpace: 'pre-wrap' as const },
  badge: { display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' as const, marginLeft: '0.5rem' },
  treeNode: { marginLeft: '1.5rem', padding: '0.5rem 0', borderLeft: `2px solid ${colors.borderColor}`, paddingLeft: '1rem' },
  filterControls: { display: 'flex', gap: '1rem', flexWrap: 'wrap' as const },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' as const },
  filterLabel: { fontSize: '0.8rem', color: colors.textMuted, fontWeight: 500 },
  filterBtn: {
    padding: '0.25rem 0.75rem', border: `1px solid ${colors.borderColor}`,
    background: colors.bgCard, borderRadius: '4px', fontSize: '0.8rem',
    cursor: 'pointer', transition: 'all 0.2s', color: colors.textSecondary,
  },
  filterBtnActive: {
    padding: '0.25rem 0.75rem', border: `1px solid ${colors.accentBlue}`,
    background: colors.accentBlue, borderRadius: '4px', fontSize: '0.8rem',
    cursor: 'pointer', color: '#ffffff',
  },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: fonts.system, color: colors.textMuted, fontSize: '1.1rem' },
  error: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: fonts.system, color: colors.accentRed, fontSize: '1.1rem', flexDirection: 'column' as const, gap: '1rem' },
}

const badgeColors: Record<string, { bg: string; fg: string }> = {
  p0: { bg: '#fef3c7', fg: '#92400e' },
  p1: { bg: '#dbeafe', fg: '#1e40af' },
  p2: { bg: '#f3e8ff', fg: '#6b21a8' },
  verified: { bg: '#d1fae5', fg: '#065f46' },
  blocked: { bg: '#fee2e2', fg: '#991b1b' },
  deferred: { bg: '#fef3c7', fg: '#92400e' },
  open: { bg: '#e5e7eb', fg: '#374151' },
  wontfix: { bg: '#f3f4f6', fg: '#6b7280' },
}

function Badge({ label }: { label: string }) {
  const key = label.toLowerCase()
  const c = badgeColors[key] ?? badgeColors.open
  return <span style={{ ...s.badge, background: c.bg, color: c.fg }}>{label}</span>
}

const statColors: Record<string, string> = {
  sources: colors.accentBlue,
  theses: colors.accentPurple,
  requirements: colors.accentYellow,
  implementations: colors.accentGreen,
}

// --- Collapsible details (since <details> doesn't work well with React inline styles) ---

function Collapsible({ summary, children }: { summary: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${colors.borderColor}` }}>
      <div
        style={s.detailsSummary}
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setOpen(!open)}
      >
        <span style={{ color: colors.accentBlue, marginRight: '0.25rem' }}>{open ? '\u25BC' : '\u25B6'}</span>
        {summary}
      </div>
      {open && <div style={s.detailsContent}>{children}</div>}
    </div>
  )
}

// --- Main Reader ---

export function ReaderPage() {
  const [nodes, setNodes] = useState<LatticeNode[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const url = new URLSearchParams(window.location.search).get('url')

  // Derive project name from the JSON URL path
  // e.g. https://forkzero.github.io/forkzero.ai/lattice-data.json → "forkzero.ai"
  // e.g. https://example.com/my-project/lattice-data.json → "my-project"
  const projectName = (() => {
    if (!url) return null
    try {
      const parts = new URL(url).pathname.split('/').filter(Boolean)
      // Find the last path segment before the JSON filename
      const jsonIndex = parts.findIndex(p => p.endsWith('.json'))
      if (jsonIndex > 0) return parts[jsonIndex - 1]
      if (parts.length > 1) return parts[parts.length - 2]
      return null
    } catch { return null }
  })()

  useEffect(() => {
    if (!url) { setError('No URL provided. Use ?url=<json-url>'); return }
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(data => setNodes(data))
      .catch(e => setError(`Failed to load: ${e.message}`))
  }, [url])

  if (error) {
    return (
      <div style={s.page}>
        <PoweredByHeader />
        <div style={s.error}>
          <span>{error}</span>
          <a href="/" style={{ color: colors.accentBlue, textDecoration: 'none' }}>Back to Forkzero</a>
        </div>
      </div>
    )
  }

  if (!nodes) {
    return (
      <div style={s.page}>
        <PoweredByHeader />
        <div style={s.loading}>Loading lattice data...</div>
      </div>
    )
  }

  const stats = computeStats(nodes)
  const traceability = buildTraceability(nodes)
  const sources = nodes.filter(n => n.type === 'source')
  const theses = nodes.filter(n => n.type === 'thesis')
  const requirements = nodes.filter(n => n.type === 'requirement')
  const implementations = nodes.filter(n => n.type === 'implementation')

  const filteredReqs = requirements.filter(r => {
    const pri = r.priority?.toUpperCase() ?? ''
    const res = r.resolution?.status?.toLowerCase() ?? 'open'
    const matchPri = priorityFilter === 'all' || pri === priorityFilter
    const matchStatus = statusFilter === 'all' || res === statusFilter
    return matchPri && matchStatus
  })

  return (
    <div style={s.page}>
      <PoweredByHeader />
      <div style={s.container}>
        <h1 style={s.title}>{projectName ?? 'Lattice'}</h1>
        <p style={s.subtitle}>Lattice Dashboard</p>

        {/* Stats grid */}
        <div style={s.statsGrid}>
          {(['sources', 'theses', 'requirements', 'implementations'] as const).map(key => (
            <a key={key} href={`#${key}-section`} style={s.statCard}>
              <div style={s.statLabel}>{key}</div>
              <div style={{ ...s.statValue, color: statColors[key] }}>{stats[key]}</div>
            </a>
          ))}
        </div>

        {/* Implementation Coverage */}
        <div style={s.section}>
          <div style={s.sectionHeader}><h2 style={s.sectionTitle}>Implementation Coverage</h2></div>
          <div style={s.sectionContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{stats.implemented} of {stats.requirements} requirements implemented</span>
              <strong>{stats.coveragePct}%</strong>
            </div>
            <div style={s.progressBar}>
              <div style={{ ...s.progressFill, width: `${stats.coveragePct}%` }} />
            </div>
          </div>
        </div>

        {/* Resolution Status */}
        <div style={s.section}>
          <div style={s.sectionHeader}><h2 style={s.sectionTitle}>Resolution Status</h2></div>
          <div style={s.sectionContent}>
            <div style={s.resGrid}>
              {([
                { label: 'Verified', count: stats.verified, color: colors.accentGreen },
                { label: 'Blocked', count: stats.blocked, color: colors.accentRed },
                { label: 'Deferred', count: stats.deferred, color: colors.accentYellow },
                { label: 'Unresolved', count: stats.unresolved, color: colors.textMuted },
                { label: "Won't Fix", count: stats.wontfix, color: colors.textSecondary },
              ]).map(item => (
                <div key={item.label} style={s.resItem}>
                  <div style={{ ...s.resCount, color: item.color }}>{item.count}</div>
                  <div style={s.resLabel}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div style={s.section}>
          <div style={s.sectionHeader}><h2 style={s.sectionTitle}>Priority Breakdown</h2></div>
          <div style={s.sectionContent}>
            <div style={s.resGrid}>
              {([
                { label: 'P0 (MVP)', total: stats.p0, verified: stats.p0Verified, color: '#92400e' },
                { label: 'P1 (Beta)', total: stats.p1, verified: stats.p1Verified, color: '#1e40af' },
                { label: 'P2 (Future)', total: stats.p2, verified: stats.p2Verified, color: '#6b21a8' },
              ]).map(item => (
                <div key={item.label} style={s.resItem}>
                  <div style={{ ...s.resCount, color: item.color }}>{item.total}</div>
                  <div style={s.resLabel}>{item.label}</div>
                  <div style={s.miniProgress}>
                    <div style={{ ...s.miniProgressFill, width: `${item.total > 0 ? (item.verified * 100) / item.total : 0}%` }} />
                  </div>
                  <div style={s.miniLabel}>{item.verified}/{item.total} verified</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traceability Tree */}
        <div style={s.section}>
          <div style={s.sectionHeader}><h2 style={s.sectionTitle}>Traceability Tree</h2></div>
          {traceability.map(thesis => (
            <Collapsible
              key={thesis.id}
              summary={
                <>
                  <span style={s.nodeId}>{thesis.id}</span>
                  <span style={s.nodeTitle}>{thesis.title}</span>
                </>
              }
            >
              {thesis.requirements.map(req => (
                <div key={req.id} style={s.treeNode}>
                  <span style={s.nodeId}>{req.id}</span>
                  <span style={s.nodeTitle}>{req.title}</span>
                  {req.priority && <Badge label={req.priority} />}
                  <Badge label={req.resolution ?? 'Open'} />
                  {req.implementations.length > 0 && (
                    <div style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                      {req.implementations.map(impl => (
                        <div key={impl.id} style={s.treeNode}>
                          <span style={s.nodeId}>{impl.id}</span>
                          <span style={s.nodeTitle}>{impl.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Collapsible>
          ))}
        </div>

        {/* Sources */}
        <div style={s.section} id="sources-section">
          <div style={s.sectionHeader}><h2 style={s.sectionTitle}>Sources ({sources.length})</h2></div>
          {sources.map(src => (
            <Collapsible
              key={src.id}
              summary={
                <>
                  <span style={s.nodeId}>{src.id}</span>
                  <span style={s.nodeTitle}>{src.title}</span>
                </>
              }
            >
              <div style={s.nodeBody}>{src.body}</div>
              {typeof (src.meta as Record<string, unknown>)?.url === 'string' && (
                <p style={{ marginTop: '1rem' }}>
                  <strong>URL: </strong>
                  <a href={String((src.meta as Record<string, unknown>).url)} target="_blank" rel="noopener noreferrer" style={{ color: colors.accentBlue }}>
                    {String((src.meta as Record<string, unknown>).url)}
                  </a>
                </p>
              )}
            </Collapsible>
          ))}
        </div>

        {/* Theses */}
        <div style={s.section} id="theses-section">
          <div style={s.sectionHeader}><h2 style={s.sectionTitle}>Theses ({theses.length})</h2></div>
          {theses.map(t => (
            <Collapsible
              key={t.id}
              summary={
                <>
                  <span style={s.nodeId}>{t.id}</span>
                  <span style={s.nodeTitle}>{t.title}</span>
                </>
              }
            >
              <div style={s.nodeBody}>{t.body}</div>
            </Collapsible>
          ))}
        </div>

        {/* Requirements */}
        <div style={s.section} id="requirements-section">
          <div style={{ ...s.sectionHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={s.sectionTitle}>Requirements ({requirements.length})</h2>
            <div style={s.filterControls}>
              <div style={s.filterGroup}>
                <span style={s.filterLabel}>Priority:</span>
                {['all', 'P0', 'P1', 'P2'].map(v => (
                  <button
                    key={v}
                    style={priorityFilter === v ? s.filterBtnActive : s.filterBtn}
                    onClick={() => setPriorityFilter(v)}
                  >
                    {v === 'all' ? 'All' : v}
                  </button>
                ))}
              </div>
              <div style={s.filterGroup}>
                <span style={s.filterLabel}>Status:</span>
                {['all', 'verified', 'blocked', 'deferred', 'open'].map(v => (
                  <button
                    key={v}
                    style={statusFilter === v ? s.filterBtnActive : s.filterBtn}
                    onClick={() => setStatusFilter(v)}
                  >
                    {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {filteredReqs.map(req => (
            <Collapsible
              key={req.id}
              summary={
                <>
                  <span style={s.nodeId}>{req.id}</span>
                  <span style={s.nodeTitle}>{req.title}</span>
                  {req.priority && <Badge label={req.priority} />}
                  <Badge label={req.resolution?.status ?? 'Open'} />
                </>
              }
            >
              <div style={s.nodeBody}>{req.body}</div>
            </Collapsible>
          ))}
          {filteredReqs.length === 0 && (
            <p style={{ padding: '1rem', color: colors.textMuted, textAlign: 'center' }}>No requirements match the selected filters.</p>
          )}
        </div>

        {/* Implementations */}
        <div style={s.section} id="implementations-section">
          <div style={s.sectionHeader}><h2 style={s.sectionTitle}>Implementations ({implementations.length})</h2></div>
          {implementations.map(impl => (
            <Collapsible
              key={impl.id}
              summary={
                <>
                  <span style={s.nodeId}>{impl.id}</span>
                  <span style={s.nodeTitle}>{impl.title}</span>
                </>
              }
            >
              <div style={s.nodeBody}>{impl.body}</div>
            </Collapsible>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
