import { useState } from 'react'

const INSTALL_CMD = 'npm install @ibra69/41devs-gateway'

export default function Hero({ t }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(INSTALL_CMD)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section
      style={{
        paddingTop: 140,
        paddingBottom: 80,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 600,
          background: 'radial-gradient(ellipse, var(--primary-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            background: 'var(--primary-glow)',
            border: '1px solid var(--primary)',
            borderRadius: 100,
            fontSize: 13,
            color: 'var(--primary-light)',
            fontWeight: 500,
            marginBottom: 28,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
          {t('hero.badge')}
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 60px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 20,
            maxWidth: 760,
            margin: '0 auto 20px',
          }}
        >
          <span className="gradient-text">{t('hero.title')}</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 18,
            color: 'var(--text-muted)',
            maxWidth: 560,
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}
        >
          {t('hero.subtitle')}
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <a href="#demo" className="btn-primary" style={{ fontSize: 16, padding: '14px 28px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
            </svg>
            {t('hero.cta')}
          </a>
          <a href="#snippets" className="btn-ghost" style={{ fontSize: 16, padding: '14px 28px' }}>
            {t('hero.ctaCode')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Install command */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 20px',
            background: 'var(--bg-code)',
            border: '1px solid var(--bg-code-border)',
            borderRadius: 10,
            marginBottom: 64,
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>$</span>
          <code style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
            {INSTALL_CMD}
          </code>
          <button
            onClick={copy}
            title="Copier"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: copied ? 'var(--success)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
              transition: 'color 0.15s',
            }}
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            )}
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 48,
            flexWrap: 'wrap',
          }}
        >
          {[
            { val: t('hero.stat1'), label: t('hero.stat1Label') },
            { val: t('hero.stat2'), label: t('hero.stat2Label') },
            { val: t('hero.stat3'), label: t('hero.stat3Label') },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: 'var(--primary)',
                  lineHeight: 1.1,
                  marginBottom: 4,
                }}
              >
                {val}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Operator logos */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
            marginTop: 48,
            flexWrap: 'wrap',
          }}
        >
          {[
            { name: 'MTN', color: '#ffcc00', text: '#000' },
            { name: 'Orange', color: '#ff6600', text: '#fff' },
            { name: 'Moov', color: '#0066cc', text: '#fff' },
            { name: 'Wave', color: '#1a9fe0', text: '#fff' },
            { name: 'Carte', color: '#16a34a', text: '#fff' },
          ].map(({ name, color, text }) => (
            <div
              key={name}
              style={{
                padding: '8px 16px',
                background: color,
                color: text,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
