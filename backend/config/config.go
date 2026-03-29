package config

import (
	"fmt"
	"os"

	"github.com/spf13/viper"
	"github.com/subosito/gotenv"
)

type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
	JWT      JWTConfig      `mapstructure:"jwt"`
	Minimax  MinimaxConfig  `mapstructure:"minimax"`
}

type ServerConfig struct {
	Port string `mapstructure:"port"`
	Mode string `mapstructure:"mode"`
}

type DatabaseConfig struct {
	Host     string `mapstructure:"host"`
	Port     string `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	DBName   string `mapstructure:"dbname"`
	SSLMode  string `mapstructure:"sslmode"`
}

type JWTConfig struct {
	Secret     string `mapstructure:"secret"`
	ExpireHour int    `mapstructure:"expire_hour"`
}

type MinimaxConfig struct {
	APIKey  string `mapstructure:"api_key"`
	BaseURL string `mapstructure:"base_url"`
	Model   string `mapstructure:"model"`
	GroupID string `mapstructure:"group_id"`
}

func (d *DatabaseConfig) DSN() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		d.User, d.Password, d.Host, d.Port, d.DBName, d.SSLMode,
	)
}

var AppConfig *Config

func Init() error {
	// 自动加载 .env 文件
	gotenv.Load("../.env")

	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	// 添加多个路径搜索
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	viper.AddConfigPath("../")  // 项目根目录
	viper.AddConfigPath("../config")

	viper.SetDefault("server.port", "8080")
	viper.SetDefault("server.mode", "debug")
	viper.SetDefault("jwt.expire_hour", 168)
	viper.SetDefault("minimax.base_url", "https://api.minimax.chat/v1")
	viper.SetDefault("minimax.model", "abab6.5s-chat")

	// 从环境变量读取敏感配置
	if v := os.Getenv("DB_HOST"); v != "" {
		viper.Set("database.host", v)
	}
	if v := os.Getenv("DB_PORT"); v != "" {
		viper.Set("database.port", v)
	}
	if v := os.Getenv("DB_USER"); v != "" {
		viper.Set("database.user", v)
	}
	if v := os.Getenv("DB_PASSWORD"); v != "" {
		viper.Set("database.password", v)
	}
	if v := os.Getenv("DB_NAME"); v != "" {
		viper.Set("database.dbname", v)
	}
	if v := os.Getenv("JWT_SECRET"); v != "" {
		viper.Set("jwt.secret", v)
	}
	if v := os.Getenv("MINIMAX_API_KEY"); v != "" {
		viper.Set("minimax.api_key", v)
	}
	if v := os.Getenv("MINIMAX_GROUP_ID"); v != "" {
		viper.Set("minimax.group_id", v)
	}

	if err := viper.ReadInConfig(); err != nil {
		return fmt.Errorf("failed to read config: %w", err)
	}

	// 打印调试信息
	fmt.Printf("Config loaded: DB Host=%s, DB User=%s, DB Name=%s\n",
		viper.GetString("database.host"),
		viper.GetString("database.user"),
		viper.GetString("database.dbname"))

	AppConfig = &Config{}
	if err := viper.Unmarshal(AppConfig); err != nil {
		return fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return nil
}
