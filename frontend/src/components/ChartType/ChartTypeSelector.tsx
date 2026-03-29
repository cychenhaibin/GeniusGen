import { Card, CardContent } from '@/components/ui/card'
import {
  GitBranch,
  GitCommit,
  Database,
  Layout,
  GitGraph,
  PieChart,
  type LucideIcon
} from 'lucide-react'

interface ChartType {
  id: string
  name: string
  icon: LucideIcon
  description: string
  template: string
  title?: string
}

const CHART_TYPES: ChartType[] = [
  {
    id: 'flowchart',
    name: '流程图',
    icon: GitBranch,
    description: '业务流程、决策流程',
    template: `flowchart TD
    A[开始] --> B{判断}
    B -->|是| C[处理1]
    B -->|否| D[处理2]
    C --> E[结束]
    D --> E`
  },
  {
    id: 'sequence',
    name: '时序图',
    icon: GitCommit,
    description: '交互时序、调用流程',
    template: `sequenceDiagram
    participant 用户
    participant 系统
    participant 数据库
    用户->>系统: 发起请求
    系统->>数据库: 查询数据
    数据库-->>系统: 返回结果
    系统-->>用户: 响应结果`
  },
  {
    id: 'er',
    name: 'ER图',
    icon: Database,
    description: '实体关系、数据模型',
    template: `erDiagram
    User ||--o{ Order : "拥有"
    User ||--o{ Address : "关联"
    Order ||--o{ OrderItem : "包含"
    Product ||--o{ OrderItem : "被购买"
    Category ||--o{ Product : "分类"

    User {
        int user_id PK
        string username
        string email
        string phone
        timestamp created_at
    }

    Order {
        int order_id PK
        int user_id FK
        string order_number
        string status
        decimal total_amount
        timestamp created_at
    }

    Address {
        int address_id PK
        int user_id FK
        string receiver_name
        string phone
        string province
        string city
        string district
        string detail_address
    }

    OrderItem {
        int item_id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
        decimal subtotal
    }

    Product {
        int product_id PK
        int category_id FK
        string product_name
        string description
        decimal price
        int stock
        string image_url
    }

    Category {
        int category_id PK
        string category_name
        string description
    }`
  },
  {
    id: 'class',
    name: '类图',
    icon: Layout,
    description: '面向对象、继承关系',
    template: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +String color
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`
  },
  {
    id: 'gantt',
    name: '甘特图',
    icon: GitGraph,
    description: '项目进度、任务排期',
    template: `gantt
    title 项目进度
    dateFormat YYYY-MM-DD
    section 阶段一
    需求分析: a1, 2024-01-01, 7d
    设计方案: a2, after a1, 5d
    section 阶段二
    开发实现: b1, after a2, 14d
    测试验证: b2, after b1, 7d`
  },
  {
    id: 'pie',
    name: '饼图',
    icon: PieChart,
    description: '数据占比、统计分布',
    title: '项目占比',
    template: `pie title 项目占比
    "前端开发" : 40
    "后端开发" : 35
    "测试" : 15
    "运维" : 10`
  }
]

interface ChartTypeSelectorProps {
  onSelect: (type: string, template: string) => void
}

export function ChartTypeSelector({ onSelect }: ChartTypeSelectorProps) {
  return (
    <div className="space-y-2">
      {CHART_TYPES.map((chart) => (
        <Card
          key={chart.id}
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => onSelect(chart.id, chart.template)}
        >
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <chart.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{chart.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {chart.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
