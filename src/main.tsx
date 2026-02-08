import { createRoot } from 'react-dom/client'
import { App } from './App'

const root = document.getElementById('root')!

// Reset browser defaults
Object.assign(document.body.style, {
  margin: '0',
  padding: '0',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  background: '#f8f9fa',
  color: '#1a1a2e',
  lineHeight: '1.6',
})

// Box-sizing reset
const style = document.createElement('style')
style.textContent = '*, *::before, *::after { box-sizing: border-box; }'
document.head.appendChild(style)

createRoot(root).render(<App />)
