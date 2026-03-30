import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs } from '@/components/ui/tabs'
import { CodeEditor } from '@/components/Editor/CodeEditor'
import { MermaidPreview, type MermaidTheme, type MermaidLayout } from '@/components/Preview/MermaidPreview'
import { ChartTypeSelector } from '@/components/ChartType/ChartTypeSelector'
import { useTheme } from 'next-themes'
import { Moon, Sun, Download, Save, Sparkles, Copy, Check, FileImage, FileCode, LogIn, LogOut, User, LayoutGrid, Palette, Loader2, Code2, Send, Network, Settings } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { chartApi } from '@/lib/api'
import { exportToPng, exportToSvg, exportToPdf } from '@/lib/export'
import { useAuth } from '@/contexts/AuthContext'
import { AuthDialog } from '@/components/Auth/AuthDialog'
import { AISettingsDialog, getAIConfig } from '@/components/Settings/AISettingsDialog'
import { useNavigate } from 'react-router-dom'

const DEFAULT_FLOWCHART = `flowchart TD
    A[开始] --> B{判断}
    B -->|是| C[处理1]
    B -->|否| D[处理2]
    C --> E[结束]
    D --> E`

function updateOrAddFrontmatter(code: string, theme: string, layout: string, title?: string): string {
  const hasFrontmatter = code.trim().startsWith('---')
  
  if (!hasFrontmatter) {
    const configBlock = `---
config:
  theme: ${theme}
  layout: ${layout}
${title ? `title: ${title}\n` : ''}---
`
    return configBlock + code
  }
  
  const frontmatterMatch = code.match(/^(---[\s\S]*?---)(\n[\s\S]*)$/)
  if (!frontmatterMatch) return code
  
  let frontmatter = frontmatterMatch[1]
  const restContent = frontmatterMatch[2]
  
  const hasConfig = /config:/i.test(frontmatter)
  
  if (!hasConfig) {
    frontmatter = frontmatter.replace(/^---\n/, `---\nconfig:\n  theme: ${theme}\n  layout: ${layout}\n`)
  } else {
    if (!/theme:/i.test(frontmatter)) {
      frontmatter = frontmatter.replace(/config:\s*\n/, `config:\n  theme: ${theme}\n  layout: ${layout}\n`)
    } else {
      frontmatter = frontmatter.replace(/theme:\s*[\w-]+/i, `theme: ${theme}`)
      if (!/layout:/i.test(frontmatter)) {
        frontmatter = frontmatter.replace(/theme:\s*[\w-]+/i, `theme: ${theme}\n  layout: ${layout}`)
      } else {
        frontmatter = frontmatter.replace(/layout:\s*[\w-]+/i, `layout: ${layout}`)
      }
    }
  }
  
  if (title && !/title:/i.test(frontmatter)) {
    frontmatter = frontmatter.replace(/---$/, `title: ${title}\n---`)
  } else if (title) {
    frontmatter = frontmatter.replace(/title:\s*.+/i, `title: ${title}`)
  }
  
  return frontmatter + restContent
}

export default function EditorPage() {
  const params = useParams()
  const navigate = useNavigate()
  const [code, setCode] = useState(DEFAULT_FLOWCHART)
  const [chartType, setChartType] = useState<string>('flowchart')
  const [mermaidTheme, setMermaidTheme] = useState<MermaidTheme>('default')
  const [mermaidLayout, setMermaidLayout] = useState<MermaidLayout>('dagre')
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
  const [layoutMode, setLayoutMode] = useState<'split' | 'ai'>('split')
  const [aiMessage, setAiMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [showAISettings, setShowAISettings] = useState(false)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()

  useEffect(() => {
    const chartId = params.id
    if (chartId) {
      setIsLoadingChart(true)
      chartApi.get(chartId).then((res: any) => {
        const chart = res.data || res
        if (chart && chart.content) {
          setCode(chart.content)
          setChartType(chart.type || 'flowchart')
          setEditingChartId(chart.id)
          
          const themeMatch = chart.content.match(/theme:\s*([\w-]+)/i)
          if (themeMatch) {
            setMermaidTheme(themeMatch[1] as MermaidTheme)
          }
          
          const layoutMatch = chart.content.match(/layout:\s*(elk|dagre)/i)
          if (layoutMatch) {
            setMermaidLayout(layoutMatch[1].toLowerCase() as MermaidLayout)
          }
        } else {
          toast({ variant: 'destructive', title: '图表数据格式错误' })
        }
        setIsLoadingChart(false)
      }).catch((error) => {
        console.error('Failed to load chart:', error)
        toast({ variant: 'destructive', title: '加载图表失败' })
        setIsLoadingChart(false)
      })
    } else {
      setEditingChartId(null)
      setCode(DEFAULT_FLOWCHART)
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
      const aiConfig = getAIConfig()
      const res = await chartApi.generate(prompt, chartType, aiConfig) as unknown as { code: number; msg: string; data: { mermaid: string } }
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
      let title = '未命名图表'
      
      const titleMatch = code.match(/^---[\s\S]*?title:\s*(.+?)(?:\n|$)/)
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim()
      } else {
        const lines = code.split('\n').filter(line => line.trim())
        const firstContentLine = lines.find(line => 
          !line.trim().startsWith('---') && 
          !line.trim().startsWith('flowchart') && 
          !line.trim().startsWith('sequenceDiagram') &&
          !line.trim().startsWith('classDiagram') &&
          !line.trim().startsWith('erDiagram') &&
          !line.trim().startsWith('gantt') &&
          !line.trim().startsWith('pie') &&
          !line.trim().startsWith('graph') &&
          !line.trim().startsWith('gitGraph') &&
          !line.trim().startsWith('journey') &&
          !line.trim().startsWith('stateDiagram') &&
          !line.trim().startsWith('config:') &&
          !line.trim().startsWith('theme:') &&
          !line.trim().startsWith('layout:') &&
          !line.trim().startsWith('subgraph')
        )
        
        if (firstContentLine) {
          title = firstContentLine.replace(/[[\]{}()]/g, '').substring(0, 50).trim()
        } else {
          const typeNames: Record<string, string> = {
            flowchart: '流程图',
            sequence: '时序图',
            er: 'ER图',
            class: '类图',
            gantt: '甘特图',
            pie: '饼图',
          }
          title = typeNames[chartType] || '未命名图表'
        }
      }
      
      const contentToSave = updateOrAddFrontmatter(code, mermaidTheme, mermaidLayout, title)
      
      if (editingChartId) {
        await chartApi.update(editingChartId, { title, type: chartType, content: contentToSave })
        toast({ title: "更新成功", description: "图表已更新" })
      } else {
        await chartApi.create({ title, type: chartType, content: contentToSave, isPublic: false })
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
  }, [code, chartType, editingChartId, mermaidTheme, mermaidLayout])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast({ title: "复制成功", description: "Mermaid 代码已复制到剪贴板" })
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  const handleAiChat = useCallback(async () => {
    if (!aiMessage.trim()) return

    const userMessage = aiMessage.trim()
    setAiMessage('')
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }])
    setIsAiProcessing(true)

    try {
      const aiConfig = getAIConfig()
      const res = await chartApi.generate(
        `基于当前的 Mermaid 代码进行修改：\n当前代码：\n${code}\n\n用户要求：${userMessage}`,
        chartType,
        aiConfig
      ) as unknown as { code: number; msg: string; data: { mermaid: string } }
      
      if (res.code === 0) {
        setCode(res.data.mermaid)
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: '已根据您的要求更新图表' 
        }])
        toast({ title: "更新成功", description: "图表已更新" })
      }
    } catch (error: any) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，更新失败，请稍后重试' 
      }])
      toast({
        variant: "destructive",
        title: "更新失败",
        description: error.response?.data?.msg || "请稍后重试",
      })
    } finally {
      setIsAiProcessing(false)
    }
  }, [aiMessage, code, chartType])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatHistory])

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
          <Button 
            variant={layoutMode === 'split' ? 'ghost' : 'default'} 
            size="sm" 
            onClick={() => setLayoutMode(layoutMode === 'split' ? 'ai' : 'split')}
            title={layoutMode === 'split' ? '切换到 AI 模式' : '切换到代码模式'}
          >
            {layoutMode === 'split' ? (
              <>
                <Sparkles className="w-4 h-4 mr-1" />
                Use AI
              </>
            ) : (
              <>
                <Code2 className="w-4 h-4 mr-1" />
                代码模式
              </>
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowAISettings(true)} title="AI 模型设置">
            <Settings className="h-5 w-5" />
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
      <AISettingsDialog open={showAISettings} onOpenChange={setShowAISettings} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {layoutMode === 'split' && (
          <aside className="w-64 border-r bg-card overflow-y-auto flex flex-col">
            <div className="p-4 flex-1">
              <h2 className="text-sm font-medium mb-3">图表类型</h2>
              <ChartTypeSelector onSelect={handleChartTypeSelect} />
            </div>
            <div className="p-4 border-t">
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
        )}

        <main className="flex-1 flex flex-col">
          <Tabs value={chartType} className="flex-1 flex flex-col">
            <div className="flex-1 flex">
              {layoutMode === 'split' ? (
                <>
                  <div className="w-1/3 border-r flex flex-col h-[calc(100vh-4rem)]">
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

                  <div className="w-2/3 flex flex-col h-[calc(100vh-4rem)]">
                    <div className="p-2 border-b flex items-center justify-between shrink-0">
                      <span className="text-sm text-muted-foreground">预览</span>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Palette className="w-4 h-4 mr-1" />
                              主题
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">主题</div>
                            <DropdownMenuItem onClick={() => setMermaidTheme('mermaid-chart')}>Mermaid Chart</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidTheme('neo')}>Neo</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidTheme('neo-dark')}>Neo Dark</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidTheme('default')}>Default</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidTheme('forest')}>Forest</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidTheme('base')}>Base</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidTheme('dark')}>Dark</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidTheme('neutral')}>Neutral</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Network className="w-4 h-4 mr-1" />
                              布局
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">布局</div>
                            <DropdownMenuItem onClick={() => setMermaidLayout('dagre')}>
                              Hierarchical (Dagre)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidLayout('elk')}>
                              Adaptive (ELK)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 bg-muted/30">
                      <MermaidPreview code={code} theme={mermaidTheme} layout={mermaidLayout} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
                  <div className="flex-1 flex flex-col">
                    <div className="p-2 border-b flex items-center justify-between shrink-0">
                      <span className="text-sm text-muted-foreground">预览</span>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Palette className="w-4 h-4 mr-1" />
                              主题
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">主题</div>
                            <DropdownMenuItem onClick={() => setMermaidTheme('mermaid-chart')}>Mermaid Chart</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidTheme('neo')}>Neo</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidTheme('neo-dark')}>Neo Dark</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidTheme('default')}>Default</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidTheme('forest')}>Forest</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidTheme('base')}>Base</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidTheme('dark')}>Dark</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidTheme('neutral')}>Neutral</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Network className="w-4 h-4 mr-1" />
                              布局
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">布局</div>
                            <DropdownMenuItem onClick={() => setMermaidLayout('dagre')}>
                              Hierarchical (Dagre)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setMermaidLayout('elk')}>
                              Adaptive (ELK)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 bg-muted/30">
                      <MermaidPreview code={code} theme={mermaidTheme} layout={mermaidLayout} />
                    </div>
                  </div>

                  {/* AI Chat Panel */}
                  <div className="h-80 border-t flex flex-col bg-card">
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {chatHistory.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                          <div className="text-center space-y-2">
                            <Sparkles className="w-8 h-8 mx-auto opacity-50" />
                            <p>通过对话来修改您的图表</p>
                            <p className="text-xs">例如：添加一个新节点、修改颜色、调整布局</p>
                          </div>
                        </div>
                      ) : (
                        chatHistory.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              msg.role === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                      {isAiProcessing && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg px-4 py-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="p-3 border-t bg-background">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aiMessage}
                          onChange={(e) => setAiMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAiChat()}
                          placeholder="告诉 AI 你想如何修改图表..."
                          className="flex-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          disabled={isAiProcessing}
                        />
                        <Button size="sm" onClick={handleAiChat} disabled={isAiProcessing || !aiMessage.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  )
}