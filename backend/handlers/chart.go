package handlers

import (
	"net/http"

	"chart-generator/middleware"
	"chart-generator/services"

	"github.com/gin-gonic/gin"
)

type ChartHandler struct {
	chartService *services.ChartService
}

func NewChartHandler(chartService *services.ChartService) *ChartHandler {
	return &ChartHandler{chartService: chartService}
}

type GenerateInput struct {
	Prompt string `json:"prompt" binding:"required"`
	Type   string `json:"type"`
}

// Generate AI 生成图表
func (h *ChartHandler) Generate(c *gin.Context) {
	var input GenerateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	resp, err := h.chartService.Generate(input.Prompt, input.Type)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"msg":  "success",
		"data": resp,
	})
}

// List 获取用户图表列表
func (h *ChartHandler) List(c *gin.Context) {
	userID := middleware.GetUserID(c)

	page := 1
	pageSize := 10

	if p := c.DefaultQuery("page", "1"); p != "" {
		if n, err := parsePositiveInt(p); err == nil {
			page = n
		}
	}
	if ps := c.DefaultQuery("pageSize", "10"); ps != "" {
		if n, err := parsePositiveInt(ps); err == nil && n <= 50 {
			pageSize = n
		}
	}

	charts, total, err := h.chartService.GetByUserID(userID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"msg":  "success",
		"data": gin.H{
			"list":  charts,
			"total": total,
			"page":  page,
		},
	})
}

// Create 创建图表
func (h *ChartHandler) Create(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var input services.CreateChartInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	chart, err := h.chartService.Create(userID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"msg":  "success",
		"data": chart,
	})
}

// Get 获取单个图表
func (h *ChartHandler) Get(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	chart, err := h.chartService.GetByID(id, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"msg":  "success",
		"data": chart,
	})
}

// Update 更新图表
func (h *ChartHandler) Update(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	var input services.UpdateChartInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code": 400,
			"msg":  "参数错误: " + err.Error(),
		})
		return
	}

	chart, err := h.chartService.Update(id, userID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"msg":  "success",
		"data": chart,
	})
}

// Delete 删除图表
func (h *ChartHandler) Delete(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	err := h.chartService.Delete(id, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code": 500,
			"msg":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"msg":  "success",
	})
}

// GetPublic 公开访问图表
func (h *ChartHandler) GetPublic(c *gin.Context) {
	id := c.Param("id")

	chart, err := h.chartService.GetPublicByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code": 404,
			"msg":  "图表不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"msg":  "success",
		"data": chart,
	})
}

func parsePositiveInt(s string) (int, error) {
	var n int
	_, err := parseStrToInt(s, &n)
	return n, err
}

func parseStrToInt(s string, n *int) (bool, error) {
	for _, c := range s {
		if c < '0' || c > '9' {
			*n = 0
			return false, nil
		}
		*n = *n*10 + int(c-'0')
	}
	return true, nil
}