import { useState } from 'react'

const OPTIONS = [
  {
    key: 'logo',
    title: { fr: 'Logo & Marque', en: 'Logo & Branding' },
    desc: {
      fr: 'Affichez votre logo à côté du logo 41 Devs, ou remplacez-le entièrement. En mode AUTO, le logo de votre event VEEP est récupéré automatiquement si disponible.',
      en: 'Show your logo next to the 41 Devs logo, or replace it entirely. In AUTO mode, your VEEP event logo is fetched automatically if available.',
    },
    code: `const gateway = createGateway({
  publicKey: 'vp_live_xxx',

  // Logo de votre marque (affiché à droite — côté client)
  merchantLogoUrl: 'https://votre-site.com/logo.png',

  // Remplacer le logo 41 Devs par le vôtre
  logoUrl: 'https://votre-site.com/logo-41.png',

  // Masquer le logo 41 Devs entièrement
  useDefault41DevLogo: false,
})`,
  },
  {
    key: 'theme',
    title: { fr: 'Thème & Couleurs', en: 'Theme & Colors' },
    desc: {
      fr: 'Suivez le thème du navigateur (auto), forcez clair ou sombre, et surchargez n\'importe quelle couleur de la palette.',
      en: 'Follow the browser theme (auto), force light or dark, and override any palette color.',
    },
    code: `const gateway = createGateway({
  publicKey: 'vp_live_xxx',

  // 'light' | 'dark' | 'auto' (défaut: 'auto')
  theme: 'dark',

  // Surcharge granulaire de la palette
  colors: {
    primary: '#6366f1',           // couleur principale (boutons, focus)
    primaryButtonBg: '#6366f1',   // fond bouton primaire
    primaryButtonText: '#ffffff', // texte bouton primaire
    modalBg: '#0f172a',           // fond du modal
    textPrimary: '#f1f5f9',       // texte principal
    textSecondary: '#94a3b8',     // texte secondaire
  },
})`,
  },
  {
    key: 'size',
    title: { fr: 'Tailles du Modal', en: 'Modal Sizes' },
    desc: {
      fr: 'Contrôlez les largeurs séparément pour les étapes events/tickets (large) et paiement (compact). Par défaut : 560px / 380px. Le modal est toujours responsive (max 95vw sur mobile).',
      en: 'Control widths separately for events/tickets steps (wide) and payment steps (compact). Defaults: 560px / 380px. The modal is always responsive (max 95vw on mobile).',
    },
    code: `const gateway = createGateway({
  publicKey: 'vp_live_xxx',

  // Largeur étapes events + tickets (défaut: '560px')
  eventsModalWidth: '640px',

  // Largeur étapes paiement (défaut: '380px')
  paymentModalWidth: '420px',
})

// Sur mobile : toujours limité à 95vw automatiquement`,
  },
  {
    key: 'callbacks',
    title: { fr: 'Callbacks', en: 'Callbacks' },
    desc: {
      fr: 'Réagissez à chaque événement du cycle de vie : succès, annulation, erreur.',
      en: 'React to every lifecycle event: success, cancel, error.',
    },
    code: `const result = await gateway.openPayment({
  eventId: 'uuid-de-l-evenement',
  currency: 'XOF',

  // Appelé quand le paiement est confirmé
  onComplete: (order) => {
    console.log('Commande :', order.orderNumber)
    analytics.track('purchase', { id: order.orderId })
  },

  // Appelé si l'utilisateur ferme le modal
  onCancel: () => {
    console.log('Paiement annulé')
  },

  // Appelé en cas d'erreur réseau ou API
  onError: (err) => {
    console.error('Erreur paiement :', err.message)
  },
})`,
  },
]

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', borderBottom: '1px solid #1e293b', background: '#020617',
        }}
      >
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ marginLeft: 8, fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>
            createGateway
          </span>
        </div>
        <button
          onClick={copy}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', background: '#1e293b', border: '1px solid #334155',
            borderRadius: 5, color: copied ? '#22c55e' : '#94a3b8', fontSize: 12, cursor: 'pointer',
          }}
        >
          {copied ? (lang === 'fr' ? '✓ Copié' : '✓ Copied') : (lang === 'fr' ? 'Copier' : 'Copy')}
        </button>
      </div>
      <pre
        style={{
          padding: 24, fontSize: 12.5, lineHeight: 1.8, overflowX: 'auto',
          margin: 0, fontFamily: 'JetBrains Mono, Fira Code, monospace',
          color: '#e2e8f0', whiteSpace: 'pre',
        }}
      >
        {code}
      </pre>
    </div>
  )
}

export default function Customization({ t }) {
  const [active, setActive] = useState(0)
  const lang = t('nav.lang') === 'EN' ? 'fr' : 'en'

  return (
    <section
      id="customization"
      style={{ padding: '80px 0', background: 'var(--bg-code)', borderTop: '1px solid var(--border)' }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 14px', background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100,
              fontSize: 12, color: '#818cf8', fontWeight: 600, marginBottom: 16,
            }}
          >
            🎨 {lang === 'fr' ? 'Personnalisation' : 'Customization'}
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, marginBottom: 12 }}>
            {lang === 'fr' ? 'À vos couleurs, en 2 lignes' : 'Your brand, 2 lines of code'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
            {lang === 'fr'
              ? 'Logo, thème, tailles, callbacks — tout se configure dans createGateway().'
              : 'Logo, theme, sizes, callbacks — all configured in createGateway().'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {/* Option tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {OPTIONS.map((opt, i) => (
              <button
                key={opt.key}
                onClick={() => setActive(i)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  padding: '16px 20px', borderRadius: 10, border: '1px solid',
                  borderColor: active === i ? 'var(--primary)' : 'var(--border)',
                  background: active === i ? 'var(--primary-glow)' : 'var(--bg-card)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <span
                  style={{
                    fontSize: 20, flexShrink: 0, marginTop: 1,
                  }}
                >
                  {opt.key === 'logo' ? '🏷️' : opt.key === 'theme' ? '🎨' : opt.key === 'size' ? '📐' : '⚡'}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                    {opt.title[lang]}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {opt.desc[lang]}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Code panel */}
          <div style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
            <CodeBlock code={OPTIONS[active].code} lang={lang} />
          </div>
        </div>

        {/* Note logo auto */}
        <div
          style={{
            marginTop: 32, padding: '14px 20px', borderRadius: 10,
            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {lang === 'fr'
              ? 'En mode AUTO avec un eventId, le gateway récupère automatiquement le logo de votre événement VEEP et l\'affiche dans la modal — sans configuration supplémentaire.'
              : 'In AUTO mode with an eventId, the gateway automatically fetches your VEEP event logo and displays it in the modal — no extra configuration needed.'}
          </p>
        </div>
      </div>
    </section>
  )
}
