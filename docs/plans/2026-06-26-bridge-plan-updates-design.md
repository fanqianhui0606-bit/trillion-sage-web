# Design Document: TrillionSage Consulting Service Platform Integration & Quiz Upgrades
**Date:** 2026-06-26  
**Status:** Approved (Approach 1: React + TS + Tailwind Refactoring)  
**Target Project Folder:** `trillion-sage-web/`  

---

## 1. 架构总览与本地代码源指引
本项目的目标是将千殊教育“桥梁计划”的**咨询服务流程跟进系统（flow-tracker）**完全使用 React + TypeScript + Tailwind CSS 进行重构并集成入官网 2.0，同时完成**数理素质测验的 API 总评集成**与**题量提示修正**。

> [!IMPORTANT]
> **本地开发代码源说明（无需访问 GitHub）：**
> 由于开发环境网络受限无法流畅访问 GitHub，重构所需的全部最新代码已拉取至本地：
> * **咨询流程跟进平台源代码**：位于本地 [temp-service-platform/](file:///c:/Users/11869/Desktop/文档/buss/temp-service-platform)
> * **数理测验最新版（含总评）代码**：位于本地 [_tmp_remote_quiz_repo/](file:///c:/Users/11869/Desktop/文档/buss/_tmp_remote_quiz_repo)
> 后续执行 AI 直接以这两个文件夹为基准进行重构即可，无需执行任何外部 git clone。

重构后的目录映射如下：
* **API 转发层**：
  * `[NEW]` [src/app/api/quiz-summary/route.ts](file:///c:/Users/11869/Desktop/文档/buss/trillion-sage-web/src/app/api/quiz-summary/route.ts) — 转发测评结构化数据至 DeepSeek，控制 Key 安全。
* **服务流程跟进页面（Flow Tracker）**：
  * `[NEW]` [src/app/tracker/page.tsx](file:///c:/Users/11869/Desktop/文档/buss/trillion-sage-web/src/app/tracker/page.tsx) — 服务流程平台主应用路由。
  * `[NEW]` [src/components/tracker/TrackerLogin.tsx](file:///c:/Users/11869/Desktop/文档/buss/trillion-sage-web/src/components/tracker/TrackerLogin.tsx) — 双端登录封面组件。
  * `[NEW]` [src/components/tracker/TrackerConsole.tsx](file:///c:/Users/11869/Desktop/文档/buss/trillion-sage-web/src/components/tracker/TrackerConsole.tsx) — 引导员控制台（创建订单、导入/导出数据库、保存昵称等）。
  * `[NEW]` [src/components/tracker/TrackerMain.tsx](file:///c:/Users/11869/Desktop/文档/buss/trillion-sage-web/src/components/tracker/TrackerMain.tsx) — 流程跟进主应用区（侧边栏、步骤管线、感谢烟花页）。
  * `[NEW]` [src/components/tracker/TrackerAgreementModal.tsx](file:///c:/Users/11869/Desktop/文档/buss/trillion-sage-web/src/components/tracker/TrackerAgreementModal.tsx) — 合同协议阅读门控弹窗。
  * `[NEW]` [src/lib/tracker-types.ts](file:///c:/Users/11869/Desktop/文档/buss/trillion-sage-web/src/lib/tracker-types.ts) — 流程相关的 TypeScript 接口定义。
  * `[NEW]` [src/lib/tracker-packages.ts](file:///c:/Users/11869/Desktop/文档/buss/trillion-sage-web/src/lib/tracker-packages.ts) — 套餐步骤、专业列表定义（移植自 `flow-packages.js`）。
  * `[NEW]` [src/lib/tracker-agreements.ts](file:///c:/Users/11869/Desktop/文档/buss/trillion-sage-web/src/lib/tracker-agreements.ts) — 合同条款模板元数据（移植自 `flow-agreements.js`）。
* **数理素质测验更新**：
  * `[MODIFY]` [src/components/quiz/QuizEngine.tsx](file:///c:/Users/11869/Desktop/文档/buss/trillion-sage-web/src/components/quiz/QuizEngine.tsx) — 修正思维习惯/能力自检题目数量提示。
  * `[MODIFY]` [src/components/quiz/QuizResult.tsx](file:///c:/Users/11869/Desktop/文档/buss/trillion-sage-web/src/components/quiz/QuizResult.tsx) — 集成“五、测验总评”卡片与 AI 请求状态渲染。
  * `[NEW]` [src/lib/quiz-summary.ts](file:///c:/Users/11869/Desktop/文档/buss/trillion-sage-web/src/lib/quiz-summary.ts) — 从原 `quiz-summary.js` 移植，包含结构化输入拼装与规则兜底逻辑。

---

## 2. 阿里云部署设计 (Aliyun Deployment Design)
项目并不部署在 Netlify，而是部署在**阿里云 ECS 服务器**。

### A. 运行模式与编译选项
* 采用 `next.config.mjs` 中配置的 `output: "standalone"` 独立打包机制。
* 独立编译会生成一个自带 Node Server 的独立包，这使得我们定义的 API 路由 `/api/quiz-summary` 可以完美且安全地在 Node.js 服务端后台运行，且不暴露 API Key。

### B. 部署流程与进程守护 (PM2 + Nginx)
1. **构建与测试**：在本地/服务器运行 `npm run build`，会在 `.next/` 下生成 `standalone` 相关产物。
2. **进程管理 (PM2)**：在服务器上启动 PM2 来守护 Node 服务进程，例如：
   ```bash
   # standalone 运行需要拷贝 static 和 public 到对应 standalone 目录下，由 PM2 守护启动：
   pm2 start .next/standalone/server.js --name "trillionsage-web"
   ```
3. **Nginx 反向代理与 SSL**：
   * Nginx 监听 80/443 端口，并将所有流量反向代理到本地 standalone 默认运行的 `3000` 端口。
   * 配置参考：
     ```nginx
     server {
         listen 443 ssl;
         server_name trillionsage.com; # 对应域名
         
         ssl_certificate /path/to/cert.pem;
         ssl_certificate_key /path/to/key.key;

         location / {
             proxy_pass http://127.0.0.1:3000;
             proxy_http_version 1.1;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection 'upgrade';
             proxy_set_header Host $host;
             proxy_cache_bypass $http_upgrade;
         }
     }
     ```

---

## 3. 数理素质测验与流程跟进平台重构细节

### A. 答题题量与文字提示修正
* **修正逻辑**：
  * **专业版（user）**：
    * 当 `objectiveTrack === 'habits'` 时，进度文案修改为 `— 思维习惯（15 题）`。
    * 当 `objectiveTrack === 'ability'` 时，进度文案修改为 `— 能力自检（21 题）`。
  * **体验版（simple）**：
    * 直接返回 `— 基础数理自测（17 题）`。

### B. 测验总评 API 转发与状态集成
1. 前端（`QuizResult.tsx`）构建 input，调用 POST `/api/quiz-summary`。
2. 后端读取 `DEEPSEEK_API_KEY`（在阿里云 `.env` 中配置）：
   * 优先调用 `deepseek-v4-pro`（超时 25s），失败降级调用 `deepseek-v4-flash`（超时 15s），均失败调用本地模板 `buildFallbackSummary(input)` 兜底。
3. 渲染 AI 生成的 Markdown 段落，并在 inspect 模式下展示双栏比对。

### C. 服务流程平台重构
* 使用 React 状态 + Tailwind 重构，保留 `bridge_flow_session_v1`, `bridge_flow_orders_v2` 等 LocalStorage 字段。
* 使用 `window.addEventListener("storage", ...)` 进行多标签多窗口状态实时点亮。
* 合同弹窗：满足“滚动到底部”且“5秒倒计时结束”后，方可点击“同意并继续”。
* PDF 导出：使用 React 渲染 A4 节点，配合 `html2canvas` 和 `jspdf` 实现多页 PDF 导出。
* 感谢页：展现千殊教育 Logo，并配合彩色 `.ty-spark` 烟花动画入场。

---

## 4. Loop 编程思维与开发验证流

执行 AI 必须摒弃“写一堆代码最后打包测试”的线性思维，采取 **Loop 自循环验证机制** 推进开发：

```
                    ┌─────────────────────────┐
                    │      定义局部小目标      │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      局部代码编写        │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   npm run lint/build    ├─ 编译不通过 ─┐
                    └────────────┬────────────┘              │
                                 │                           │
                              编译通过                       │
                                 ▼                           ▼
                    ┌─────────────────────────┐     ┌────────────────┐
                    │    Git Commit & Push    │     │ 寻找根本原因   │
                    └────────────┬────────────┘     │ 并局部修正     │
                                 │                  └────────▲───────┘
                                 ▼                           │
                    ┌─────────────────────────┐              │
                    │ 阿里云远程更新/手动验证 ├─ 业务校验失败 ─┘
                    └────────────┬────────────┘
                                 │
                            业务校验成功
                                 ▼
                            进入下一循环
```

* **每个 Loop 的边界与完成条件**：
  * **Loop 1：测验题量更正与本地验证**。完成条件：本地 `npm run build` 通过，进入页面显示正确的 15/21/17 题数。
  * **Loop 2：测验总评 API 转发与 Fallback 兜底**。完成条件：本地接口调通并返回，关闭 Key 时完美执行Fallback。
  * **Loop 3：服务平台跟进系统（Tracker）基础重构**。完成条件：双端登录、多标签 Storage 同步状态完美。
  * **Loop 4：服务平台合同门控与 A4 流程单 PDF 导出**。完成条件：5秒阅读滚动到底拦截正常，PDF 下载格式无中文乱码。
  * **Loop 5：阿里云集成与部署验证**。完成条件：PM2 服务守护启动成功，Nginx 代理流畅。
