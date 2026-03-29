import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { Sparkles, BarChart3, FileCode, Zap } from 'lucide-react'

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI 智能生成',
    description: '输入自然语言描述，AI 自动生成专业图表',
  },
  {
    icon: BarChart3,
    title: '多种图表类型',
    description: '支持流程图、时序图、ER图、类图等',
  },
  {
    icon: FileCode,
    title: 'Mermaid 语法',
    description: '基于 Mermaid.js，代码可复用',
  },
  {
    icon: Zap,
    title: '实时预览',
    description: '编辑即时渲染，所见即所得',
  },
]

const CHART_EXAMPLES = [
  { type: '流程图', preview: 'flowchart TD\n    A --> B' },
  { type: '时序图', preview: 'sequenceDiagram\n    A->>B: Hello' },
  { type: 'ER图', preview: 'erDiagram\n    CUSTOMER ||--o{ ORDER : places' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            AI 驱动的图表生成器
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            用文字描述，
            <span className="bg-gradient-to-r from-[#EE4D2D] to-orange-400 bg-clip-text text-transparent">
              AI 帮你画图
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            告别繁琐的语法，只需描述你想要的图表，AI 自动生成 Mermaid 代码
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/')}>
              <Sparkles className="w-5 h-5 mr-2" />
              立即开始
            </Button>
            {user && (
              <Button size="lg" variant="outline" onClick={() => navigate('/my-charts')}>
                我的图表
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Examples */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">支持的图表类型</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {CHART_EXAMPLES.map((example) => (
              <Card key={example.type} className="overflow-hidden">
                <CardContent className="p-6 bg-background">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{example.type}</h3>
                  </div>
                  <pre className="text-xs text-muted-foreground bg-muted p-3 rounded-md overflow-x-auto">
                    {example.preview}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">准备好创建你的图表了吗？</h2>
          <p className="text-muted-foreground mb-8">免费使用，无需注册</p>
          <Button size="lg" onClick={() => navigate('/')}>
            <Sparkles className="w-5 h-5 mr-2" />
            开始创作
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 px-4 text-center text-sm text-muted-foreground">
        <p>GeniusGen - AI 驱动的图表生成工具</p>
      </footer>
    </div>
  )
}