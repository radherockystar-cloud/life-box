import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAppStorage } from './utils/appStorage'
import { runStartupMediaSetup, needsMediaMigration } from './utils/mediaStore'

const rootEl = document.getElementById('root')

const start = () => {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

const boot = async () => {
  // Pehle app ka data IndexedDB se memory me aata hai (purana localStorage data pehli baar apne aap copy ho jata hai).
  // Screens iske baad hi khulti hain, taaki koi screen khali ya purana data na dekhe.
  try {
    await initAppStorage()
  } catch (err) {
    console.warn('App storage start failed:', err)
  }

  // Purani photo/voice pehli baar IndexedDB mein jaati hain (chhoti der lag sakti hai).
  // App tabhi khulti hai jab ye ho jaye, taaki koi screen beech mein purana data na likh de.
  if (needsMediaMigration()) {
    rootEl.innerHTML =
      '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-weight:800;color:#be123c;background:#fff8fb">Updating your memories...</div>'
  }
  await runStartupMediaSetup()
}

Promise.race([boot(), new Promise((resolve) => setTimeout(resolve, 60000))])
  .catch((err) => console.warn('Startup failed:', err))
  .finally(start)
