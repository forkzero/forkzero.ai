import { HomePage } from './pages/HomePage'
import { ReaderPage } from './pages/ReaderPage'

function getRoute(): 'home' | 'reader' {
  const path = window.location.pathname
  if (path === '/reader' || path === '/reader/') return 'reader'
  return 'home'
}

export function App() {
  const route = getRoute()

  switch (route) {
    case 'reader':
      return <ReaderPage />
    default:
      return <HomePage />
  }
}
