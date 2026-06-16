import { useState, useRef } from 'react'
import { createGateway } from '@gateway/index.js'

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// Gateway en mode GÉNÉRIQUE — simule un appel backend
const demoGateway = createGateway({
  theme: 'auto',
  onSubmit: async (formData) => {
    await sleep(1800)
    return { orderId: 'DEMO-' + Math.floor(Math.random() * 90000 + 10000), status: 'PENDING' }
  },
  onPoll: async (orderId) => {
    await sleep(3500)
    return { status: 'CONFIRMED', success: true, orderNumber: orderId, email: '' }
  },
})

export default function Demo({ t }) {
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  const handleBuy = async () => {
    if (loading) return
    setLoading(true)
    setLastResult(null)
    try {
      const result = await demoGateway.openPayment({
        amount: 25000,
        currency: 'XOF',
        methods: ['MTN', 'Orange', 'Moov', 'Wave'],
      })
      setLastResult({ ok: true, data: result })
    } catch (e) {
      if (e?.code !== 'CANCELLED') {
        setLastResult({ ok: false, msg: e?.message ?? 'Erreur' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="demo"
      className="section"
      style={{ background: 'var(--bg-code)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, marginBottom: 12 }}>
            {t('demo.title')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>{t('demo.subtitle')}</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {/* Event card (left) */}
          <div className="card" style={{ padding: 32, maxWidth: 440, margin: '0 auto', width: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t('demo.event')}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {t('demo.date')}
                </p>
              </div>
            </div>

            {/* Info rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <InfoRow
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                }
                label={t('demo.location')}
              />
              <InfoRow
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                }
                label={`${t('demo.ticket')} — ${t('demo.price')}`}
                bold
              />
            </div>

            {/* Seats badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                background: 'rgba(234, 88, 12, 0.1)',
                border: '1px solid rgba(234, 88, 12, 0.3)',
                borderRadius: 100,
                fontSize: 12,
                color: '#ea580c',
                fontWeight: 600,
                marginBottom: 24,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ea580c', display: 'inline-block' }} />
              {t('demo.seatsLeft')}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border)', marginBottom: 24 }} />

            {/* Buy button */}
            <button
              onClick={handleBuy}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px 24px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <Spinner />
                  Ouverture...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="9" cy="21" r="1" fill="currentColor" />
                    <circle cx="20" cy="21" r="1" fill="currentColor" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  {t('demo.btnBuy')}
                </>
              )}
            </button>

            {/* Note */}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
              ⓘ {t('demo.note')}
            </p>

            {/* Last result */}
            {lastResult && (
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  borderRadius: 8,
                  background: lastResult.ok ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                  border: `1px solid ${lastResult.ok ? 'rgba(22, 163, 74, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`,
                  fontSize: 13,
                  color: lastResult.ok ? 'var(--success)' : '#dc2626',
                }}
              >
                {lastResult.ok
                  ? `✓ Paiement confirmé — ${lastResult.data?.orderNumber ?? ''}`
                  : `✕ ${lastResult.msg}`}
              </div>
            )}
          </div>

          {/* Code preview (right) */}
          <div style={{ maxWidth: 520, margin: '0 auto', width: '100%' }}>
            <div
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              {/* Tab bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '12px 16px',
                  borderBottom: '1px solid #1e293b',
                  background: '#020617',
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ marginLeft: 8, fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>
                  index.js
                </span>
              </div>

              {/* Code */}
              <pre
                style={{
                  padding: 24,
                  fontSize: 13,
                  lineHeight: 1.8,
                  overflowX: 'auto',
                  margin: 0,
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  color: '#e2e8f0',
                }}
              >
                <CodeLine>
                  <Kw>import</Kw> {'{ createGateway } '}<Kw>from</Kw>{' '}
                  <Str>'@ibra69/41devs-gateway'</Str>
                </CodeLine>
                <br />
                <CodeLine>
                  <Cm>// Mode GÉNÉRIQUE — votre propre backend</Cm>
                </CodeLine>
                <CodeLine>
                  <Kw>const</Kw> gateway = <Fn>createGateway</Fn>{'({'}
                </CodeLine>
                <CodeLine indent>
                  <Fn>onSubmit</Fn>{': async (formData) => {'}
                </CodeLine>
                <CodeLine indent2>
                  <Kw>const</Kw> res = <Kw>await</Kw> <Fn>fetch</Fn>(<Str>'/api/orders'</Str>, {'{'} ... {'}'})
                </CodeLine>
                <CodeLine indent2>
                  <Kw>return</Kw> res.<Fn>json</Fn>() <Cm>// {'{ orderId }'}</Cm>
                </CodeLine>
                <CodeLine indent>{'}'},{''}</CodeLine>
                <CodeLine indent>
                  <Fn>onPoll</Fn>{': async (orderId) => {'}
                </CodeLine>
                <CodeLine indent2>
                  <Kw>const</Kw> res = <Kw>await</Kw> <Fn>fetch</Fn>(<Str>{`\`/api/orders/\${orderId}\``}</Str>)
                </CodeLine>
                <CodeLine indent2>
                  <Kw>return</Kw> res.<Fn>json</Fn>() <Cm>// {'{ status }'}</Cm>
                </CodeLine>
                <CodeLine indent>{'}'},{''}</CodeLine>
                <CodeLine>{'});'}</CodeLine>
                <br />
                <CodeLine>
                  <Cm>// Un clic → modal complète</Cm>
                </CodeLine>
                <CodeLine>
                  <Kw>await</Kw> gateway.<Fn>openPayment</Fn>({'({'})
                </CodeLine>
                <CodeLine indent>
                  amount: <Num>25000</Num>, currency: <Str>'XOF'</Str>,
                </CodeLine>
                <CodeLine>{'});'}</CodeLine>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function InfoRow({ icon, label, bold }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: bold ? 600 : 400, color: bold ? 'var(--text)' : 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function CodeLine({ children, indent, indent2 }) {
  const pad = indent2 ? '    ' : indent ? '  ' : ''
  return <div>{pad}{children}</div>
}

function Kw({ children }) {
  return <span style={{ color: '#a78bfa' }}>{children}</span>
}
function Fn({ children }) {
  return <span style={{ color: '#38bdf8' }}>{children}</span>
}
function Str({ children }) {
  return <span style={{ color: '#4ade80' }}>{children}</span>
}
function Cm({ children }) {
  return <span style={{ color: '#475569' }}>{children}</span>
}
function Num({ children }) {
  return <span style={{ color: '#f87171' }}>{children}</span>
}
