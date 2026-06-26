# 阿里云 ECS 部署指南

本项目使用 Next.js 14 **standalone** 模式构建，适合部署到阿里云 ECS（PM2 + Nginx）。

---

## 一、服务器准备

### 1.1 环境要求
- Node.js ≥ 18（推荐 20 LTS）
- PM2（进程管理）
- Nginx（反向代理 + SSL）
- Git（拉取代码）

### 1.2 安装依赖
```bash
# 安装 Node.js（如果尚未安装）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 安装 Nginx
sudo apt-get install -y nginx

# 验证版本
node --version   # v20.x.x
pm2 --version
nginx -v
```

---

## 二、部署步骤

### 2.1 在本地构建
```bash
cd trillion-sage-web
npm run build
```
构建产物在 `.next/standalone/` 目录（包含 `server.js`）。

### 2.2 上传到服务器
```bash
# 方式一：通过 git（推荐）
# 在 GitHub 创建空仓库后：
git remote add origin https://github.com/fanqianhui0606-bit/trillion-sage-web.git
git push origin main

# 在服务器上克隆
git clone https://github.com/fanqianhui0606-bit/trillion-sage-web.git
cd trillion-sage-web
npm install

# 方式二：rsync 上传（适合内网）
rsync -avz --exclude='node_modules' --exclude='.next' ./ user@your-server:/path/to/trillion-sage-web/
```

### 2.3 配置环境变量
```bash
# 在项目根目录创建 .env.production
nano .env.production
```
```env
# DeepSeek API（AI 总评功能）
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 2.4 构建并启动
```bash
npm run build

# 使用 PM2 启动（监听端口 3000）
pm2 start .next/standalone/server.js --name "trillionsage-web" --env production

# 保存 PM2 进程列表（重启后自动恢复）
pm2 save

# 设置开机自启
pm2 startup
```

### 2.5 Nginx 反向代理
```bash
sudo nano /etc/nginx/sites-available/trillionsage
```
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    # HTTP → HTTPS 重定向（已有 SSL 证书时）
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/trillionsage /etc/nginx/sites-enabled/
sudo nginx -t         # 测试配置
sudo systemctl reload nginx
```

### 2.6 SSL 证书（Let's Encrypt 免费）
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
# 按提示完成验证，证书自动续期
```

---

## 三、日常运维

### 3.1 常用命令
```bash
# 重启服务
pm2 restart trillionsage-web

# 查看日志
pm2 logs trillionsage-web

# 零停机更新
git pull && npm install && npm run build && pm2 restart trillionsage-web

# 监控
pm2 monit
```

### 3.2 更新流程（CI/CD 推荐）
在 GitHub Actions 中配置：
```yaml
# .github/workflows/deploy.yml
name: Deploy to Aliyun

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci && npm run build
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.ALIYUN_HOST }}
          username: ${{ secrets.ALIYUN_USER }}
          key: ${{ secrets.ALIYUN_SSH_KEY }}
          script: |
            cd /path/to/trillion-sage-web
            git pull
            npm install
            npm run build
            pm2 restart trillionsage-web
```

### 3.3 回滚
```bash
pm2 history trillionsage-web  # 查看历史
pm2 restart trillionsage-web  # 重启使用最新代码
# 如需回退到特定 commit：
git checkout <commit-hash> && npm run build && pm2 restart trillionsage-web
```

---

## 四、目录结构（生产环境）
```
/path/to/trillion-sage-web/
├── .next/
│   └── standalone/         # npm run build 生成
│       └── server.js       # PM2 启动入口
├── public/                  # 静态资源
├── .env.production          # 环境变量（勿上传 GitHub）
└── ecosystem.config.js      # PM2 配置文件（可选）
```

### ecosystem.config.js（可选，便于管理）
```js
module.exports = {
  apps: [{
    name: 'trillionsage-web',
    script: '.next/standalone/server.js',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
```
使用时：`pm2 start ecosystem.config.js --env production`

---

## 五、验证部署
```bash
# 本地测试 API 代理
curl http://localhost:3000/api/quiz-summary \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"studentName":"测试"}'

# 检查 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```