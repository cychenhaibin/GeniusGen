import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

export type MermaidTheme = 'default' | 'dark' | 'neutral' | 'forest'

interface MermaidPreviewProps {
  code: string
  theme?: MermaidTheme
}

const themeConfigs: Record<MermaidTheme, object> = {
  default: {
    theme: 'default',
    primaryColor: '#EE4D2D',
    primaryTextColor: '#fff',
    primaryBorderColor: '#EE4D2D',
    lineColor: '#EE4D2D',
    secondaryColor: '#f3f4f6',
    tertiaryColor: '#e5e7eb',
  },
  dark: {
    theme: 'dark',
    primaryColor: '#EE4D2D',
    primaryTextColor: '#fff',
    primaryBorderColor: '#EE4D2D',
    lineColor: '#EE4D2D',
    secondaryColor: '#1f2937',
    tertiaryColor: '#374151',
  },
  neutral: {
    theme: 'neutral',
    primaryColor: '#EE4D2D',
    primaryTextColor: '#fff',
    primaryBorderColor: '#EE4D2D',
    lineColor: '#EE4D2D',
  },
  forest: {
    theme: 'forest',
    primaryColor: '#EE4D2D',
    primaryTextColor: '#fff',
    primaryBorderColor: '#EE4D2D',
    lineColor: '#EE4D2D',
    secondaryColor: '#ecfccb',
    tertiaryColor: '#d1fae5',
  },
}

export function MermaidPreview({ code, theme = 'default' }: MermaidPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      fontFamily: 'sans-serif',
      ...themeConfigs[theme],
    })
  }, [theme])

  useEffect(() => {
    const renderChart = async () => {
      if (!code.trim()) {
        setSvg('')
        setError('')
        return
      }

      try {
        const id = `mermaid-${Date.now()}`
        const { svg: renderedSvg } = await mermaid.render(id, code)
        setSvg(renderedSvg)
        setError('')
      } catch (err) {
        console.error('Mermaid render error:', err)
        setError(err instanceof Error ? err.message : '渲染失败')
        setSvg('')
      }
    }

    const timeoutId = setTimeout(renderChart, 300)
    return () => clearTimeout(timeoutId)
  }, [code, theme])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive text-sm p-4 bg-destructive/10 rounded-lg">
          <p className="font-medium">渲染错误</p>
          <p className="mt-1 opacity-80">{error}</p>
        </div>
      </div>
    )
  }

  if (!svg) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground text-sm">
          输入 Mermaid 代码查看预览
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto flex items-center justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}