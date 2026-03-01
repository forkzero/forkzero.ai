import { colors, fonts, shadows, cardBase, useHoverLift } from '@forkzero/ui'
import type { Project } from '../data/projects'

const styles = {
  card: {
    ...cardBase,
    padding: '1.5rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: '1.25rem',
    fontWeight: 700,
    fontFamily: fonts.system,
    color: colors.textPrimary,
    margin: 0,
  },
  tagline: {
    fontSize: '0.9rem',
    color: colors.textSecondary,
    fontFamily: fonts.system,
    margin: 0,
  },
  status: {
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    whiteSpace: 'nowrap' as const,
  },
  description: {
    fontSize: '0.9rem',
    color: colors.textSecondary,
    fontFamily: fonts.system,
    lineHeight: 1.6,
    flex: 1,
  },
  techRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  techBadge: {
    fontSize: '0.75rem',
    fontFamily: fonts.mono,
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    background: colors.bgSecondary,
    color: colors.textSecondary,
    border: `1px solid ${colors.borderColor}`,
  },
  links: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  link: {
    fontSize: '0.85rem',
    color: colors.accentBlue,
    textDecoration: 'none',
    fontFamily: fonts.system,
    fontWeight: 500,
  },
}

export function ProjectCard({ project }: { project: Project }) {
  const { style: hoverStyle, handlers } = useHoverLift(shadows.md)

  return (
    <div style={{ ...styles.card, ...hoverStyle }} {...handlers}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.name}>{project.name}</h3>
          <p style={styles.tagline}>{project.tagline}</p>
        </div>
        <span
          style={{
            ...styles.status,
            color: project.statusColor,
            background: `${project.statusColor}18`,
          }}
        >
          {project.status}
        </span>
      </div>
      <p style={styles.description}>{project.description}</p>
      <div style={styles.techRow}>
        {project.tech.map((t) => (
          <span key={t} style={styles.techBadge}>
            {t}
          </span>
        ))}
      </div>
      <div style={styles.links}>
        <a href={project.url} target="_blank" rel="noopener noreferrer" style={styles.link}>
          GitHub
        </a>
        {project.readerUrl && (
          <a href={project.readerUrl} style={styles.link}>
            Documentation
          </a>
        )}
      </div>
    </div>
  )
}
