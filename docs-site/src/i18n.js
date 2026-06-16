import { useState, useCallback } from 'react'

const translations = {
  fr: {
    nav: {
      howItWorks: 'Comment ça marche',
      demo: 'Démo',
      code: 'Intégration',
      lang: 'EN',
    },
    hero: {
      badge: 'Open Source · npm · JavaScript',
      title: 'Intégrez le paiement Mobile Money en 3 lignes',
      subtitle:
        'Une modal de paiement clé en main pour MTN, Orange, Moov et Wave. Conçu pour VEEP, utilisable partout.',
      cta: 'Voir la démo',
      ctaCode: 'Voir le code',
      stat1: '6+',
      stat1Label: 'Pays couverts',
      stat2: '5',
      stat2Label: 'Opérateurs',
      stat3: '< 5 min',
      stat3Label: "Temps d'intégration",
    },
    howItWorks: {
      title: 'Comment ça marche',
      subtitle: 'Un flux en 3 étapes, géré entièrement par le SDK.',
      step1Title: "Choix de l'opérateur",
      step1Desc:
        'Orange, MTN, Moov, Wave — la modal charge dynamiquement les opérateurs disponibles dans le pays de l\'acheteur.',
      step2Title: 'Saisie des informations',
      step2Desc:
        'Numéro de téléphone, email, prénom. Validation en temps réel, indicatif téléphonique automatique.',
      step3Title: 'Confirmation automatique',
      step3Desc:
        "Le SDK attend la confirmation AfribaPay en polling silencieux. Votre callback onComplete se déclenche dès que c'est confirmé.",
    },
    demo: {
      title: 'Démo interactive',
      subtitle: 'Connexion réelle à l\'API VEEP. Choisissez votre événement, votre billet et payez.',
      event: '2 événements disponibles',
      date: 'Soirée Demo · Conférence Tech',
      location: 'Cotonou & Abidjan',
      ticket: 'Gratuit · VIP 100 XOF · VVIP 110 XOF',
      price: 'Dès 0 XOF',
      btnBuy: 'Choisir un événement',
      note: 'Événements réels — mail + SMS de confirmation envoyés.',
      seatsLeft: 'Places disponibles',
    },
    snippets: {
      title: 'Prêt à copier-coller',
      subtitle: 'Deux modes selon votre architecture.',
      tabAuto: 'Mode AUTO',
      tabAutoDesc: 'VEEP gère tout',
      tabGeneric: 'Mode GÉNÉRIQUE',
      tabGenericDesc: 'Votre propre API',
      tabCdn: 'Via CDN',
      tabCdnDesc: 'Sans bundler',
    },
    footer: {
      madeBy: 'Fait avec',
      by: 'par',
      tagline: 'SDK open source — contributions bienvenues.',
      npm: 'Voir sur npm',
      github: 'GitHub',
    },
  },
  en: {
    nav: {
      howItWorks: 'How it works',
      demo: 'Demo',
      code: 'Integration',
      lang: 'FR',
    },
    hero: {
      badge: 'Open Source · npm · JavaScript',
      title: 'Add Mobile Money payments in 3 lines',
      subtitle:
        'A plug-and-play payment modal for MTN, Orange, Moov and Wave. Built for VEEP, works anywhere.',
      cta: 'See the demo',
      ctaCode: 'See the code',
      stat1: '6+',
      stat1Label: 'Countries',
      stat2: '5',
      stat2Label: 'Operators',
      stat3: '< 5 min',
      stat3Label: 'Integration time',
    },
    howItWorks: {
      title: 'How it works',
      subtitle: 'A 3-step flow, fully managed by the SDK.',
      step1Title: 'Operator selection',
      step1Desc:
        'Orange, MTN, Moov, Wave — the modal dynamically loads operators available in the buyer\'s country.',
      step2Title: 'Details input',
      step2Desc:
        'Phone number, email, first name. Real-time validation, automatic country dial code.',
      step3Title: 'Automatic confirmation',
      step3Desc:
        'The SDK silently polls for AfribaPay confirmation. Your onComplete callback fires as soon as it\'s confirmed.',
    },
    demo: {
      title: 'Interactive Demo',
      subtitle: 'Live connection to the VEEP API. Pick an event, a ticket and pay.',
      event: '2 events available',
      date: 'Soirée Demo · Tech Conference',
      location: 'Cotonou & Abidjan',
      ticket: 'Free · VIP 100 XOF · VVIP 110 XOF',
      price: 'From 0 XOF',
      btnBuy: 'Choose an event',
      note: 'Real events — confirmation email + SMS will be sent.',
      seatsLeft: 'Spots available',
    },
    snippets: {
      title: 'Ready to copy-paste',
      subtitle: 'Two modes depending on your architecture.',
      tabAuto: 'AUTO mode',
      tabAutoDesc: 'VEEP handles everything',
      tabGeneric: 'GENERIC mode',
      tabGenericDesc: 'Your own API',
      tabCdn: 'Via CDN',
      tabCdnDesc: 'No bundler needed',
    },
    footer: {
      madeBy: 'Made with',
      by: 'by',
      tagline: 'Open source SDK — contributions welcome.',
      npm: 'View on npm',
      github: 'GitHub',
    },
  },
}

export function useI18n() {
  const [lang, setLang] = useState('fr')

  const t = useCallback(
    (path) => {
      const keys = path.split('.')
      let val = translations[lang]
      for (const k of keys) {
        val = val?.[k]
      }
      return val ?? path
    },
    [lang],
  )

  const toggleLang = useCallback(() => {
    setLang((l) => (l === 'fr' ? 'en' : 'fr'))
  }, [])

  return { t, lang, toggleLang }
}

export default translations
