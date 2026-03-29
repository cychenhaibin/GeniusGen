package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Chart struct {
	ID        string         `gorm:"type:varchar(36);primaryKey" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Title     string         `gorm:"not null" json:"title"`
	Type      string         `gorm:"not null" json:"type"`
	Content   string         `gorm:"type:text;not null" json:"content"`
	UserID    uint           `gorm:"not null;index" json:"userId"`
	IsPublic  bool           `gorm:"default:false" json:"isPublic"`
}

func (Chart) TableName() string {
	return "charts"
}

func (c *Chart) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}