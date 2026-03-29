package main

import (
	"chart-generator/config"
	"chart-generator/handlers"
	"chart-generator/middleware"
	"chart-generator/repository"
	"chart-generator/services"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化配置
	if err := config.Init(); err != nil {
		log.Fatalf("Failed to init config: %v", err)
	}

	// 初始化数据库
	if err := config.InitDB(); err != nil {
		log.Fatalf("Failed to init database: %v", err)
	}

	// 初始化仓储
	userRepo := repository.NewUserRepository(config.DB)
	chartRepo := repository.NewChartRepository(config.DB)

	// 初始化服务
	authService := services.NewAuthService(userRepo)
	aiService := services.NewAIService()
	chartService := services.NewChartService(chartRepo, aiService)

	// 初始化处理器
	authHandler := handlers.NewAuthHandler(authService)
	chartHandler := handlers.NewChartHandler(chartService)

	// 初始化 Gin
	r := gin.Default()

	// CORS 中间件
	r.Use(middleware.CORS())

	// 路由
	api := r.Group("/api")
	{
		// 认证路由 (公开)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// 需要认证的路由
		needAuth := api.Group("")
		needAuth.Use(middleware.AuthMiddleware())
		{
			// 用户
			needAuth.GET("/auth/me", authHandler.Me)

			// 图表 CRUD
			charts := needAuth.Group("/charts")
			{
				charts.GET("", chartHandler.List)
				charts.POST("", chartHandler.Create)
				charts.GET("/:id", chartHandler.Get)
				charts.PUT("/:id", chartHandler.Update)
				charts.DELETE("/:id", chartHandler.Delete)
			}

			// AI 生成
			needAuth.POST("/chart/generate", chartHandler.Generate)
		}

		// 公开访问
		api.GET("/charts/public/:id", chartHandler.GetPublic)
	}

	// 启动服务器
	port := config.AppConfig.Server.Port
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
