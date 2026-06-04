# 千殊教育 · 桥梁计划

数理素质测评与学术规划平台。14 项素质维度 × 科学计分模型 × 3D 可视化 × 专业推荐。

## 技术栈

Next.js 14 + TypeScript + Tailwind CSS + React Three Fiber

## 开发

```bash
npm install
npm run dev        # http://localhost:3000
```

## 构建 & 部署

```bash
npm run build      # 静态导出到 out/
npx netlify-cli deploy --dir=out --prod
```

## 页面

| 路径 | 内容 |
|---|---|
| `/` | 首页（Hero+3D → Values → 测评入口 → 团队 → CTA） |
| `/quiz` | 数理素质测评（35 题 → 结果 + 3D 图景 + Top5 专业推荐） |
| `/programs` | 数理学术衔接营 |
| `/team` | 硕博团队 |
| `/cooperation` | 合作方式 |
| `/contact` | 联系我们 + 营业执照 |
