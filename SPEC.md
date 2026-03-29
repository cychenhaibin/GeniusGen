# 图表绘制网站 - AI驱动开发提示词模板

## 项目概述

创建一个类似 https://generator.cengxuyuan.cn/ 的在线图表绘制网站，支持 AI 生成图表。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + TypeScript + Vite |
| UI组件 | shadcn/ui + Tailwind CSS |
| 图表渲染 | Mermaid.js + XArrow |
| 代码编辑器 | CodeMirror |
| 后端 | Go + Gin 框架 |
| 数据库 | PostgreSQL |
| AI模型 | Minimax API |
| API风格 | REST |
| 部署 | GitHub (前端 Vercel/Netlify，后端云服务器) |

---

## 项目结构

```
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/       # React 组件
│   │   │   ├── Editor/      # 代码编辑器
│   │   │   ├── Preview/     # 图表预览
│   │   │   ├── Sidebar/     # 侧边栏
│   │   │   └── ui/          # shadcn/ui 组件
│   │   ├── hooks/           # 自定义 Hook
│   │   ├── lib/             # 工具函数
│   │   ├── types/           # TypeScript 类型
│   │   └── App.tsx
│   └── package.json
│
├── backend/                  # 后端项目
│   ├── main.go              # 入口
│   ├── config/              # 配置
│   ├── handlers/            # API处理器
│   ├── models/              # 数据模型
│   ├── repository/          # 数据库操作
│   ├── services/            # 业务逻辑
│   └── go.mod
│
└── SPEC.md
```

---

## 第一阶段：项目规划提示词

### 提示词模板

```
请帮我规划一个在线图表绘制网站的技术方案。

## 目标
创建一个类似 https://generator.cengxuyuan.cn/ 的图表生成工具，支持：
- 流程图、时序图、ER图、类图、状态图等
- AI 通过文本描述自动生成图表（Mermaid 语法）
- 实时预览编辑
- 用户登录注册，保存自己的图表
- 导出 PNG/SVG/PDF

## 技术栈
- 前端：React + TypeScript + Vite + shadcn/ui + Tailwind CSS
- 后端：Go + Gin 框架
- 数据库：PostgreSQL
- AI：Minimax API
- API：REST

## 约束
- 前后端分离架构
- 用户系统（注册/登录/JWT认证）
- 图表存储（MySQL + JSON 字段存图表定义）

请输出：
1. 详细技术方案
2. API 接口设计
3. 数据库表结构
4. 核心功能模块划分
5. 开发优先级排序
```

---

## 第二阶段：前端脚手架提示词

### 2.1 初始化前端项目

```
请帮我初始化前端项目。

## 技术栈
- React 18 + TypeScript
- Vite 构建工具
- shadcn/ui 组件库
- Tailwind CSS
- 状态管理：React Context / Zustand
- HTTP客户端：Axios / Fetch

## 项目结构
```
src/
├── components/
│   ├── ui/              # shadcn/ui 组件
│   ├── Editor/          # 图表编辑器
│   ├── Preview/         # 图表预览
│   └── ChartType/       # 图表类型选择
├── hooks/               # 自定义 Hook
├── lib/                 # 工具函数
├── types/               # TypeScript 类型
├── App.tsx
└── main.tsx
```

## 需求
1. 初始化 Vite + React + TypeScript 项目
2. 安装配置 Tailwind CSS
3. 安装 shadcn/ui 并添加基础组件（Button, Card, Input, Dialog, Tabs等）
4. 配置路径别名 (@/*)
5. 添加 CodeMirror 代码编辑器

请创建完整的项目配置和基础文件。
```

### 2.2 安装 shadcn/ui 组件

```
请帮我安装并配置 shadcn/ui 组件库。

## 需求
安装以下组件：
- Button, Card, Input, Textarea
- Dialog, Sheet (侧边栏)
- Tabs (图表类型切换)
- Dropdown Menu
- Select (主题选择)
- Toast (提示消息)
- Avatar (用户头像)

## 配置
- 主题色：蓝色/紫色渐变
- 深色模式支持

请提供安装命令和基础使用示例。
```

---

## 第三阶段：后端脚手架提示词

### 3.1 初始化 Go 后端

```
请帮我初始化 Go 后端项目。

## 技术栈
- Go 1.21+
- Gin Web 框架
- GORM (PostgreSQL)
- JWT 认证
- viper 配置管理

## 项目结构
```
backend/
├── main.go
├── config/
│   └── config.go
├── models/
│   ├── user.go
│   └── chart.go
├── handlers/
│   ├── auth.go
│   └── chart.go
├── repository/
│   ├── user.go
│   └── chart.go
├── services/
│   ├── auth.go
│   └── ai.go
├── middleware/
│   └── auth.go
└── go.mod
```

## 需求
1. 初始化 Go module
2. 配置 Viper 读取 .env 配置
3. 连接 PostgreSQL 数据库
4. 创建用户和图表数据模型
5. 实现注册/登录 API (JWT)
6. 实现图表 CRUD API

请创建完整的项目结构和基础代码。
```

---

## 第四阶段：核心功能实现提示词

### 功能1：AI 生成图表

**前端提示词：**
```
请实现 AI 生成图表功能。

## 需求
- 用户输入文本描述（如"画一个用户登录的流程图"）
- 调用后端 API 获取 AI 生成 的 Mermaid 语法
- 实时渲染到预览区
- 支持重新生成
- 支持手动编辑后重新渲染

## 组件
- PromptInput.tsx: 文本输入框
- AIGenerateButton.tsx: 生成按钮（带加载状态）
- MermaidPreview.tsx: 图表预览组件

## API
POST /api/chart/generate
Body: { prompt: string }
Response: { mermaid: string }

请创建完整的组件和样式。
```

**后端提示词：**
```
请实现 AI 生成图表的后端 API。

## 需求
1. POST /api/chart/generate 接口
2. 调用 Minimax API 将用户描述转为 Mermaid 语法
3. 实现重试机制（API 超时/失败时重试3次）
4. 错误处理和日志

## Minimax 配置
- API Key: 从环境变量 MINIMAX_API_KEY 读取
- 模型: abab6.5s-chat
- API 地址: https://api.minimax.chat/v1/text/chatcompletion_v2

## Prompt 模板
系统提示词：
```
你是一个图表生成专家。根据用户的描述，生成对应的 Mermaid 语法图表。
支持的图表类型：flowchart, sequenceDiagram, erDiagram, classDiagram, stateDiagram, gantt, pie。
只输出 Mermaid 代码，不要输出其他内容。
```

请实现完整的 handler 和 service。
```

### 功能2：图表编辑器

```
请实现图表编辑器组件。

## 需求
- 左侧：CodeMirror 代码编辑器（支持 Mermaid 语法高亮）
- 右侧：Mermaid 实时预览
- 支持拖拽调整左右比例
- 支持全屏模式
- 顶部工具栏：图表类型切换、主题切换、导出按钮

## 布局
- 左：编辑器（40%）
- 中间：拖拽分隔条
- 右：预览区（60%）

## 交互
- 编辑器内容变化时自动重新渲染预览（防抖300ms）
- 支持 Ctrl+S 保存
- 支持 Ctrl+Enter 重新生成

请创建完整的 Editor 组件。
```

### 功能3：图表类型选择器

```
请实现图表类型选择组件。

## 需求
- 展示多种图表类型卡片
- 每个卡片：图标 + 名称 + 描述 + 点击示例
- 支持的图表类型：
  - 流程图 (flowchart TD/LR)
  - 时序图 (sequenceDiagram)
  - ER图 (erDiagram)
  - 类图 (classDiagram)
  - 状态图 (stateDiagram-v2)
  - 甘特图 (gantt)
  - 饼图 (pie)

## 交互
- 点击卡片填充对应模板到编辑器
- 当前选中卡片高亮

## 内置模板示例
- 流程图：简单用户登录流程
- 时序图：订单处理流程
- ER图：用户-订单-商品关系

请创建 ChartTypeSelector 组件。
```

### 功能4：用户认证

**后端提示词：**
```
请实现用户认证功能。

## 需求
1. POST /api/auth/register - 用户注册
   - 邮箱、密码、用户名
   - 密码 bcrypt 加密存储

2. POST /api/auth/login - 用户登录
   - 邮箱 + 密码
   - 返回 JWT Token

3. GET /api/auth/me - 获取当前用户信息
   - 需要 Bearer Token 认证

## JWT 配置
- 密钥：从环境变量 JWT_SECRET 读取
- 过期时间：7天

## 响应格式
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "token": "xxx",
    "user": { "id": 1, "email": "x@x.com", "name": "xxx" }
  }
}
```

请实现完整的 auth handler 和 middleware。
```

**前端提示词：**
```
请实现前端用户认证功能。

## 需求
1. 登录弹窗组件 (LoginDialog)
2. 注册弹窗组件 (RegisterDialog)
3. 用户状态管理 (AuthContext)
4. 路由守卫（未登录跳转登录页）
5. 登出功能

## UI
- 使用 shadcn/ui Dialog 组件
- 简洁的表单设计
- 登录后显示用户头像下拉菜单

## API 调用
- 使用 Axios 拦截器自动添加 Token
- Token 存储到 localStorage

请创建完整的认证流程。
```

### 功能5：图表保存与加载

**后端提示词：**
```
请实现图表 CRUD API。

## 数据模型
```go
type Chart struct {
    ID        uint      `gorm:"primaryKey"`
    Title     string    // 图表标题
    Type      string    // 图表类型
    Content   string    // Mermaid 语法内容
    UserID    uint      // 所属用户
    IsPublic  bool      // 是否公开
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

## API
1. POST /api/charts - 创建图表
2. GET /api/charts - 获取用户所有图表（分页）
3. GET /api/charts/:id - 获取单个图表
4. PUT /api/charts/:id - 更新图表
5. DELETE /api/charts/:id - 删除图表
6. GET /api/charts/public/:id - 公开访问图表

请实现完整的 handler。
```

**前端提示词：**
```
请实现图表保存与加载功能。

## 需求
1. 图表列表页面 (MyCharts)
2. 图表卡片展示（标题、类型、缩略图、创建时间）
3. 点击加载到编辑器
4. 删除图表（确认弹窗）
5. 保存图表弹窗（标题、公开/私有）

## UI
- 使用 shadcn/ui Card 组件
- 网格布局展示
- 分页加载

## API 集成
- GET /api/charts - 列表
- POST /api/charts - 保存
- PUT /api/charts/:id - 更新
- DELETE /api/charts/:id - 删除

请创建完整的页面和组件。
```

### 功能6：导出功能

```
请实现图表导出功能。

## 需求
- 导出 PNG
- 导出 SVG
- 导出 PDF
- 一键复制 Mermaid 代码

## 技术
- html-to-image: 生成图片
- jsPDF: 生成 PDF
- 使用 Mermaid 导出的 SVG

## UI
- 导出按钮下拉菜单
- 导出中显示加载状态
- 导出成功显示下载提示

请实现 exportUtils 工具函数和导出按钮组件。
```

---

## 第五阶段：UI/UX 优化提示词

```
请帮我优化图表编辑器的用户界面。

## 当前状态
- 基础功能已实现
- 需要美化界面

## 需求
1. 深色/浅色主题切换（使用 next-themes）
2. 响应式设计（支持平板）
3. 页面加载骨架屏
4. 按钮悬停动画
5. 图表渲染加载状态

## 设计风格
- 参考 https://generator.cengxuyuan.cn/
- 主色调：#EE4D2D (indigo-500) 渐变
- 背景：深色 #0f172a / 浅色 #f8fafc
- 圆角：rounded-xl
- 阴影：shadow-lg

## 组件优化
- Header: 固定顶部，磨砂玻璃效果
- Sidebar: 可折叠
- Editor: 行号显示，主题匹配

请更新样式和组件。
```

---

## 第六阶段：部署提示词

```
请帮我配置项目部署。

## 前端部署 (Vercel)
- 构建命令: npm run build
- 输出目录: dist
- Node 版本: 18

## 后端部署
- 服务器: 云服务器 (如阿里云/腾讯云)
- 域名: api.yourdomain.com
- Nginx 配置反向代理

## 环境变量

### 前端 (.env)
```
VITE_API_BASE_URL=http://localhost:8080/api
```

### 后端 (.env)
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=xxx
DB_NAME=chart_generator
JWT_SECRET=xxx
MINIMAX_API_KEY=xxx
```

## GitHub Actions 自动部署
配置 CI/CD 流程：
- 推送 main 分支自动部署前端到 Vercel

请提供完整的部署配置。
```

---

## 使用建议

1. **按阶段执行**：按上述6个阶段顺序开发
2. **小步迭代**：每个提示词聚焦一个具体功能
3. **提供上下文**：每次对话都提供项目背景
4. **验证结果**：AI完成后验证功能是否正常

---

## 推荐的AI模型

- **复杂项目**：Claude 4 Opus
- **代码生成**：Cursor / Windsurf
