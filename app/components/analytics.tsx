'use client'

import Script from 'next/script'

interface AnalyticsProps {
  gtmId?: string
  gtagId?: string
}

export default function Analytics({ gtmId, gtagId }: AnalyticsProps) {
  return (
    <>
      {/* Google Tag Manager */}
      {gtmId && (
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
          }}
        />
      )}

      {/* Google Analytics 4 */}
      {gtagId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
            strategy="afterInteractive"
          />
          <Script
            id="gtag-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gtagId}', {
                page_title: document.title,
                page_location: window.location.href,
              });
            `,
            }}
          />
        </>
      )}

      {/* AdSense */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  )
}

// Custom hook for tracking events
export function useAnalytics() {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters)
    }
  }

  const trackToolUsage = (toolId: string, toolName: string) => {
    trackEvent('tool_usage', {
      tool_id: toolId,
      tool_name: toolName,
      event_category: 'Tools',
      event_label: toolName,
    })
  }

  return { trackEvent, trackToolUsage }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void
    dataLayer: any[]
  }
}