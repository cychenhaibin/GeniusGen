import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Chart } from '@/lib/api'
import { Pencil, Trash2, Globe, Lock, Clock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import mermaid from 'mermaid'

interface ChartCardProps {
  chart: Chart
  onEdit: () => void
  onDelete: () => void
}

export function ChartCard({ chart, onEdit, onDelete }: ChartCardProps) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string>('')
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
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      fontFamily: 'sans-serif',
    })

    const renderChart = async () => {
      try {
        const { svg: result } = await mermaid.render(`chart-${chart.id}`, chart.content)
        setSvg(result)
        setError('')
      } catch (err: any) {
        setError('渲染失败')
        setSvg('')
      }
    }

    if (chart.content) {
      renderChart()
    }
  }, [chart.id, chart.content])

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

        <div className="h-40 bg-muted/50 rounded-md mb-3 overflow-hidden flex items-center justify-center p-2">
          {error ? (
            <span className="text-xs text-destructive">{error}</span>
          ) : svg ? (
            <div 
              ref={containerRef}
              className="w-full h-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-full"
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