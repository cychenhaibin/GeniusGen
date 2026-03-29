import { useState } from 'react'
import { ChartTypeSelector } from '@/components/ChartType/ChartTypeSelector'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SidebarProps {
  onChartTypeSelect?: (type: string, template: string) => void
}

export function Sidebar({ onChartTypeSelect }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const handleSelect = (type: string, template: string) => {
    if (onChartTypeSelect) {
      onChartTypeSelect(type, template)
    }
  }

  if (collapsed) {
    return (
      <aside className="w-12 border-r bg-card flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          className="mb-4"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/my-charts')}
          title="我的图表"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </aside>
    )
  }

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      {/* Collapse Button */}
      <div className="flex items-center justify-between p-3 border-b">
        <span className="text-sm font-medium">图表类型</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(true)}
          className="h-6 w-6"
        >
          <ChevronLeft className="w-3 h-3" />
        </Button>
      </div>

      {/* Chart Types */}
      <div className="flex-1 overflow-y-auto p-4">
        <ChartTypeSelector onSelect={handleSelect} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/my-charts')}
        >
          <Plus className="w-4 h-4 mr-2" />
          我的图表
        </Button>
      </div>
    </aside>
  )
}