import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { tools } from '../../client/src/lib/tools'
import { generateToolMetadata, generateToolJsonLd } from '../lib/metadata'
import ClientToolPage from '../components/client-tool-page'

interface ToolPageProps {
  params: {
    tool: string
  }
}

export async function generateStaticParams() {
  return tools.map((tool) => ({
    tool: tool.id,
  }))
}

export async function generateMetadata({ params }: ToolPageProps) {
  return generateToolMetadata(params.tool)
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = tools.find(t => t.id === params.tool)
  
  if (!tool) {
    notFound()
  }

  const jsonLd = generateToolJsonLd(params.tool)

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Suspense fallback={<div>Loading tool...</div>}>
        <ClientToolPage toolId={params.tool} />
      </Suspense>
    </>
  )
}