FROM golang:1.21-alpine AS builder

WORKDIR /app

# 安装 build 依赖
RUN apk add --no-cache gcc musl-dev

# 复制 go mod 文件
COPY go.mod go.sum ./
RUN go mod download

# 复制源码
COPY . .

# 构建
RUN CGO_ENABLED=1 GOOS=linux go build -o server .

# 运行镜像
FROM alpine:latest

WORKDIR /app

# 安装运行时依赖
RUN apk add --no-cache ca-certificates tzdata

# 复制构建产物
COPY --from=builder /app/server .
COPY --from=builder /app/config.yaml .

EXPOSE 8080

CMD ["./server"]
