export type ChartType =
  | 'flowchart'
  | 'sequence'
  | 'er'
  | 'class'
  | 'state'
  | 'gantt'
  | 'pie'

export interface Chart {
  id: number
  title: string
  type: ChartType
  content: string
  userId: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  email: string
  name: string
  avatar?: string
}

export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

export interface GenerateRequest {
  prompt: string
  type?: ChartType
}

export interface GenerateResponse {
  mermaid: string
  type: ChartType
}
