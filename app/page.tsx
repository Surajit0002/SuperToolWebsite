import { Suspense } from 'react'
import { tools } from '../client/src/lib/tools'
import { generateToolMetadata } from './lib/metadata'
import ClientApp from './components/client-app'

// This will be the main homepage
export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientApp />
    </Suspense>
  )
}

export async function generateMetadata() {
  return {
    title: 'Super-Tool - All-in-One Online Tools Collection',
    description: `Access ${tools.length}+ free online tools including calculators, converters, image editors, PDF processors, and more. Fast, secure, and easy to use.`,
    keywords: [
      'online tools',
      'free calculator',
      'file converter',
      'image editor',
      'PDF tools',
      'unit converter',
      'productivity tools'
    ].join(', '),
    openGraph: {
      title: 'Super-Tool - All-in-One Online Tools Collection',
      description: `Access ${tools.length}+ free online tools including calculators, converters, image editors, PDF processors, and more.`,
      type: 'website',
      url: '/',
    },
  }
}