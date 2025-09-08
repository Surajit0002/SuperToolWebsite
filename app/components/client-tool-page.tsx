'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createRoot } from 'react-dom/client'
import App from '../../client/src/App'

interface ClientToolPageProps {
  toolId: string
}

export default function ClientToolPage({ toolId }: ClientToolPageProps) {
  const router = useRouter()

  useEffect(() => {
    // Mount the existing React app
    const container = document.getElementById('react-tool-mount')
    if (container && !container.hasChildNodes()) {
      const root = createRoot(container)
      root.render(<App />)
    }

    // Auto-open the tool modal
    setTimeout(() => {
      const openToolEvent = new CustomEvent('open-tool', {
        detail: { toolId }
      })
      document.dispatchEvent(openToolEvent)
    }, 100)

    // Listen for modal close to handle routing
    const handleModalClose = () => {
      // Use shallow routing to go back to homepage
      router.push('/', { shallow: true } as any)
    }

    // Add event listener for when modal closes
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleModalClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [toolId, router])

  return (
    <div id="react-tool-mount" className="min-h-screen" />
  )
}