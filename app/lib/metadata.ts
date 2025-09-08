import type { Metadata } from 'next'
import { tools } from '../../client/src/lib/tools'

export function generateToolMetadata(toolId: string): Metadata {
  const tool = tools.find(t => t.id === toolId)
  
  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested tool could not be found.',
    }
  }

  const title = `${tool.name} - Free Online Tool`
  const description = `${tool.description}. Fast, secure, and easy to use ${tool.name.toLowerCase()} tool. No registration required.`

  return {
    title,
    description,
    keywords: [
      tool.name.toLowerCase(),
      ...tool.tags,
      'online tool',
      'free',
      tool.category.replace('-', ' '),
    ].join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/${toolId}`,
      siteName: 'Super-Tool',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `/${toolId}`,
    },
  }
}

export function generateToolJsonLd(toolId: string) {
  const tool = tools.find(t => t.id === toolId)
  
  if (!tool) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: `https://your-domain.com/${toolId}`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: 'Super-Tool',
      url: 'https://your-domain.com',
    },
  }
}