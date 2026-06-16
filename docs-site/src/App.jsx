import { useState, useEffect } from 'react'
import { useI18n } from './i18n.js'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Demo from './components/Demo.jsx'
import Snippets from './components/Snippets.jsx'
import Customization from './components/Customization.jsx'
import VeepIntegration from './components/VeepIntegration.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const { t, lang, toggleLang } = useI18n()

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar t={t} dark={dark} setDark={setDark} lang={lang} toggleLang={toggleLang} />
      <main>
        <Hero t={t} />
        <HowItWorks t={t} />
        <Demo t={t} />
        <Snippets t={t} />
        <Customization t={t} />
        <VeepIntegration t={t} />
      </main>
      <Footer t={t} />
    </div>
  )
}
