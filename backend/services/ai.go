package services

import (
	"bytes"
	"chart-generator/config"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type AIService struct {
	client *http.Client
}

func NewAIService() *AIService {
	return &AIService{
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type GenerateRequest struct {
	Prompt   string    `json:"prompt"`
	Type     string    `json:"type,omitempty"`
	AIConfig *AIConfig `json:"aiConfig,omitempty"`
}

type AIConfig struct {
	Provider string `json:"provider"`
	APIKey   string `json:"apiKey"`
	BaseURL  string `json:"baseURL"`
	Model    string `json:"model"`
}

type GenerateResponse struct {
	Mermaid string `json:"mermaid"`
	Type    string `json:"type"`
}

type MinimaxRequest struct {
	Model    string          `json:"model"`
	Messages []MinimaxMessage `json:"messages"`
}

type MinimaxMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type MinimaxResponse struct {
	Choices  []MinimaxChoice `json:"choices"`
	BaseResp MinimaxBaseResp `json:"base_resp"`
}

type MinimaxBaseResp struct {
	StatusCode int    `json:"status_code"`
	StatusMsg  string `json:"status_msg"`
}

type MinimaxChoice struct {
	Message MinimaxMessage `json:"message"`
}

const systemPrompt = `你是一个图表生成专家。根据用户的描述，生成对应的 Mermaid 语法图表。

支持的图表类型：
- flowchart: 流程图
- sequenceDiagram: 时序图
- erDiagram: ER图
- classDiagram: 类图
- stateDiagram-v2: 状态图
- gantt: 甘特图
- pie: 饼图

重要要求：
1. 只输出 Mermaid 代码，不要输出其他内容
2. 代码要符合 Mermaid 语法规范
3. 如果用户没有指定图表类型，根据描述自动判断
4. 代码要用 mermaid 代码块包裹
5. 对于 ER 图，实体名（Entity）和属性名必须全部使用英文，关系标签可以使用中文。所有标识符只能包含英文字母、数字和下划线，且必须以字母开头。例如：erDiagram Customer ||--o{ Order : "创建"\n   - 正确：Customer, Order, user_id, order_date\n   - 错误：用户, 订单, user_name(包含中文), 订单状态
6. flowchart 的节点文本可以使用中文，例如：flowchart TD\n    A[用户登录] --> B[验证密码]`

func (s *AIService) Generate(req GenerateRequest) (*GenerateResponse, error) {
	// 优先使用前端传递的配置,否则使用后端默认配置
	apiKey := config.AppConfig.Minimax.APIKey
	baseURL := config.AppConfig.Minimax.BaseURL
	model := config.AppConfig.Minimax.Model

	if req.AIConfig != nil {
		if req.AIConfig.APIKey != "" {
			apiKey = req.AIConfig.APIKey
		}
		if req.AIConfig.BaseURL != "" {
			baseURL = req.AIConfig.BaseURL
		}
		if req.AIConfig.Model != "" {
			model = req.AIConfig.Model
		}
	}

	if apiKey == "" {
		return nil, errors.New("请配置 API Key")
	}

	// 构建 prompt
	userPrompt := req.Prompt
	if req.Type != "" {
		userPrompt = fmt.Sprintf("请生成一个%s：%s", getChartTypeName(req.Type), req.Prompt)
	}

	minimaxReq := MinimaxRequest{
		Model:    model,
		Messages: []MinimaxMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt},
		},
	}

	// 重试机制
	var lastErr error
	for i := 0; i < 3; i++ {
		resp, err := s.callMinimaxWithConfig(minimaxReq, apiKey, baseURL)
		if err == nil {
			return resp, nil
		}
		lastErr = err
		time.Sleep(time.Duration(i+1) * time.Second)
	}

	return nil, fmt.Errorf("AI 生成失败: %w", lastErr)
}

func (s *AIService) callMinimax(req MinimaxRequest) (*GenerateResponse, error) {
	return s.callMinimaxWithConfig(req, config.AppConfig.Minimax.APIKey, config.AppConfig.Minimax.BaseURL)
}

func (s *AIService) callMinimaxWithConfig(req MinimaxRequest, apiKey, baseURL string) (*GenerateResponse, error) {
	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	httpReq, err := http.NewRequest(
		"POST",
		fmt.Sprintf("%s/text/chatcompletion_v2", baseURL),
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

	resp, err := s.client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("API 返回错误: %s", string(body))
	}

	var result MinimaxResponse
	err = json.Unmarshal(body, &result)
	if err != nil {
		return nil, err
	}

	if result.BaseResp.StatusCode != 0 {
		return nil, fmt.Errorf("Minimax API 错误 [%d]: %s", result.BaseResp.StatusCode, result.BaseResp.StatusMsg)
	}

	if len(result.Choices) == 0 {
		return nil, errors.New("AI 未返回有效结果")
	}

	content := result.Choices[0].Message.Content
	mermaid := extractMermaidCode(content)

	return &GenerateResponse{
		Mermaid: mermaid,
		Type:    detectChartType(mermaid),
	}, nil
}

func extractMermaidCode(content string) string {
	// 提取 mermaid 代码块
	// 支持 ```mermaid ... ``` 或 ``` ... ``` 格式
	if len(content) == 0 {
		return content
	}

	// 查找 ```mermaid 或 ``` 开始的位置
	start := 0
	for i := 0; i <= len(content)-10; i++ {
		if content[i] == '`' && i+2 < len(content) && content[i:i+3] == "```" {
			// 检查后面是否是 mermaid 或空
			remaining := content[i+3:]
			trimmed := strings.TrimPrefix(remaining, "mermaid")
			if trimmed != remaining || len(remaining) == 0 || remaining[0] == '\n' || remaining[0] == '`' {
				start = i + 3
				if strings.HasPrefix(remaining, "mermaid") {
					start = i + 10 // ```mermaid
				}
				// 找到第一个换行
				for start < len(content) && content[start] == '\n' {
					start++
				}
				break
			}
		}
	}

	// 查找结束的 ```
	end := len(content)
	for i := len(content) - 1; i >= 3; i-- {
		if content[i] == '`' && content[i-1] == '`' && content[i-2] == '`' {
			end = i - 2
			break
		}
	}

	if start < end {
		result := strings.TrimSpace(content[start:end])
		// 移除可能的 language 标识
		if idx := strings.Index(result, "\n```"); idx > 0 {
			result = result[:idx]
		}
		return result
	}

	return strings.TrimSpace(content)
}

func detectChartType(code string) string {
	if bytes.Contains([]byte(code), []byte("flowchart")) {
		return "flowchart"
	}
	if bytes.Contains([]byte(code), []byte("sequenceDiagram")) {
		return "sequence"
	}
	if bytes.Contains([]byte(code), []byte("erDiagram")) {
		return "er"
	}
	if bytes.Contains([]byte(code), []byte("classDiagram")) {
		return "class"
	}
	if bytes.Contains([]byte(code), []byte("gantt")) {
		return "gantt"
	}
	if bytes.Contains([]byte(code), []byte("pie")) {
		return "pie"
	}
	return "flowchart"
}

func getChartTypeName(t string) string {
	switch t {
	case "flowchart":
		return "流程图"
	case "sequence":
		return "时序图"
	case "er":
		return "ER图"
	case "class":
		return "类图"
	case "state":
		return "状态图"
	case "gantt":
		return "甘特图"
	case "pie":
		return "饼图"
	default:
		return "图表"
	}
}
