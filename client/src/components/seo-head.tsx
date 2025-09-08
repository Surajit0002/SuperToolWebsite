import { useEffect } from 'react'
import { tools, getToolById } from '../lib/tools'

interface SEOHeadProps {
  toolId?: string
}

export default function SEOHead({ toolId }: SEOHeadProps) {
  useEffect(() => {
    if (toolId) {
      const tool = getToolById(toolId)
      if (tool) {
        // Update document title
        document.title = `${tool.name} - Free Online Tool | Super-Tool`
        
        // Update meta description
        let metaDescription = document.querySelector('meta[name="description"]')
        if (!metaDescription) {
          metaDescription = document.createElement('meta')
          metaDescription.setAttribute('name', 'description')
          document.head.appendChild(metaDescription)
        }
        metaDescription.setAttribute('content', `${tool.description}. Fast, secure, and easy to use ${tool.name.toLowerCase()} tool. No registration required.`)

        // Update Open Graph tags
        updateOrCreateOGTag('og:title', `${tool.name} - Free Online Tool`)
        updateOrCreateOGTag('og:description', tool.description)
        updateOrCreateOGTag('og:url', `${window.location.origin}/${toolId}`)
        updateOrCreateOGTag('og:type', 'website')

        // Update Twitter Card tags
        updateOrCreateMetaTag('twitter:card', 'summary')
        updateOrCreateMetaTag('twitter:title', `${tool.name} - Free Online Tool`)
        updateOrCreateMetaTag('twitter:description', tool.description)

        // Add JSON-LD structured data
        updateJSONLD(tool, toolId)
      }
    } else {
      // Homepage SEO
      document.title = 'Super-Tool - All-in-One Online Tools Collection'
      
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', `Access ${tools.length}+ free online tools including calculators, converters, image editors, PDF processors, and more. Fast, secure, and easy to use.`)

      updateOrCreateOGTag('og:title', 'Super-Tool - All-in-One Online Tools Collection')
      updateOrCreateOGTag('og:description', `Access ${tools.length}+ free online tools including calculators, converters, image editors, PDF processors, and more.`)
      updateOrCreateOGTag('og:url', window.location.origin)
      updateOrCreateOGTag('og:type', 'website')
    }
  }, [toolId])

  return null
}

function updateOrCreateOGTag(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function updateOrCreateMetaTag(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function updateJSONLD(tool: any, toolId: string) {
  // Remove existing JSON-LD
  const existingScript = document.querySelector('script[type="application/ld+json"]')
  if (existingScript) {
    existingScript.remove()
  }

  // Add new JSON-LD
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: `${window.location.origin}/${toolId}`,
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
      url: window.location.origin,
    },
  })
  document.head.appendChild(script)
}