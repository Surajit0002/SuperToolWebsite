import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../client/src/index.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Super-Tool - All-in-One Online Tools',
    template: '%s | Super-Tool'
  },
  description: 'The ultimate collection of online tools - calculators, converters, image editors, PDF processors, and more. All free and easy to use.',
  keywords: ['online tools', 'calculator', 'converter', 'image editor', 'PDF tools', 'utilities'],
  authors: [{ name: 'Super-Tool' }],
  creator: 'Super-Tool',
  publisher: 'Super-Tool',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-domain.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Super-Tool - All-in-One Online Tools',
    description: 'The ultimate collection of online tools - calculators, converters, image editors, PDF processors, and more. All free and easy to use.',
    siteName: 'Super-Tool',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Super-Tool - All-in-One Online Tools',
    description: 'The ultimate collection of online tools - calculators, converters, image editors, PDF processors, and more.',
    creator: '@supertool',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* PWA meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Super-Tool',
              description: 'All-in-one online tools collection',
              url: 'https://your-domain.com',
              applicationCategory: 'UtilityApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}