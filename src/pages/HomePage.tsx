import { colors, fonts } from '../tokens'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { ProjectCard } from '../components/ProjectCard'
import { Footer } from '../components/Footer'
import { projects } from '../data/projects'

const styles = {
  projectsSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    fontFamily: fonts.system,
    color: colors.textPrimary,
    marginBottom: '1.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '1.5rem',
  },
}

export function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <section style={styles.projectsSection}>
        <h2 style={styles.sectionTitle}>Projects</h2>
        <div style={styles.grid}>
          {projects.map(p => (
            <ProjectCard key={p.name} project={p} />
          ))}
        </div>
      </section>
      <Footer />
    </>
  )
}
