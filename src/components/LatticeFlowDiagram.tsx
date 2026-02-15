import { colors, radius, fonts } from '../tokens'

const styles: Record<string, React.CSSProperties> = {
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
    fontFamily: fonts.system,
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
}

const nodes = [
  { label: 'Sources', color: colors.accentBlue },
  { label: 'Theses', color: colors.accentPurple },
  { label: 'Requirements', color: colors.accentYellow },
  { label: 'Implementations', color: colors.accentGreen },
]
const edges = ['supports', 'derives', 'satisfies']

export function LatticeFlowDiagram() {
  return (
    <div style={styles.diagramContainer}>
      <div style={styles.diagramFlow}>
        {nodes.map((node, i) => (
          <div key={node.label} style={styles.diagramSegment}>
            <div style={styles.diagramNode}>
              <span style={{ ...styles.diagramDot, background: node.color }} />
              <span style={styles.diagramLabel}>{node.label}</span>
            </div>
            {i < edges.length && (
              <div style={styles.diagramEdge}>
                <span style={styles.diagramArrow}>&rarr;</span>
                <span style={styles.diagramEdgeLabel}>{edges[i]}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
