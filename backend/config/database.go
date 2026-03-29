package config

import (
	"chart-generator/models"
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() error {
	var err error

	dsn := AppConfig.Database.DSN()
	log.Printf("Connecting to database with DSN: %s", dsn)
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		return fmt.Errorf("failed to connect database: %w", err)
	}

	// 自动迁移
	err = DB.AutoMigrate(&models.User{}, &models.Chart{})
	if err != nil {
		return fmt.Errorf("failed to migrate: %w", err)
	}

	log.Println("Database connected successfully")
	return nil
}
