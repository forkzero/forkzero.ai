import { createRoot } from 'react-dom/client'
import { App } from './App'
import { colors, fonts } from './tokens'

const root = document.getElementById('root')!

// Reset browser defaults
Object.assign(document.body.style, {
  margin: '0',
  padding: '0',
  fontFamily: fonts.system,
  background: colors.bgSecondary,
  color: colors.textPrimary,
  lineHeight: '1.6',
})

// Box-sizing reset
const style = document.createElement('style')
style.textContent = '*, *::before, *::after { box-sizing: border-box; }'
document.head.appendChild(style)

createRoot(root).render(<App />)
