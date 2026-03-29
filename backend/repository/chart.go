package repository

import (
	"chart-generator/models"

	"gorm.io/gorm"
)

type ChartRepository struct {
	db *gorm.DB
}

func NewChartRepository(db *gorm.DB) *ChartRepository {
	return &ChartRepository{db: db}
}

func (r *ChartRepository) Create(chart *models.Chart) error {
	return r.db.Create(chart).Error
}

func (r *ChartRepository) FindByID(id string) (*models.Chart, error) {
	var chart models.Chart
	err := r.db.Where("id = ?", id).First(&chart).Error
	if err != nil {
		return nil, err
	}
	return &chart, nil
}

func (r *ChartRepository) FindByUserID(userID uint, page, pageSize int) ([]models.Chart, int64, error) {
	var charts []models.Chart
	var total int64

	query := r.db.Model(&models.Chart{}).Where("user_id = ?", userID)
	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&charts).Error
	return charts, total, err
}

func (r *ChartRepository) Update(chart *models.Chart) error {
	return r.db.Save(chart).Error
}

func (r *ChartRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Chart{}).Error
}

func (r *ChartRepository) FindPublicByID(id string) (*models.Chart, error) {
	var chart models.Chart
	err := r.db.Where("id = ? AND is_public = ?", id, true).First(&chart).Error
	if err != nil {
		return nil, err
	}
	return &chart, nil
}