import { useState, type FormEvent } from 'react'
import { colors, radius } from '@forkzero/ui'
import { SUBSCRIBE_API_URL } from '../constants'

interface EmailCaptureProps {
  heading: string
  subtext: string
  style?: React.CSSProperties
  formStyle?: React.CSSProperties
  inputStyle?: React.CSSProperties
  buttonStyle?: React.CSSProperties
}

const defaultFormStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
}

const defaultInputStyle: React.CSSProperties = {
  flex: '1 1 200px',
  padding: '0.6rem 0.75rem',
  fontSize: '0.9rem',
  borderRadius: radius,
  border: `1px solid ${colors.borderColor}`,
  background: colors.bgPrimary,
  color: colors.textPrimary,
  outline: 'none',
}

const defaultButtonStyle: React.CSSProperties = {
  padding: '0.6rem 1.25rem',
  fontSize: '0.9rem',
  fontWeight: 600,
  borderRadius: radius,
  border: 'none',
  background: colors.accentBlue,
  color: colors.textOnAccent,
  cursor: 'pointer',
}

export function EmailCapture({
  heading,
  subtext,
  style,
  formStyle = defaultFormStyle,
  inputStyle = defaultInputStyle,
  buttonStyle = defaultButtonStyle,
}: EmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    if (honeypot) return
    setStatus('submitting')
    fetch(SUBSCRIBE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, website: honeypot }),
    })
      .then((res) => {
        if (res.ok) {
          setStatus('success')
          setEmail('')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }

  return (
    <div style={style}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: colors.textPrimary, margin: '0 0 0.35rem' }}>
        {heading}
      </h3>
      <p style={{ fontSize: '0.9rem', color: colors.textMuted, lineHeight: 1.5, margin: '0 0 1rem' }}>{subtext}</p>
      {status === 'success' ? (
        <p style={{ fontSize: '0.95rem', color: colors.accentGreen }}>You&rsquo;re in.</p>
      ) : (
        <form style={formStyle} onSubmit={handleSubmit}>
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
          />
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            aria-label="Email address"
          />
          <button type="submit" disabled={status === 'submitting'} style={buttonStyle}>
            {status === 'submitting' ? 'Subscribing\u2026' : 'Subscribe'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p style={{ fontSize: '0.9rem', color: colors.accentRed, marginTop: '0.5rem' }}>
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  )
}
