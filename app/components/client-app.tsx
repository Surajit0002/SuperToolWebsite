'use client'

import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../../client/src/App'

export default function ClientApp() {
  useEffect(() => {
    // Mount the existing React app
    const container = document.getElementById('react-app-mount')
    if (container && !container.hasChildNodes()) {
      const root = createRoot(container)
      root.render(<App />)
    }
  }, [])

  return <div id="react-app-mount" className="min-h-screen" />
}