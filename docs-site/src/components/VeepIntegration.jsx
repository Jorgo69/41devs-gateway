import { useState } from 'react'

const STEPS = [
  {
    num: '01',
    title: { fr: 'Créez votre compte VEEP', en: 'Create your VEEP account' },
    desc: {
      fr: 'Inscrivez-vous sur VEEP en tant qu\'organisateur. Une fois votre entreprise approuvée, accédez à votre tableau de bord.',
      en: 'Sign up on VEEP as an organizer. Once your company is approved, access your dashboard.',
    },
    code: null,
  },
  {
    num: '02',
    title: { fr: 'Générez votre clé API', en: 'Generate your API key' },
    desc: {
      fr: 'Dans Paramètres → Développeur, créez une clé `vp_live_xxx`. Copiez-la — elle ne sera plus visible après.',
      en: 'In Settings → Developer, create a `vp_live_xxx` key. Copy it — it won\'t be shown again.',
    },
    code: null,
  },
  {
    num: '03',
    title: { fr: 'Listez vos événements', en: 'List your events' },
    desc: {
      fr: 'Récupérez vos événements publiés et les tickets disponibles.',
      en: 'Fetch your published events and available tickets.',
    },
    code: `// Vos événements publiés
const res = await fetch('https://api.prod.veep.fun/api/v1/developer/public/events', {
  headers: { 'Authorization': 'Bearer vp_live_VOTRE_CLE' },
})
const { items } = await res.json()
// → [{ id, title, eventDates, isFree, ... }]

// Tickets d'un événement
const tickets = await fetch(
  'https://api.prod.veep.fun/api/v1/developer/public/events/EVENT_ID/tickets',
  { headers: { 'Authorization': 'Bearer vp_live_VOTRE_CLE' } }
)`,
  },
  {
    num: '04',
    title: { fr: 'Ouvrez la modal de paiement', en: 'Open the payment modal' },
    desc: {
      fr: 'Initialisez le gateway avec votre clé et l\'URL de base. Un clic → la modal complète.',
      en: 'Initialize the gateway with your key and base URL. One click → the complete modal.',
    },
    code: `import { createGateway } from '@ibra69/41devs-gateway'

// apiBaseUrl et la clé KKiaPay sont déjà configurées dans le SDK —
// seule votre publicKey est nécessaire.
const gateway = createGateway({
  publicKey: 'vp_live_VOTRE_CLE',
})

// 1 event → gateway liste les tickets, user choisit
await gateway.openPayment({ eventId: 'uuid-de-l-evenement' })

// Plusieurs events → user choisit d'abord l'event
await gateway.openPayment({
  eventIds: ['uuid-event-1', 'uuid-event-2'],
})`,
  },
  {
    num: '05',
    title: { fr: 'Vérifiez la commande', en: 'Verify the order' },
    desc: {
      fr: 'Le SDK poll automatiquement, mais vous pouvez aussi interroger le statut côté serveur.',
      en: 'The SDK polls automatically, but you can also check the status server-side.',
    },
    code: `// Statut d'une commande (côté serveur ou côté client)
const status = await fetch(
  'https://api.prod.veep.fun/api/v1/developer/public/orders/ORDER_ID',
  { headers: { 'Authorization': 'Bearer vp_live_VOTRE_CLE' } }
)
const order = await status.json()
// order.status → 'PENDING' | 'CONFIRMED' | 'FAILED'
// order.orderNumber → "ORD-2026-XXXXX"`,
  },
  {
    num: '06',
    title: { fr: 'Paiement carte — automatique', en: 'Card payment — automatic' },
    desc: {
      fr: 'La carte bancaire (Visa, Mastercard, Verve) est toujours proposée en plus des opérateurs mobile money, quel que soit le pays de l\'acheteur. Rien à configurer : le SDK ouvre le widget KKiaPay et ne voit jamais le numéro de carte, l\'expiration ou le CVV.',
      en: 'Card payment (Visa, Mastercard, Verve) is always offered alongside mobile money operators, regardless of the buyer\'s country. Nothing to configure: the SDK opens the KKiaPay widget and never sees the card number, expiry or CVV.',
    },
    code: `// Rien à faire de plus — "Carte bancaire" apparaît
// automatiquement dans la liste, pour tous les pays.
await gateway.openPayment({ eventId: 'uuid-de-l-evenement' })

// Prénom/nom/email/téléphone déjà saisis pré-remplissent
// le widget KKiaPay — l'acheteur ne retape rien.`,
  },
]

const ENDPOINTS = [
  { method: 'GET', path: '/developer/public/events', desc: { fr: 'Vos événements publiés', en: 'Your published events' }, scope: 'events:read' },
  { method: 'GET', path: '/developer/public/events/:id/tickets', desc: { fr: 'Tickets d\'un événement', en: 'Tickets for an event' }, scope: 'events:read' },
  { method: 'GET', path: '/developer/public/countries', desc: { fr: 'Pays disponibles (AfribaPay)', en: 'Available countries (AfribaPay)' }, scope: '—' },
  { method: 'GET', path: '/developer/public/operators?country=BJ', desc: { fr: 'Opérateurs par pays', en: 'Operators by country' }, scope: '—' },
  { method: 'POST', path: '/developer/public/orders', desc: { fr: 'Créer une commande', en: 'Create an order' }, scope: 'orders:write' },
  { method: 'GET', path: '/developer/public/orders/:id', desc: { fr: 'Statut d\'une commande', en: 'Order status' }, scope: 'orders:read' },
  { method: 'POST', path: '/developer/public/orders/:id/verify-card', desc: { fr: 'Vérifier un paiement carte (après le widget KKiaPay)', en: 'Verify a card payment (after the KKiaPay widget)' }, scope: 'orders:write' },
]

export default function VeepIntegration({ t }) {
  const [activeStep, setActiveStep] = useState(3)
  const lang = t('nav.lang') === 'EN' ? 'fr' : 'en'
  const [copied, setCopied] = useState(null)

  const copy = (code, i) => {
    navigator.clipboard.writeText(code)
    setCopied(i)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <section
      id="veep"
      style={{
        padding: '80px 0',
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 14px',
              background: 'rgba(22,163,74,0.1)',
              border: '1px solid rgba(22,163,74,0.3)',
              borderRadius: 100,
              fontSize: 12,
              color: '#16a34a',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            ⚡ VEEP API
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, marginBottom: 12 }}>
            {lang === 'fr' ? 'Intégration VEEP complète' : 'Full VEEP Integration'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
            {lang === 'fr'
              ? 'De la clé API à la première commande.'
              : 'From API key to first order.'}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            marginBottom: 56,
          }}
        >
          {/* Steps list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STEPS.map((step, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  padding: '16px 20px',
                  borderRadius: 10,
                  border: '1px solid',
                  borderColor: activeStep === i ? 'var(--primary)' : 'var(--border)',
                  background: activeStep === i ? 'var(--primary-glow)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: activeStep === i ? 'var(--primary)' : 'var(--text-muted)',
                    fontFamily: 'JetBrains Mono, monospace',
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {step.num}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                    {step.title[lang]}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {step.desc[lang]}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Code panel */}
          <div>
            {STEPS[activeStep].code ? (
              <div
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 12,
                  overflow: 'hidden',
                  position: 'sticky',
                  top: 80,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderBottom: '1px solid #1e293b',
                    background: '#020617',
                  }}
                >
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                    <span style={{ marginLeft: 8, fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>
                      {lang === 'fr' ? `Étape ${STEPS[activeStep].num}` : `Step ${STEPS[activeStep].num}`}
                    </span>
                  </div>
                  <button
                    onClick={() => copy(STEPS[activeStep].code, activeStep)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', background: '#1e293b', border: '1px solid #334155',
                      borderRadius: 5, color: copied === activeStep ? '#22c55e' : '#94a3b8',
                      fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    {copied === activeStep ? '✓ Copié' : 'Copier'}
                  </button>
                </div>
                <pre
                  style={{
                    padding: 24,
                    fontSize: 12.5,
                    lineHeight: 1.8,
                    overflowX: 'auto',
                    margin: 0,
                    fontFamily: 'JetBrains Mono, Fira Code, monospace',
                    color: '#e2e8f0',
                    whiteSpace: 'pre',
                  }}
                >
                  {STEPS[activeStep].code}
                </pre>
              </div>
            ) : (
              <div
                className="card"
                style={{
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 200,
                  textAlign: 'center',
                  gap: 12,
                  position: 'sticky',
                  top: 80,
                }}
              >
                <div style={{ fontSize: 40 }}>
                  {activeStep === 0 ? '🏢' : '🔑'}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 280, lineHeight: 1.6 }}>
                  {activeStep === 0
                    ? (lang === 'fr'
                        ? 'Créez votre compte sur veep.fun → Tableau de bord → Entreprise'
                        : 'Create your account at veep.fun → Dashboard → Company')
                    : (lang === 'fr'
                        ? 'Tableau de bord VEEP → Paramètres → Développeur → Nouvelle clé'
                        : 'VEEP Dashboard → Settings → Developer → New key')}
                </p>
                <a
                  href="https://veep.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ fontSize: 13, padding: '10px 20px', marginTop: 8 }}
                >
                  Ouvrir VEEP →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Endpoints table */}
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            {lang === 'fr' ? 'Endpoints exposés' : 'Exposed endpoints'}
          </h3>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 1fr 120px',
                padding: '10px 20px',
                background: 'var(--bg-code)',
                borderBottom: '1px solid var(--border)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <span>{lang === 'fr' ? 'Méthode' : 'Method'}</span>
              <span>Endpoint</span>
              <span>{lang === 'fr' ? 'Description' : 'Description'}</span>
              <span>Scope</span>
            </div>
            {ENDPOINTS.map((ep, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 1fr 120px',
                  padding: '14px 20px',
                  borderBottom: i < ENDPOINTS.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: ep.method === 'GET' ? 'rgba(37,99,235,0.1)' : 'rgba(22,163,74,0.1)',
                    color: ep.method === 'GET' ? 'var(--primary)' : '#16a34a',
                    fontFamily: 'monospace',
                    display: 'inline-block',
                  }}
                >
                  {ep.method}
                </span>
                <code
                  style={{
                    fontSize: 12,
                    color: 'var(--text)',
                    fontFamily: 'JetBrains Mono, monospace',
                    wordBreak: 'break-all',
                  }}
                >
                  {ep.path}
                </code>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {ep.desc[lang]}
                </span>
                <code
                  style={{
                    fontSize: 11,
                    color: ep.scope === '—' ? 'var(--text-muted)' : 'var(--primary)',
                    fontFamily: 'monospace',
                  }}
                >
                  {ep.scope}
                </code>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
            Base URL : <code style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: 12 }}>https://api.prod.veep.fun/api/v1</code>
            {' '}— Auth : <code style={{ color: 'var(--text)', fontFamily: 'monospace', fontSize: 12 }}>Authorization: Bearer vp_live_xxx</code>
          </p>
        </div>
      </div>
    </section>
  )
}
