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
| `/` | 首页（Hero+3D → Values → 三卡片入口[测评+灵魂聊天+一对一咨询] → 团队预览 → CTA） |
| `/quiz` | 数理素质测评（35 题 → 结果 + 3D 图景 + Top5 专业推荐） |
| `/burrow` | 发掘你的光 — 独立思维共振空间 (深夜微光烛火风格) |
| `/programs` | 数理学术衔接营与服务流程时间轴（支持查看交付细节） |
| `/team` | 硕博导师阵营与 1v1 预约（带 Canvas 思维干涉波形模拟金砂凭证） |
| `/cooperation` | 合作方式 |
| `/contact` | 联系我们 + 二维码 + 营业执照放大层 |

