import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { chartApi, Chart } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useChartStore } from '@/stores/chartStore'
import { toast } from '@/hooks/use-toast'
import { ChartCard } from '@/components/ChartList/ChartCard'
import { Sparkles, Plus, Search, Loader2, ArrowLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function MyCharts() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setCurrentChart } = useChartStore()

  const [charts, setCharts] = useState<Chart[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchCharts = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const res = await chartApi.list(page, pageSize) as unknown as { code: number; msg: string; data: { list: Chart[]; total: number; page: number } }
      if (res.code === 0) {
        setCharts(res.data.list)
        setTotal(res.data.total)
      }
    } catch {
      toast({ variant: 'destructive', title: '获取图表失败' })
    } finally {
      setIsLoading(false)
    }
  }, [page, user, pageSize])

  useEffect(() => {
    fetchCharts()
  }, [fetchCharts])

  const handleEdit = (chart: Chart) => {
    navigate(`/edit/${chart.id}`)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await chartApi.delete(deleteId)
      setCharts(charts.filter((c) => c.id !== deleteId))
      toast({ title: '删除成功' })
      setDeleteId(null)
    } catch {
      toast({ variant: 'destructive', title: '删除失败' })
    } finally {
      setIsDeleting(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> 返回编辑器
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EE4D2D] to-orange-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold">我的图表</h1>
          </div>
        </div>
        <Button onClick={() => navigate('/')}>
          <Plus className="w-4 h-4 mr-2" /> 新建图表
        </Button>
      </header>

      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="搜索图表..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : charts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">还没有图表</p>
            <Button onClick={() => navigate('/')}>
              <Sparkles className="w-4 h-4 mr-2" /> 创建第一个图表
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {charts.filter((c) => search === '' || c.title.toLowerCase().includes(search.toLowerCase())).map((chart) => (
                <ChartCard key={chart.id} chart={chart} onEdit={() => handleEdit(chart)} onDelete={() => setDeleteId(chart.id)} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</Button>
                <span className="text-sm text-muted-foreground">第 {page} / {totalPages} 页</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</Button>
              </div>
            )}
          </>
        )}
      </main>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">确定要删除这个图表吗？此操作无法撤销。</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>取消</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} 删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}