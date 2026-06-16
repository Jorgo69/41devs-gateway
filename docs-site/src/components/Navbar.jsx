import { useState, useEffect } from 'react'

export default function Navbar({ t, dark, setDark, lang, toggleLang }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled
          ? dark
            ? 'rgba(2, 6, 23, 0.92)'
            : 'rgba(248, 250, 252, 0.92)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.2s',
      }}
    >
      <div
        className="container"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}
      >
        {/* Logo */}
        <a
          href="#"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: 'var(--primary)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
            41DEVS <span style={{ color: 'var(--primary)', fontWeight: 400 }}>Gateway</span>
          </span>
        </a>

        {/* Nav links */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <NavLink href="#how-it-works">{t('nav.howItWorks')}</NavLink>
          <NavLink href="#demo">{t('nav.demo')}</NavLink>
          <NavLink href="#snippets">{t('nav.code')}</NavLink>
          <NavLink href="#veep">VEEP API</NavLink>

          {/* Lang toggle */}
          <button
            onClick={toggleLang}
            style={{
              padding: '6px 12px',
              background: 'var(--bg-code)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text-muted)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: 4,
            }}
          >
            {t('nav.lang')}
          </button>

          {/* Dark mode */}
          <button
            onClick={() => setDark((d) => !d)}
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-code)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              cursor: 'pointer',
              color: 'var(--text)',
            }}
            title="Toggle dark mode"
          >
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* NPM button */}
          <a
            href="https://www.npmjs.com/package/@ibra69/41devs-gateway"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            npm install
          </a>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      style={{
        padding: '8px 14px',
        color: 'var(--text-muted)',
        fontSize: 14,
        fontWeight: 500,
        textDecoration: 'none',
        borderRadius: 6,
        transition: 'color 0.15s',
      }}
      onMouseEnter={(e) => (e.target.style.color = 'var(--text)')}
      onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
    >
      {children}
    </a>
  )
}
