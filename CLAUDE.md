# trillion-sage-web — 千殊教育官网

## Tech Stack
- Next.js 14.2 App Router + TypeScript
- React 18（R3F v8 兼容性要求，不能升 React 19）
- Tailwind CSS 3（严格，不写自定义 CSS）
- React Three Fiber 8 + @react-three/drei 9 + three 0.184

## 路由

| 路径 | 文件 | 说明 |
|---|---|---|
| `/` | `src/app/page.tsx` | 首页 5 屏（Hero+3D → Values → QuizTeaser → TeamPreview → CTA） |
| `/quiz` | `src/app/quiz/page.tsx` | 数理测评（35 题 → 14 维计分 → 结果页） |
| `/programs` | `src/app/programs/page.tsx` | 学术衔接营 |
| `/team` | `src/app/team/page.tsx` | 硕博团队（院校+状态+方向，不列姓名） |
| `/cooperation` | `src/app/cooperation/page.tsx` | 合作方式 |
| `/contact` | `src/app/contact/page.tsx` | 联系主理人 + 公司信息 + 营业执照 |

## 目录约定

```
src/app/         页面路由
src/components/
  layout/        Navbar, Footer
  home/          HeroSection, ValuesSection, QuizTeaserSection, TeamPreviewSection, CTASection
  quiz/          QuizEngine, QuizResult, ScoreBarChart
  charts/        Competency3D（R3F 3D 素质图景）
  shared/        GlassCard, SectionTitle, Button, LicenseCard
src/lib/         纯函数（quiz-scoring, cosine-similarity, value-orientation, types, constants）
src/hooks/       useQuizState
public/data/     JSON 数据文件（题库、配置、graph、专业介绍等）
public/images/   营业执照、二维码
```

## 核心规则

- **Tailwind only**：不写自定义 CSS。globals.css 仅保留 @tailwind 指令 + .glass-panel + .bridge-watermark
- **3D 组件**：必须 `'use client'`，必须 `dynamic(() => import(...), { ssr: false })`，useEffect cleanup 中 dispose WebGL 资源
- **去人名化**：团队页面不出现具体姓名，联系页面可以出现主理人姓名（不提学校）
- **每改必验**：`npm run build` + `npm run lint` 零错误零警告

## Design Tokens

- bridge-blue: #2E75B6 / bridge-gold: #C5A059
- bridge-gradient-top: #A5A8C7 / bridge-gradient-bottom: #EBEBEF
- bridge-panel: rgba(255,255,255,0.3)
- 字体：Songti SC / SimSun / Noto Serif SC（宋体优先）

## 命令

```bash
npm run dev         # 开发（默认 localhost:3000）
npm run build       # 生产构建 + 静态导出到 out/
npm run lint        # ESLint
npm start           # 生产服务器
```

## 部署

静态导出到 `out/` 文件夹，部署到 Netlify：
```bash
npm run build
npx netlify-cli deploy --dir=out --prod
```
当前线上：https://eclectic-marigold-ab2d02.netlify.app
