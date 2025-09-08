'use client'

import { useEffect } from 'react'

interface AdSlotProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  className?: string
}

export function AdSlot({ slot, format = 'auto', className = '' }: AdSlotProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}

// Pre-configured ad slots for different positions
export function HeaderAdSlot() {
  return (
    <AdSlot 
      slot="HEADER_SLOT_ID" 
      format="horizontal" 
      className="mb-4 text-center"
    />
  )
}

export function SidebarAdSlot() {
  return (
    <AdSlot 
      slot="SIDEBAR_SLOT_ID" 
      format="vertical" 
      className="sticky top-4"
    />
  )
}

export function FooterAdSlot() {
  return (
    <AdSlot 
      slot="FOOTER_SLOT_ID" 
      format="horizontal" 
      className="mt-8 text-center"
    />
  )
}

export function InContentAdSlot() {
  return (
    <AdSlot 
      slot="CONTENT_SLOT_ID" 
      format="rectangle" 
      className="my-6 text-center"
    />
  )
}

// Extend Window interface
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}