import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

export type AIProvider = 
  | 'minimax'
  | 'openai'
  | 'claude'
  | 'grok'
  | 'deepseek'
  | 'glm'
  | 'kimi'
  | 'baichuan'
  | 'qwen'
  | 'hunyuan'
  | 'ernie'
  | 'gemini'
  | 'cohere'
  | 'mistral'
  | 'custom'

export interface AIConfig {
  provider: AIProvider
  apiKey: string
  baseURL: string
  model: string
}

const DEFAULT_CONFIGS: Record<AIProvider, { baseURL: string; model: string }> = {
  minimax: {
    baseURL: 'https://api.minimax.chat/v1',
    model: 'MiniMax-M2.5',
  },
  openai: {
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o',
  },
  claude: {
    baseURL: 'https://api.anthropic.com/v1',
    model: 'claude-3-5-sonnet-20241022',
  },
  grok: {
    baseURL: 'https://api.x.ai/v1',
    model: 'grok-2-latest',
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  },
  glm: {
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-plus',
  },
  kimi: {
    baseURL: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
  },
  baichuan: {
    baseURL: 'https://api.baichuan-ai.com/v1',
    model: 'Baichuan4',
  },
  qwen: {
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
  },
  hunyuan: {
    baseURL: 'https://api.hunyuan.cloud.tencent.com/v1',
    model: 'hunyuan-lite',
  },
  ernie: {
    baseURL: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1',
    model: 'ernie-4.0-8k',
  },
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1',
    model: 'gemini-2.0-flash-exp',
  },
  cohere: {
    baseURL: 'https://api.cohere.ai/v1',
    model: 'command-r-plus',
  },
  mistral: {
    baseURL: 'https://api.mistral.ai/v1',
    model: 'mistral-large-latest',
  },
  custom: {
    baseURL: '',
    model: '',
  },
}

const STORAGE_KEY = 'ai-config'

export function getAIConfig(): AIConfig {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse AI config:', e)
    }
  }
  return {
    provider: 'minimax',
    apiKey: '',
    baseURL: DEFAULT_CONFIGS.minimax.baseURL,
    model: DEFAULT_CONFIGS.minimax.model,
  }
}

export function saveAIConfig(config: AIConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

interface AISettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AISettingsDialog({ open, onOpenChange }: AISettingsDialogProps) {
  const [config, setConfig] = useState<AIConfig>(getAIConfig())

  useEffect(() => {
    if (open) {
      setConfig(getAIConfig())
    }
  }, [open])

  const handleProviderChange = (provider: AIConfig['provider']) => {
    const defaults = DEFAULT_CONFIGS[provider]
    setConfig({
      ...config,
      provider,
      baseURL: defaults.baseURL,
      model: defaults.model,
    })
  }

  const handleSave = () => {
    if (!config.apiKey.trim()) {
      toast({
        variant: 'destructive',
        title: '配置错误',
        description: 'API Key 不能为空',
      })
      return
    }

    if (!config.baseURL.trim()) {
      toast({
        variant: 'destructive',
        title: '配置错误',
        description: 'Base URL 不能为空',
      })
      return
    }

    if (!config.model.trim()) {
      toast({
        variant: 'destructive',
        title: '配置错误',
        description: 'Model 不能为空',
      })
      return
    }

    saveAIConfig(config)
    toast({
      title: '保存成功',
      description: 'AI 模型配置已更新',
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI 模型配置</DialogTitle>
          <DialogDescription>
            配置大模型 API 以生成图表。默认使用 MiniMax M2.5。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">服务商</Label>
            <Select
              value={config.provider}
              onValueChange={(value) => handleProviderChange(value as AIConfig['provider'])}
            >
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimax">MiniMax</SelectItem>
                <SelectItem value="openai">GPT</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="grok">Grok</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
                <SelectItem value="glm">GLM</SelectItem>
                <SelectItem value="kimi">Kimi</SelectItem>
                <SelectItem value="baichuan">百川</SelectItem>
                <SelectItem value="qwen">通义千问</SelectItem>
                <SelectItem value="hunyuan">混元</SelectItem>
                <SelectItem value="ernie">文心一言</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="cohere">Cohere</SelectItem>
                <SelectItem value="mistral">Mistral</SelectItem>
                <SelectItem value="custom">自定义</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="请输入 API Key"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseURL">Base URL</Label>
            <Input
              id="baseURL"
              placeholder="https://api.minimax.chat/v1"
              value={config.baseURL}
              onChange={(e) => setConfig({ ...config, baseURL: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">模型</Label>
            <Input
              id="model"
              placeholder="MiniMax-M2.5"
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              示例: MiniMax-M2.5, gpt-4o, claude-3-5-sonnet, grok-2-latest, deepseek-chat, glm-4-plus, ernie-4.0-8k
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存配置
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
