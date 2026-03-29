import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Download, Copy, RotateCcw, ZoomIn, ZoomOut, Maximize2, Palette } from 'lucide-react'
import { type MermaidTheme } from '@/components/Preview/MermaidPreview'

interface ToolbarProps {
  onExport?: (format: 'png' | 'svg' | 'pdf') => void
  onCopy?: () => void
  onReset?: () => void
  onThemeChange?: (theme: MermaidTheme) => void
  currentTheme?: MermaidTheme
}

const themeLabels: Record<MermaidTheme, string> = {
  default: '默认',
  dark: '深色',
  neutral: '中性',
  forest: '森林',
}

export function Toolbar({ onExport, onCopy, onReset, onThemeChange, currentTheme = 'default' }: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-2 border-b bg-card">
      <Button variant="ghost" size="sm" onClick={onCopy}>
        <Copy className="w-4 h-4 mr-1" />
        复制
      </Button>
      <Button variant="ghost" size="sm" onClick={onReset}>
        <RotateCcw className="w-4 h-4 mr-1" />
        重置
      </Button>
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Palette className="w-4 h-4 mr-1" />
            主题
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {(Object.keys(themeLabels) as MermaidTheme[]).map((theme) => (
            <DropdownMenuItem
              key={theme}
              onClick={() => onThemeChange?.(theme)}
              className={currentTheme === theme ? 'bg-accent' : ''}
            >
              {themeLabels[theme]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="icon">
        <ZoomOut className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Maximize2 className="w-4 h-4" />
      </Button>
      <div className="w-px h-4 bg-border mx-1" />
      <Button variant="ghost" size="sm" onClick={() => onExport?.('png')}>
        <Download className="w-4 h-4 mr-1" />
        PNG
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onExport?.('svg')}>
        <Download className="w-4 h-4 mr-1" />
        SVG
      </Button>
    </div>
  )
}