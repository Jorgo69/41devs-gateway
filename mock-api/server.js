/**
 * Serveur mock de l'API VEEP — reproduit le contrat des routes publiques
 * utilisées par le mode AUTO du SDK (events, tickets, operators, orders),
 * avec des données fictives fixes. Sert pour la démo locale (docs-site)
 * et pourra être réutilisé par de futurs tests d'intégration : même
 * contrat, seule l'URL change (VITE_API_BASE_URL).
 *
 * Lancement : node mock-api/server.js  (port 4000 par défaut, PORT=xxxx pour changer)
 */
import { createServer } from 'node:http'

const PORT = process.env.PORT ?? 4000

// SVG inline en data URI — aucune dépendance réseau externe, image stable dans le temps.
const COVER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#g)"/>
  <text x="50%" y="50%" font-family="system-ui,sans-serif" font-size="42" font-weight="800" fill="#fff" text-anchor="middle" dominant-baseline="middle">Soirée Démo</text>
</svg>`
const COVER_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(COVER_SVG).toString('base64')}`

const EVENT = {
  id: 'mock-event-1',
  title: 'Soirée Démo — 41Devs Gateway',
  city: 'Cotonou',
  is_free: false,
  short_description: "Événement fictif servant à démontrer le parcours d'achat du SDK, sans dépendre d'une clé VEEP réelle.",
  cover_url: COVER_DATA_URI,
  event_dates: [{ startDate: '2026-08-15T19:00:00.000Z' }],
}

const TICKETS = [
  { id: 'ticket-standard', ticketType: 'STANDARD', ticketPrice: 1000, quantityAvailable: 50, minPurchase: 1, maxPurchase: 5 },
  { id: 'ticket-vip', ticketType: 'VIP', ticketPrice: 3000, quantityAvailable: 15, minPurchase: 1, maxPurchase: 3 },
]

// Mobile money uniquement — "Carte bancaire" est ajoutée côté SDK (universelle, pas liée au pays).
const OPERATORS = [
  { code: 'mtn', name: 'MTN' },
  { code: 'moov', name: 'Moov' },
  { code: 'wave', name: 'Wave' },
]

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  })
  res.end(JSON.stringify(body))
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const path = url.pathname

  console.log(`[mock-api] ${req.method} ${path}`)

  if (req.method === 'OPTIONS') return send(res, 204, {})

  const eventMatch = path.match(/^\/api\/v1\/developer\/public\/events\/([^/]+)$/)
  const ticketsMatch = path.match(/^\/api\/v1\/developer\/public\/events\/([^/]+)\/tickets$/)
  const verifyCardMatch = path.match(/^\/api\/v1\/developer\/public\/orders\/([^/]+)\/verify-card$/)
  const orderStatusMatch = path.match(/^\/api\/v1\/developer\/public\/orders\/([^/]+)$/)

  if (req.method === 'GET' && eventMatch) {
    return send(res, 200, { data: EVENT })
  }

  if (req.method === 'GET' && ticketsMatch) {
    return send(res, 200, { data: { items: TICKETS } })
  }

  if (req.method === 'GET' && path === '/api/v1/developer/public/operators') {
    return send(res, 200, { data: OPERATORS })
  }

  if (req.method === 'POST' && path === '/api/v1/developer/public/orders') {
    const body = await readBody(req)
    const total = (body.items ?? []).reduce((sum, item) => {
      const ticket = TICKETS.find((t) => t.id === item.ticketId)
      return sum + (ticket ? ticket.ticketPrice * item.quantity : 0)
    }, 0)

    // Carte : pas de push serveur — le SDK ouvre le widget KKiaPay puis appelle verify-card.
    if (body.method === 'CARD') {
      return send(res, 200, {
        data: {
          orderId: 'mock-order-card-1',
          orderNumber: 'MOCK-CARD-0001',
          status: 'PENDING',
          isFree: false,
          total,
          paymentUrl: null,
          transactionId: null,
        },
      })
    }

    return send(res, 200, {
      data: {
        orderId: 'mock-order-1',
        orderNumber: 'MOCK-0001',
        status: 'CONFIRMED',
        isFree: false,
        total,
        items: body.items ?? [],
      },
    })
  }

  if (req.method === 'POST' && verifyCardMatch) {
    const body = await readBody(req)
    return send(res, 200, {
      data: { status: 'SUCCESS', orderId: verifyCardMatch[1], transactionId: body.transactionId },
    })
  }

  if (req.method === 'GET' && orderStatusMatch) {
    return send(res, 200, { data: { orderId: orderStatusMatch[1], status: 'CONFIRMED' } })
  }

  send(res, 404, { message: `Route mock non gérée : ${req.method} ${path}` })
})

server.listen(PORT, () => {
  console.log(`[mock-api] En écoute sur http://localhost:${PORT}/api/v1`)
})
