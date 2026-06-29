---
name: tracker-firebase
description: 追踪 Tracker 表单完整性与 Firebase Firestore 同步状态
triggers:
  - tracker
  - 服务流程
  - firestore
  - firebase
---

# Tracker Firebase 工具

检查 Tracker 与 Firebase 集成的完整性。

## 数据结构验证

检查 `src/lib/firestore-db.ts` 是否包含：
- [ ] `orders` 集合的 CRUD 操作
- [ ] 实时订阅 (`onSnapshot`)
- [ ] 角色权限过滤
- [ ] 家庭码/订单号索引

## 实时同步测试

1. 在两个浏览器窗口打开同一订单
2. 家庭端修改字段，验证团队端实时更新
3. 检查 Safari 延迟（已知 1s 防抖）

## PDF 导出条件

触发条件（按顺序）：
1. 所有 Phase A 步骤已完成
2. 所有 Phase B 步骤（根据套餐）已完成
3. Phase C 双方确认签名

## 常见问题

| 问题 | 检查点 |
|------|--------|
| 数据未保存 | Firestore 安全规则是否允许写入 |
| 实时更新延迟 | Safari 跨标签页需刷新 |
| 权限错误 | `request.auth.token.role` 是否正确设置 |