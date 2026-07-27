import { useState } from 'react'

const CODE = {
  auto: `import { createGateway } from '@ibra69/41devs-gateway'

const gateway = createGateway({
  publicKey: 'vp_live_VOTRE_CLE_PUBLIQUE',
})

// Ouvre la modal avec le flux complet VEEP + KKiaPay
// (mobile money ET carte bancaire, automatiquement)
const result = await gateway.openPayment({
  eventId: 'uuid-de-l-evenement',
  ticketId: 'uuid-du-ticket',
  quantity: 2,
  amount: 50000,
  currency: 'XOF',
})

console.log('Commande confirmée :', result.orderNumber)`,

  generic: `import { createGateway } from '@ibra69/41devs-gateway'

const gateway = createGateway({
  // Votre propre backend — le SDK ne connaît pas votre API
  onSubmit: async (formData) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: formData.fullPhone,
        email: formData.email,
        name: formData.prenom + ' ' + formData.nom,
      }),
    })
    return res.json() // Doit retourner { orderId, status }
  },

  onPoll: async (orderId) => {
    const res = await fetch(\`/api/orders/\${orderId}/status\`)
    return res.json() // { status: 'CONFIRMED' | 'PENDING' | 'FAILED' }
  },

  onComplete: (result) => {
    console.log('Paiement validé :', result)
  },

  onError: (err) => {
    console.error('Erreur paiement :', err.message)
  },
})

await gateway.openPayment({
  amount: 25000,
  currency: 'XOF',
  // Optionnel : restreindre les opérateurs affichés
  methods: ['MTN', 'Orange', 'Moov'],
})`,

  cdn: `<!-- Dans votre page HTML, sans bundler -->
<script type="module">
  import { createGateway }
    from 'https://cdn.jsdelivr.net/npm/@ibra69/41devs-gateway@latest/index.js'

  const gateway = createGateway({
    onSubmit: async (formData) => {
      // Votre logique ici
      return { orderId: 'ORD-001', status: 'PENDING' }
    },
    onPoll: async (orderId) => {
      return { status: 'CONFIRMED', success: true }
    },
  })

  document.getElementById('btn-pay').addEventListener('click', () => {
    gateway.openPayment({ amount: 5000, currency: 'XOF' })
  })
</script>

<button id="btn-pay">Payer maintenant</button>`,
}

const TABS = ['auto', 'generic', 'cdn']

export default function Snippets({ t }) {
  const [tab, setTab] = useState('auto')
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(CODE[tab])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="snippets" className="section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, marginBottom: 12 }}>
            {t('snippets.title')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>{t('snippets.subtitle')}</p>
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 0,
            flexWrap: 'wrap',
          }}
        >
          {TABS.map((key) => (
            <button
              key={key}
              onClick={() => { setTab(key); setCopied(false) }}
              style={{
                padding: '10px 20px',
                borderRadius: '8px 8px 0 0',
                border: '1px solid',
                borderBottom: 'none',
                borderColor: tab === key ? 'var(--border)' : 'transparent',
                background: tab === key ? (key === 'auto' ? '#0f172a' : '#0f172a') : 'transparent',
                color: tab === key ? '#e2e8f0' : 'var(--text-muted)',
                fontSize: 14,
                fontWeight: tab === key ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {t(`snippets.tab${key.charAt(0).toUpperCase() + key.slice(1)}`)}
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 11,
                  color: tab === key ? '#64748b' : 'var(--text-muted)',
                  fontWeight: 400,
                }}
              >
                — {t(`snippets.tab${key.charAt(0).toUpperCase() + key.slice(1)}Desc`)}
              </span>
            </button>
          ))}
        </div>

        {/* Code block */}
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '0 8px 8px 8px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Copy button */}
          <button
            onClick={copy}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 6,
              color: copied ? '#22c55e' : '#94a3b8',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              zIndex: 1,
              transition: 'color 0.15s',
            }}
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copié !
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                Copier
              </>
            )}
          </button>

          <pre
            style={{
              padding: 28,
              paddingTop: 24,
              fontSize: 13.5,
              lineHeight: 1.8,
              overflowX: 'auto',
              margin: 0,
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              color: '#e2e8f0',
              whiteSpace: 'pre',
            }}
          >
            <HighlightedCode code={CODE[tab]} />
          </pre>
        </div>

        {/* Features grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginTop: 40,
          }}
        >
          {FEATURES.map(({ icon, label, desc }) => (
            <div
              key={label}
              className="card"
              style={{ padding: '20px 24px', display: 'flex', gap: 14, alignItems: 'flex-start' }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{label}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FEATURES = [
  { icon: '🌍', label: 'Multi-pays', desc: 'Bénin, Côte d\'Ivoire, Togo, Sénégal, Burkina Faso…' },
  { icon: '💳', label: 'Carte incluse', desc: 'Visa, Mastercard, Verve — toujours disponible, aucune config.' },
  { icon: '🌙', label: 'Dark / Light', desc: 'Suit le thème du navigateur automatiquement.' },
  { icon: '✅', label: 'Polling auto', desc: 'Attend la confirmation KKiaPay sans intervention.' },
  { icon: '🔌', label: 'Sans dépendances', desc: 'Vanilla JS — < 15 kb gzippé.' },
]

// Minimal syntax highlighter
function HighlightedCode({ code }) {
  const tokens = tokenize(code)
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} style={{ color: t.color }}>
          {t.text}
        </span>
      ))}
    </>
  )
}

function tokenize(code) {
  const patterns = [
    { re: /(\/\/[^\n]*)/g, color: '#475569' },                      // comments
    { re: /('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, color: '#4ade80' }, // strings
    { re: /\b(import|export|from|const|let|var|async|await|return|function|if|else|new|true|false|null|undefined)\b/g, color: '#a78bfa' }, // keywords
    { re: /\b(createGateway|openPayment|onSubmit|onPoll|onComplete|onError|fetch|json|console|log|error|addEventListener)\b/g, color: '#38bdf8' }, // functions
    { re: /\b(\d+)\b/g, color: '#f87171' }, // numbers
    { re: /(<\/?[\w-]+>|<!--[\s\S]*?-->)/g, color: '#f59e0b' }, // html tags
  ]

  // Simple tokenizer: split into segments
  const result = []
  let remaining = code
  let pos = 0

  while (remaining.length > 0) {
    let earliest = null
    let earliestMatch = null

    for (const { re, color } of patterns) {
      re.lastIndex = 0
      const m = re.exec(remaining)
      if (m && (earliest === null || m.index < earliest.index)) {
        earliest = { index: m.index, color }
        earliestMatch = m[0]
      }
    }

    if (!earliest || earliest.index > 0) {
      const plain = earliest ? remaining.slice(0, earliest.index) : remaining
      result.push({ text: plain, color: '#e2e8f0' })
    }

    if (earliest) {
      result.push({ text: earliestMatch, color: earliest.color })
      remaining = remaining.slice(earliest.index + earliestMatch.length)
    } else {
      break
    }
  }

  return result
}
