import { useState, useEffect, useRef } from 'react'
import { colors, fonts } from '../tokens'
import { injectGlobalStyles } from '../styles'

export function CopyButton({ text }: { text: string }) {
  injectGlobalStyles()
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(
    () => () => {
      clearTimeout(timerRef.current)
    },
    [],
  )

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      data-fzui
      style={{
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        background: copied ? colors.accentGreen : 'rgba(255,255,255,0.1)',
        color: copied ? '#ffffff' : 'rgba(255,255,255,0.7)',
        border: 'none',
        borderRadius: '4px',
        padding: '0.3rem 0.6rem',
        minHeight: '2.75rem',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontFamily: fonts.system,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
