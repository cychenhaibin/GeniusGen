import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'
import { useAuth } from '@/contexts/AuthContext'
import { AuthDialog } from '@/components/Auth/AuthDialog'
import {
  Sparkles,
  Moon,
  Sun,
  LogIn,
  User,
  LogOut,
  LayoutGrid,
} from 'lucide-react'

export function Header() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()

  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const handleLogin = () => {
    setAuthMode('login')
    setShowAuthDialog(true)
  }

  const handleRegister = () => {
    setAuthMode('register')
    setShowAuthDialog(true)
  }

  return (
    <>
      <header className="h-14 border-b flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EE4D2D] to-orange-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold">GeniusGen</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm hidden sm:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/my-charts')}>
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  我的图表
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleLogin}>
                <LogIn className="w-4 h-4 mr-1" />
                登录
              </Button>
              <Button size="sm" onClick={handleRegister}>
                <User className="w-4 h-4 mr-1" />
                注册
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        mode={authMode}
      />
    </>
  )
}