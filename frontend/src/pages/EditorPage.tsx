import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs } from '@/components/ui/tabs'
import { CodeEditor } from '@/components/Editor/CodeEditor'
import { MermaidPreview, type MermaidTheme } from '@/components/Preview/MermaidPreview'
import { ChartTypeSelector } from '@/components/ChartType/ChartTypeSelector'
import { useTheme } from 'next-themes'
import { Moon, Sun, Download, Save, Sparkles, Copy, Check, FileImage, FileCode, LogIn, LogOut, User, LayoutGrid, Palette, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { chartApi } from '@/lib/api'
import { exportToPng, exportToSvg, exportToPdf } from '@/lib/export'
import { useAuth } from '@/contexts/AuthContext'
import { AuthDialog } from '@/components/Auth/AuthDialog'
import { useNavigate } from 'react-router-dom'

const DEFAULT_FLOWCHART = `flowchart TD
    A[开始] --> B{判断}
    B -->|是| C[处理1]
    B -->|否| D[处理2]
    C --> E[结束]
    D --> E`

export default function EditorPage() {
  const params = useParams()
  const navigate = useNavigate()
  const [code, setCode] = useState(DEFAULT_FLOWCHART)
  const [chartType, setChartType] = useState<string>('flowchart')
  const [mermaidTheme, setMermaidTheme] = useState<MermaidTheme>('default')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [isLoadingChart, setIsLoadingChart] = useState(false)
  const [editingChartId, setEditingChartId] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()

  useEffect(() => {
    const chartId = params.id
    if (chartId) {
      setIsLoadingChart(true)
      chartApi.get(chartId).then((chart: any) => {
        setCode(chart.content || DEFAULT_FLOWCHART)
        setChartType(chart.type || 'flowchart')
        setEditingChartId(chart.id)
        setIsLoadingChart(false)
      }).catch(() => {
        toast({ variant: 'destructive', title: '加载图表失败' })
        setIsLoadingChart(false)
      })
    } else {
      setEditingChartId(null)
    }
  }, [params.id])

  const handleCodeChange = useCallback((value: string) => {
    setCode(value)
  }, [])

  const handleChartTypeSelect = useCallback((type: string, template: string) => {
    setChartType(type)
    setCode(template)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "请输入描述",
        description: "请先输入图表描述",
      })
      return
    }

    setIsGenerating(true)
    try {
      const res = await chartApi.generate(prompt, chartType) as unknown as { code: number; msg: string; data: { mermaid: string } }
      if (res.code === 0) {
        setCode(res.data.mermaid)
        toast({ title: "生成成功", description: "图表已生成" })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "生成失败",
        description: error.response?.data?.msg || "请稍后重试",
      })
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, chartType])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      const title = code.split('\n')[0].substring(0, 50) || '未命名图表'
      if (editingChartId) {
        await chartApi.update(editingChartId, { title, type: chartType, content: code })
        toast({ title: "更新成功", description: "图表已更新" })
      } else {
        await chartApi.create({ title, type: chartType, content: code, isPublic: false })
        toast({ title: "保存成功", description: "图表已保存到我的图表" })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "保存失败",
        description: error.response?.data?.msg || "请先登录",
      })
    } finally {
      setIsSaving(false)
    }
  }, [code, chartType, editingChartId])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast({ title: "复制成功", description: "Mermaid 代码已复制到剪贴板" })
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  const handleExport = useCallback(async (type: 'png' | 'svg' | 'pdf') => {
    const previewEl = document.getElementById('mermaid-preview')
    if (!previewEl) return

    setIsExporting(true)
    setShowExportMenu(false)

    try {
      const svgElement = previewEl.querySelector('svg') as unknown as HTMLElement
      if (!svgElement) throw new Error('图表未渲染')

      const filename = `chart-${Date.now()}`

      switch (type) {
        case 'png':
          await exportToPng(svgElement as HTMLElement, filename)
          break
        case 'svg':
          await exportToSvg(svgElement as HTMLElement, filename)
          break
        case 'pdf':
          await exportToPdf(svgElement as HTMLElement, filename)
          break
      }

      toast({ title: "导出成功", description: `图表已导出为 ${type.toUpperCase()}` })
    } catch (error) {
      toast({ variant: "destructive", title: "导出失败", description: "请确保图表已正确渲染" })
    } finally {
      setIsExporting(false)
    }
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EE4D2D] to-orange-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold">GeniusGen</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/my-charts')} title="我的图表">
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Export Menu */}
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setShowExportMenu(!showExportMenu)} disabled={isExporting}>
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? '导出中...' : '导出'}
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-background border rounded-md shadow-lg z-50">
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2" onClick={() => handleExport('png')}>
                  <FileImage className="w-4 h-4" /> PNG
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2" onClick={() => handleExport('svg')}>
                  <FileCode className="w-4 h-4" /> SVG
                </button>
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2" onClick={() => handleExport('pdf')}>
                  <FileImage className="w-4 h-4" /> PDF
                </button>
              </div>
            )}
          </div>

          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? '保存中...' : '保存'}
          </Button>

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Button variant="ghost" size="sm" onClick={() => { setAuthMode('login'); setShowAuthDialog(true) }}>
                <LogIn className="w-4 h-4 mr-1" /> 登录
              </Button>
              <Button size="sm" onClick={() => { setAuthMode('register'); setShowAuthDialog(true) }}>
                <User className="w-4 h-4 mr-1" /> 注册
              </Button>
            </div>
          )}
        </div>
      </header>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} mode={authMode} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 border-r bg-card overflow-y-auto flex flex-col">
          <div className="p-4 flex-1">
            <h2 className="text-sm font-medium mb-3">图表类型</h2>
            <ChartTypeSelector onSelect={handleChartTypeSelect} />
          </div>
          <div className="p-4 border-t">
            {/* <h2 className="text-sm font-medium mb-2">AI 生成</h2> */}
            <div className="space-y-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="输入图表描述，如：用户登录流程"
                className="w-full px-3 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleGenerate} disabled={isGenerating}>
                  <Sparkles className="w-4 h-4 mr-1" />
                  {isGenerating ? 'AI 生成中' : 'AI 生成'}
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          <Tabs value={chartType} className="flex-1 flex flex-col">
            {/* <div className="border-b px-4">
              <TabsList className="h-10 bg-transparent justify-start">
                <TabsTrigger value="flowchart" onClick={() => setChartType('flowchart')}>流程图</TabsTrigger>
                <TabsTrigger value="sequence" onClick={() => setChartType('sequence')}>时序图</TabsTrigger>
                <TabsTrigger value="er" onClick={() => setChartType('er')}>ER图</TabsTrigger>
                <TabsTrigger value="class" onClick={() => setChartType('class')}>类图</TabsTrigger>
              </TabsList>
            </div> */}

            <div className="flex-1 flex">
              <div className="w-1/2 border-r flex flex-col h-[calc(100vh-4rem)]">
                <div className="p-2 border-b flex items-center justify-between shrink-0">
                  <span className="text-sm text-muted-foreground">Mermaid 代码</span>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex-1 min-h-0 overflow-auto">
                  <CodeEditor value={code} onChange={handleCodeChange} />
                </div>
              </div>

              <div className="w-1/2 flex flex-col h-[calc(100vh-4rem)]">
                <div className="p-2 border-b flex items-center justify-between shrink-0">
                  <span className="text-sm text-muted-foreground">预览</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Palette className="w-4 h-4 mr-1" />
                        {{'default': '默认', 'dark': '深色', 'neutral': '中性', 'forest': '森林'}[mermaidTheme]}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => setMermaidTheme('default')}>默认</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setMermaidTheme('dark')}>深色</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setMermaidTheme('neutral')}>中性</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setMermaidTheme('forest')}>森林</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex-1 min-h-0 overflow-auto p-4 bg-muted/30">
                  <div className="h-full flex items-center justify-center">
                    <MermaidPreview code={code} theme={mermaidTheme} />
                  </div>
                </div>
              </div>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  )
}