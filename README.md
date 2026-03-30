# GeniusGen - AI 驱动的图表生成工具

<div align="center">

![GeniusGen Logo](https://img.shields.io/badge/GeniusGen-AI%20Chart%20Generator-orange?style=for-the-badge)

一个现代化的在线图表绘制工具，支持 AI 智能生成 Mermaid 图表

[English](./README_EN.md) | 简体中文

[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://golang.org/)
[![Mermaid](https://img.shields.io/badge/Mermaid-11.13-ff3670?logo=mermaid)](https://mermaid.js.org/)

</div>

---

## ✨ 特性

- 🤖 **AI 智能生成** - 输入自然语言描述，AI 自动生成专业图表
- 📊 **多种图表类型** - 支持流程图、时序图、ER图、类图、状态图、甘特图、饼图等
- 🎨 **丰富主题** - 提供多种内置主题（Mermaid Chart、Neo、Dark、Forest 等）
- 🔄 **实时预览** - 编辑即时渲染，所见即所得
- 💬 **AI 对话模式** - 通过自然语言对话修改图表
- 🌓 **深色模式** - 支持明暗主题切换
- 💾 **云端保存** - 用户登录后可保存和管理图表
- 📤 **多格式导出** - 支持导出 PNG、SVG、PDF 格式
- 🎯 **双布局模式** - 代码编辑模式和 AI 对话模式自由切换
- 📱 **响应式设计** - 完美适配桌面和平板设备

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Go 1.21+
- PostgreSQL 15+
- Docker & Docker Compose (可选)

### 使用 Docker Compose 启动

```bash
# 克隆项目
git clone https://github.com/yourusername/GeniusGen.git
cd GeniusGen

# 启动 PostgreSQL 数据库
docker-compose up -d

# 启动后端服务
cd backend
go mod download
go run main.go

# 启动前端服务
cd ../frontend
npm install
npm run dev
```

### 手动启动

#### 1. 启动数据库

```bash
# 使用 Docker
docker-compose up -d postgres

# 或手动安装 PostgreSQL 并创建数据库
createdb chart_generator
```

#### 2. 启动后端

```bash
cd backend

# 安装依赖
go mod download

# 配置环境变量（复制并修改 config.yaml）
cp config.yaml.example config.yaml

# 运行后端服务
go run main.go
```

后端服务将在 `http://localhost:8080` 启动

#### 3. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

#### 4. 启动官网（可选）

```bash
cd website

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

官网将在 `http://localhost:4321` 启动

---

## 📁 项目结构

```
GeniusGen/
├── frontend/                 # React 前端应用
│   ├── src/
│   │   ├── components/       # React 组件
│   │   │   ├── Editor/      # 代码编辑器组件
│   │   │   ├── Preview/     # 图表预览组件
│   │   │   ├── ChartType/   # 图表类型选择器
│   │   │   ├── Auth/        # 认证相关组件
│   │   │   ├── Settings/    # 设置组件
│   │   │   └── ui/          # shadcn/ui 基础组件
│   │   ├── pages/           # 页面组件
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── lib/             # 工具函数
│   │   ├── contexts/        # React Context
│   │   └── types/           # TypeScript 类型定义
│   └── package.json
│
├── backend/                  # Go 后端服务
│   ├── main.go              # 入口文件
│   ├── config/              # 配置管理
│   ├── handlers/            # API 处理器
│   ├── models/              # 数据模型
│   ├── repository/          # 数据库操作
│   ├── services/            # 业务逻辑
│   ├── middleware/          # 中间件
│   └── go.mod
│
├── website/                  # Astro 官网
│   ├── src/
│   │   └── pages/           # 页面
│   └── package.json
│
├── docker-compose.yml        # Docker Compose 配置
└── SPEC.md                   # 项目规范文档
```

---

## 🛠️ 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2 | UI 框架 |
| TypeScript | 5.3 | 类型安全 |
| Vite | 5.1 | 构建工具 |
| Tailwind CSS | 3.4 | 样式框架 |
| shadcn/ui | - | UI 组件库 |
| Mermaid.js | 11.13 | 图表渲染 |
| CodeMirror | 6.0 | 代码编辑器 |
| Zustand | 4.5 | 状态管理 |
| React Router | 6.22 | 路由管理 |
| Axios | 1.6 | HTTP 客户端 |

### 后端

| 技术 | 用途 |
|------|------|
| Go | 1.21+ | 后端语言 |
| Gin | Web 框架 |
| GORM | ORM 框架 |
| PostgreSQL | 数据库 |
| JWT | 身份认证 |
| Viper | 配置管理 |

### 官网

| 技术 | 版本 | 用途 |
|------|------|------|
| Astro | 6.1 | 静态站点生成 |
| React | 18.3 | UI 组件 |
| Tailwind CSS | 3.4 | 样式框架 |

---

## 🎯 核心功能

### 1. AI 智能生成

输入自然语言描述，AI 自动生成 Mermaid 图表代码：

```
用户输入：画一个用户登录的流程图
AI 生成：完整的 Mermaid flowchart 代码
```

### 2. 双模式编辑

- **代码模式**：左侧代码编辑器 + 右侧实时预览
- **AI 模式**：全屏预览 + 底部 AI 对话框

### 3. 图表类型

支持 Mermaid 的所有图表类型：

- 流程图 (Flowchart)
- 时序图 (Sequence Diagram)
- ER 图 (Entity Relationship Diagram)
- 类图 (Class Diagram)
- 状态图 (State Diagram)
- 甘特图 (Gantt Chart)
- 饼图 (Pie Chart)
- Git 图 (Git Graph)
- 用户旅程图 (User Journey)

### 4. 主题定制

提供多种内置主题：

- Mermaid Chart
- Neo / Neo Dark
- Default
- Forest
- Base
- Dark
- Neutral

### 5. 布局引擎

支持两种布局算法：

- **Dagre** - 层次化布局（适合流程图）
- **ELK** - 自适应布局（适合复杂图表）

### 6. 用户系统

- 用户注册/登录
- JWT 身份认证
- 图表云端保存
- 图表管理（查看、编辑、删除）
- 公开/私有图表设置

### 7. 导出功能

- 导出为 PNG 图片
- 导出为 SVG 矢量图
- 导出为 PDF 文档
- 复制 Mermaid 代码

---

## 🔧 配置说明

### 后端配置 (config.yaml)

```yaml
server:
  port: 8080
  
database:
  host: localhost
  port: 5432
  user: lawliet
  password: yourpassword
  dbname: chart_generator
  
jwt:
  secret: your-jwt-secret-key
  expiration: 168h  # 7天
  
minimax:
  api_key: your-minimax-api-key
  api_url: https://api.minimax.chat/v1/text/chatcompletion_v2
  model: abab6.5s-chat
```

### 前端配置 (.env)

```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 📡 API 接口

### 认证接口

```
POST   /api/auth/register    # 用户注册
POST   /api/auth/login       # 用户登录
GET    /api/auth/me          # 获取当前用户信息
```

### 图表接口

```
POST   /api/charts           # 创建图表
GET    /api/charts           # 获取用户图表列表
GET    /api/charts/:id       # 获取单个图表
PUT    /api/charts/:id       # 更新图表
DELETE /api/charts/:id       # 删除图表
POST   /api/charts/generate  # AI 生成图表
```

---

## 🎨 界面预览

### 代码编辑模式

左侧编辑器实时编写 Mermaid 代码，右侧实时预览渲染结果。

### AI 对话模式

全屏预览图表，底部对话框通过自然语言与 AI 交互修改图表。

### 主题切换

支持明暗主题切换，提供多种 Mermaid 内置主题。

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 开源协议

本项目采用 MIT 协议开源 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🙏 致谢

- [Mermaid.js](https://mermaid.js.org/) - 强大的图表渲染库
- [shadcn/ui](https://ui.shadcn.com/) - 精美的 React 组件库
- [CodeMirror](https://codemirror.net/) - 优秀的代码编辑器
- [Minimax](https://www.minimaxi.com/) - AI 模型支持

---

## 📮 联系方式

如有问题或建议，欢迎提交 Issue 或 Pull Request。

---

<div align="center">

**[⬆ 回到顶部](#geniusgen---ai-驱动的图表生成工具)**

Made with ❤️ by GeniusGen Team

</div>
