const STEPS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
      </svg>
    ),
    key: 'step1',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    key: 'step2',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    key: 'step3',
  },
]

export default function HowItWorks({ t }) {
  return (
    <section id="how-it-works" className="section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, marginBottom: 12 }}>
            {t('howItWorks.title')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {STEPS.map((step, i) => (
            <div
              key={step.key}
              className="card"
              style={{ padding: 32, position: 'relative', overflow: 'hidden' }}
            >
              {/* Step number */}
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 20,
                  fontSize: 64,
                  fontWeight: 800,
                  color: 'var(--border)',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                {i + 1}
              </div>

              {/* Icon */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: 'var(--primary-glow)',
                  border: '1px solid var(--primary)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  marginBottom: 20,
                }}
              >
                {step.icon}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
                {t(`howItWorks.${step.key}Title`)}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>
                {t(`howItWorks.${step.key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
