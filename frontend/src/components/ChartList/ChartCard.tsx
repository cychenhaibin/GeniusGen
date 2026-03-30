import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Chart } from '@/lib/api'
import { Pencil, Trash2, Globe, Lock, Clock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import mermaid from 'mermaid'
import elkLayouts from '@mermaid-js/layout-elk'

interface ChartCardProps {
  chart: Chart
  onEdit: () => void
  onDelete: () => void
}

export function ChartCard({ chart, onEdit, onDelete }: ChartCardProps) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [elkRegistered, setElkRegistered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  useEffect(() => {
    if (!elkRegistered) {
      try {
        mermaid.registerLayoutLoaders(elkLayouts)
        setElkRegistered(true)
      } catch (err) {
        console.warn('ELK layout already registered or failed to register:', err)
        setElkRegistered(true)
      }
    }
  }, [elkRegistered])

  useEffect(() => {
    if (!elkRegistered) return

    const renderChart = async () => {
      if (!chart.content || !chart.content.trim()) {
        console.error('Empty chart content for chart:', chart.id)
        setError('内容为空')
        return
      }

      try {
        const layoutMatch = chart.content.match(/layout:\s*(elk|dagre)/i)
        const useElk = layoutMatch && layoutMatch[1].toLowerCase() === 'elk'
        
        const themeMatch = chart.content.match(/theme:\s*([\w-]+)/i)
        const chartTheme = themeMatch ? themeMatch[1] : 'default'
        
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          fontFamily: 'sans-serif',
          theme: chartTheme,
          flowchart: {
            defaultRenderer: useElk ? 'elk' : 'dagre-wrapper',
          },
        })
        
        const uniqueId = `chart-${chart.id}-${Date.now()}`
        const { svg: result } = await mermaid.render(uniqueId, chart.content)
        
        setSvg(result)
        setError('')
      } catch (err: any) {
        console.error('Mermaid render error for chart', chart.id, ':', err)
        setError(`渲染失败`)
        setSvg('')
      }
    }

    if (chart.content) {
      const timeoutId = setTimeout(renderChart, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [chart.id, chart.content, elkRegistered])

  const handleCopy = () => {
    navigator.clipboard.writeText(chart.content)
    toast({ title: '已复制到剪贴板' })
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-medium truncate flex-1">{chart.title}</h3>
          <div className="flex items-center gap-1 ml-2">
            {chart.isPublic ? (
              <Globe className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Lock className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="mb-3">
          <span className="inline-block px-2 py-1 text-xs rounded-md bg-primary/10 text-primary">
            {chart.type}
          </span>
        </div>

        <div className="h-40 bg-muted/50 rounded-md mb-3 flex items-center justify-center p-2 relative">
          {error ? (
            <div className="text-center">
              <span className="text-xs text-destructive block">{error}</span>
              <span className="text-xs text-muted-foreground mt-1 block">点击编辑查看完整图表</span>
            </div>
          ) : svg ? (
            <div 
              ref={containerRef}
              className="chart-card-preview w-full h-full flex items-center justify-center overflow-hidden"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <span className="text-xs text-muted-foreground">加载中...</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatDate(chart.createdAt)}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleCopy} title="复制代码">
              复制
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit} title="编辑">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} title="删除">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}