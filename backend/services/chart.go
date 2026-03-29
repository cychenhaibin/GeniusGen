package services

import (
	"chart-generator/models"
	"chart-generator/repository"
	"errors"
)

type ChartService struct {
	chartRepo *repository.ChartRepository
	aiService *AIService
}

func NewChartService(chartRepo *repository.ChartRepository, aiService *AIService) *ChartService {
	return &ChartService{
		chartRepo: chartRepo,
		aiService: aiService,
	}
}

type CreateChartInput struct {
	Title    string `json:"title" binding:"required"`
	Type     string `json:"type"`
	Content  string `json:"content" binding:"required"`
	IsPublic bool   `json:"isPublic"`
}

type UpdateChartInput struct {
	Title    string `json:"title"`
	Type     string `json:"type"`
	Content  string `json:"content"`
	IsPublic *bool  `json:"isPublic"`
}

type GenerateAndSaveInput struct {
	Prompt string `json:"prompt" binding:"required"`
	Title  string `json:"title" binding:"required"`
	Type   string `json:"type"`
}

func (s *ChartService) Create(userID uint, input CreateChartInput) (*models.Chart, error) {
	chart := &models.Chart{
		Title:    input.Title,
		Type:     input.Type,
		Content:  input.Content,
		UserID:   userID,
		IsPublic: input.IsPublic,
	}

	if chart.Type == "" {
		chart.Type = "flowchart"
	}

	err := s.chartRepo.Create(chart)
	if err != nil {
		return nil, err
	}

	return chart, nil
}

func (s *ChartService) GetByID(id string, userID uint) (*models.Chart, error) {
	chart, err := s.chartRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if chart.UserID != userID && !chart.IsPublic {
		return nil, errors.New("无权访问此图表")
	}

	return chart, nil
}

func (s *ChartService) GetByUserID(userID uint, page, pageSize int) ([]models.Chart, int64, error) {
	return s.chartRepo.FindByUserID(userID, page, pageSize)
}

func (s *ChartService) Generate(prompt string, chartType string) (*GenerateResponse, error) {
	return s.aiService.Generate(GenerateRequest{Prompt: prompt, Type: chartType})
}

func (s *ChartService) Update(id string, userID uint, input UpdateChartInput) (*models.Chart, error) {
	chart, err := s.chartRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if chart.UserID != userID {
		return nil, errors.New("无权修改此图表")
	}

	if input.Title != "" {
		chart.Title = input.Title
	}
	if input.Type != "" {
		chart.Type = input.Type
	}
	if input.Content != "" {
		chart.Content = input.Content
	}
	if input.IsPublic != nil {
		chart.IsPublic = *input.IsPublic
	}

	err = s.chartRepo.Update(chart)
	if err != nil {
		return nil, err
	}

	return chart, nil
}

func (s *ChartService) Delete(id string, userID uint) error {
	chart, err := s.chartRepo.FindByID(id)
	if err != nil {
		return err
	}

	if chart.UserID != userID {
		return errors.New("无权删除此图表")
	}

	return s.chartRepo.Delete(id)
}

func (s *ChartService) GenerateAndSave(userID uint, input GenerateAndSaveInput) (*models.Chart, error) {
	aiResp, err := s.aiService.Generate(GenerateRequest{
		Prompt: input.Prompt,
		Type:   input.Type,
	})
	if err != nil {
		return nil, err
	}

	chart := &models.Chart{
		Title:    input.Title,
		Type:     aiResp.Type,
		Content:  aiResp.Mermaid,
		UserID:   userID,
		IsPublic: false,
	}

	err = s.chartRepo.Create(chart)
	if err != nil {
		return nil, err
	}

	return chart, nil
}

func (s *ChartService) GetPublicByID(id string) (*models.Chart, error) {
	return s.chartRepo.FindPublicByID(id)
}