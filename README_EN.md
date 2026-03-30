# GeniusGen - AI-Powered Chart Generator

<div align="center">

![GeniusGen Logo](https://img.shields.io/badge/GeniusGen-AI%20Chart%20Generator-orange?style=for-the-badge)

A modern online chart drawing tool with AI-powered Mermaid diagram generation

English | [简体中文](./README.md)

[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://golang.org/)
[![Mermaid](https://img.shields.io/badge/Mermaid-11.13-ff3670?logo=mermaid)](https://mermaid.js.org/)

</div>

---

## ✨ Features

- 🤖 **AI-Powered Generation** - Input natural language descriptions, AI automatically generates professional diagrams
- 📊 **Multiple Chart Types** - Support flowcharts, sequence diagrams, ER diagrams, class diagrams, state diagrams, Gantt charts, pie charts, and more
- 🎨 **Rich Themes** - Multiple built-in themes (Mermaid Chart, Neo, Dark, Forest, etc.)
- 🔄 **Real-time Preview** - Instant rendering as you edit, WYSIWYG
- 💬 **AI Chat Mode** - Modify diagrams through natural language conversation
- 🌓 **Dark Mode** - Support light/dark theme switching
- 💾 **Cloud Storage** - Save and manage charts after login
- 📤 **Multiple Export Formats** - Export to PNG, SVG, PDF
- 🎯 **Dual Layout Modes** - Switch freely between code editing mode and AI chat mode
- 📱 **Responsive Design** - Perfect adaptation for desktop and tablet devices

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Go 1.21+
- PostgreSQL 15+
- Docker & Docker Compose (Optional)

### Start with Docker Compose

```bash
# Clone the repository
git clone https://github.com/yourusername/GeniusGen.git
cd GeniusGen

# Start PostgreSQL database
docker-compose up -d

# Start backend service
cd backend
go mod download
go run main.go

# Start frontend service
cd ../frontend
npm install
npm run dev
```

### Manual Setup

#### 1. Start Database

```bash
# Using Docker
docker-compose up -d postgres

# Or manually install PostgreSQL and create database
createdb chart_generator
```

#### 2. Start Backend

```bash
cd backend

# Install dependencies
go mod download

# Configure environment variables (copy and modify config.yaml)
cp config.yaml.example config.yaml

# Run backend service
go run main.go
```

Backend service will start at `http://localhost:8080`

#### 3. Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend service will start at `http://localhost:5173`

#### 4. Start Website (Optional)

```bash
cd website

# Install dependencies
npm install

# Start development server
npm run dev
```

Website will start at `http://localhost:4321`

---

## 📁 Project Structure

```
GeniusGen/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Editor/      # Code editor components
│   │   │   ├── Preview/     # Chart preview components
│   │   │   ├── ChartType/   # Chart type selector
│   │   │   ├── Auth/        # Authentication components
│   │   │   ├── Settings/    # Settings components
│   │   │   └── ui/          # shadcn/ui base components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utility functions
│   │   ├── contexts/        # React contexts
│   │   └── types/           # TypeScript type definitions
│   └── package.json
│
├── backend/                  # Go backend service
│   ├── main.go              # Entry point
│   ├── config/              # Configuration management
│   ├── handlers/            # API handlers
│   ├── models/              # Data models
│   ├── repository/          # Database operations
│   ├── services/            # Business logic
│   ├── middleware/          # Middleware
│   └── go.mod
│
├── website/                  # Astro website
│   ├── src/
│   │   └── pages/           # Pages
│   └── package.json
│
├── docker-compose.yml        # Docker Compose configuration
└── SPEC.md                   # Project specification document
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI Framework |
| TypeScript | 5.3 | Type Safety |
| Vite | 5.1 | Build Tool |
| Tailwind CSS | 3.4 | Styling Framework |
| shadcn/ui | - | UI Component Library |
| Mermaid.js | 11.13 | Chart Rendering |
| CodeMirror | 6.0 | Code Editor |
| Zustand | 4.5 | State Management |
| React Router | 6.22 | Routing |
| Axios | 1.6 | HTTP Client |

### Backend

| Technology | Purpose |
|------------|---------|
| Go | 1.21+ | Backend Language |
| Gin | Web Framework |
| GORM | ORM Framework |
| PostgreSQL | Database |
| JWT | Authentication |
| Viper | Configuration Management |

### Website

| Technology | Version | Purpose |
|------------|---------|---------|
| Astro | 6.1 | Static Site Generator |
| React | 18.3 | UI Components |
| Tailwind CSS | 3.4 | Styling Framework |

---

## 🎯 Core Features

### 1. AI Smart Generation

Input natural language descriptions, AI automatically generates Mermaid diagram code:

```
User Input: Draw a user login flowchart
AI Output: Complete Mermaid flowchart code
```

### 2. Dual Editing Modes

- **Code Mode**: Left code editor + Right real-time preview
- **AI Mode**: Full-screen preview + Bottom AI chat panel

### 3. Chart Types

Support all Mermaid chart types:

- Flowchart
- Sequence Diagram
- Entity Relationship Diagram
- Class Diagram
- State Diagram
- Gantt Chart
- Pie Chart
- Git Graph
- User Journey

### 4. Theme Customization

Multiple built-in themes:

- Mermaid Chart
- Neo / Neo Dark
- Default
- Forest
- Base
- Dark
- Neutral

### 5. Layout Engines

Support two layout algorithms:

- **Dagre** - Hierarchical layout (suitable for flowcharts)
- **ELK** - Adaptive layout (suitable for complex diagrams)

### 6. User System

- User registration/login
- JWT authentication
- Cloud chart storage
- Chart management (view, edit, delete)
- Public/private chart settings

### 7. Export Features

- Export to PNG image
- Export to SVG vector
- Export to PDF document
- Copy Mermaid code

---

## 🔧 Configuration

### Backend Configuration (config.yaml)

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
  expiration: 168h  # 7 days
  
minimax:
  api_key: your-minimax-api-key
  api_url: https://api.minimax.chat/v1/text/chatcompletion_v2
  model: abab6.5s-chat
```

### Frontend Configuration (.env)

```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register    # User registration
POST   /api/auth/login       # User login
GET    /api/auth/me          # Get current user info
```

### Charts

```
POST   /api/charts           # Create chart
GET    /api/charts           # Get user chart list
GET    /api/charts/:id       # Get single chart
PUT    /api/charts/:id       # Update chart
DELETE /api/charts/:id       # Delete chart
POST   /api/charts/generate  # AI generate chart
```

---

## 🎨 UI Preview

### Code Editing Mode

Left editor for writing Mermaid code in real-time, right side for instant preview rendering.

### AI Chat Mode

Full-screen chart preview with bottom chat panel for natural language interaction with AI to modify diagrams.

### Theme Switching

Support light/dark theme switching with multiple Mermaid built-in themes.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Submit a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- [Mermaid.js](https://mermaid.js.org/) - Powerful diagram rendering library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful React component library
- [CodeMirror](https://codemirror.net/) - Excellent code editor
- [Minimax](https://www.minimaxi.com/) - AI model support

---

## 📮 Contact

If you have any questions or suggestions, feel free to submit an Issue or Pull Request.

---

<div align="center">

**[⬆ Back to Top](#geniusgen---ai-powered-chart-generator)**

Made with ❤️ by GeniusGen Team

</div>
