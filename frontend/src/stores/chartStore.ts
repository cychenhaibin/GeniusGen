import { create } from 'zustand'
import { Chart } from '@/types'

interface ChartState {
  currentChart: Chart | null
  charts: Chart[]
  isLoading: boolean
  error: string | null

  // Actions
  setCurrentChart: (chart: Chart | null) => void
  setCharts: (charts: Chart[]) => void
  addChart: (chart: Chart) => void
  updateChart: (id: number, updates: Partial<Chart>) => void
  removeChart: (id: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useChartStore = create<ChartState>((set) => ({
  currentChart: null,
  charts: [],
  isLoading: false,
  error: null,

  setCurrentChart: (chart) => set({ currentChart: chart }),

  setCharts: (charts) => set({ charts }),

  addChart: (chart) => set((state) => ({
    charts: [chart, ...state.charts]
  })),

  updateChart: (id, updates) => set((state) => ({
    charts: state.charts.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    ),
    currentChart: state.currentChart?.id === id
      ? { ...state.currentChart, ...updates }
      : state.currentChart
  })),

  removeChart: (id) => set((state) => ({
    charts: state.charts.filter((c) => c.id !== id),
    currentChart: state.currentChart?.id === id ? null : state.currentChart
  })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}))