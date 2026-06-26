# trillion-sage-web — 千殊教育官网

## Tech Stack
- Next.js 14.2 App Router + TypeScript
- React 18（R3F v8 兼容性要求，不能升 React 19）
- Tailwind CSS 3（严格，不写自定义 CSS）
- React Three Fiber 8 + @react-three/drei 9 + three 0.184
- Next.js output: `"standalone"`（支持 API 路由的服务端运行）

## 路由

| 路径 | 文件 | 说明 |
|---|---|---|
| `/` | `src/app/page.tsx` | 首页 5 屏（Hero+3D → Values → QuizTeaser → TeamPreview → CTA） |
| `/quiz` | `src/app/quiz/page.tsx` | 数理测评（42题→14维计分→AI总评+结果页） |
| `/burrow` | `src/app/burrow/page.tsx` | 发掘你的光 — 独立思维共振空间 (深夜微光烛火风格) |
| `/programs` | `src/app/programs/page.tsx` | 学术衔接营 |
| `/team` | `src/app/team/page.tsx` | 硕博团队与 1v1 预约（院校+方向+LaTeX学术寄语，带高保真预约表单） |
| `/cooperation` | `src/app/cooperation/page.tsx` | 合作方式 |
| `/contact` | `src/app/contact/page.tsx` | 联系我们 + 营业执照放大层 |
| `/tracker` | `src/app/tracker/page.tsx` | 服务流程跟进平台（家庭客户/团队成员双入口） |

## 目录约定

```
src/app/             页面路由
src/app/api/         API 路由（如 /api/quiz-summary）
src/components/
  layout/            Navbar, Footer
  home/              HeroSection, ValuesSection, QuizTeaserSection, TeamPreviewSection, CTASection
  quiz/              QuizEngine, QuizResult, ScoreBarChart
  charts/            Competency3D（R3F 3D 素质图景）
  shared/            GlassCard, SectionTitle, Button, LicenseCard
  tracker/           TrackerLogin, TrackerMain, TrackerConsole, TrackerAgreementModal
src/lib/
  quiz-scoring.ts    计分核心逻辑
  quiz-summary.ts    AI 总评（DeepSeek Pro/Flash/fallback）
  tracker-types.ts   服务流程类型定义
  tracker-packages.ts 套餐与步骤管线定义
  tracker-agreements.ts 合同模板与编码生成
src/hooks/           useQuizState
public/data/         JSON 数据文件（题库、配置、graph、专业介绍等）
public/images/       营业执照、二维码
```

## 核心规则

- **Tailwind only**：不写自定义 CSS。globals.css 仅保留 @tailwind 指令 + .glass-panel + .bridge-watermark
- **3D 组件**：必须 `'use client'`，必须 `dynamic(() => import(...), { ssr: false })`，useEffect cleanup 中 dispose WebGL 资源
- **去人名化**：团队页面不出现具体姓名，联系页面可以出现主理人姓名（不提学校）
- **每改必验**：`npm run lint` 零错误零警告
- **Git push 需确认**：禁止自行 push，必须先告知用户

## Design Tokens

- bridge-blue: #2E75B6 / bridge-gold: #C5A059
- bridge-gradient-top: #A5A8C7 / bridge-gradient-bottom: #EBEBEF
- bridge-panel: rgba(255,255,255,0.3)
- bridge-3d-bg: #0A0F18
- 字体：Songti SC / SimSun / Noto Serif SC（宋体优先）

## 命令

```bash
npm run dev         # 开发（默认 localhost:3000）
npm run build       # 生产构建（standalone 模式）
npm run lint        # ESLint
npx pm2 start .next/standalone/server.js --name "trillionsage-web"  # 生产启动
```

## 部署（阿里云 ECS）

详见 `docs/deploy-aliyun.md`

### 核心流程
```bash
# 1. 构建
npm run build

# 2. 上传到服务器后，PM2 启动
pm2 start .next/standalone/server.js --name "trillionsage-web"

# 3. Nginx 反向代理 80/443 → 3000
# 详见 docs/deploy-aliyun.md
```

### 环境变量
生产环境需设置（在服务器 `.env.production`）：
```
DEEPSEEK_API_KEY=your_key_here   # AI 总评功能
```

当前线上：https://eclectic-marigold-ab2d02.netlify.app（Netlify 预览）
目标部署：阿里云 ECS（见 docs/deploy-aliyun.md）