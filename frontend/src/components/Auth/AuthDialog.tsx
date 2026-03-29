import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'login' | 'register'
}

export function AuthDialog({ open, onOpenChange, mode }: AuthDialogProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
        toast({ title: '登录成功' })
      } else {
        await register(email, password, name)
        toast({ title: '注册成功' })
      }
      onOpenChange(false)
      setEmail('')
      setPassword('')
      setName('')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: mode === 'login' ? '登录失败' : '注册失败',
        description: error.response?.data?.msg || '请稍后重试',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background rounded-lg p-6 shadow-lg">
          <DialogPrimitive.Title asChild>
            <CardTitle>{mode === 'login' ? '登录' : '注册'}</CardTitle>
          </DialogPrimitive.Title>
          <CardContent className="p-0 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <Input type="text" placeholder="用户名" value={name} onChange={(e) => setName(e.target.value)} required />
              )}
              <Input type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === 'login' ? '登录' : '注册'}
              </Button>
            </form>
          </CardContent>
          <DialogPrimitive.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100" aria-label="Close">
              <span className="sr-only">Close</span>
            </button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}