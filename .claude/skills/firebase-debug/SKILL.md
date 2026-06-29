---
name: firebase-debug
description: 调试 Firebase Firestore 实时同步问题
triggers:
  - firestore 问题
  - firebase 调试
  - 同步失败
---

# Firebase 调试工具

## 快速检查清单

### 1. 连接状态
```javascript
// 在浏览器控制台执行
import { getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// 测试读取
getDoc(doc(db, 'orders', 'TEST_ORDER')).then(console.log);
```

### 2. 实时订阅状态
- [ ] `onSnapshot` 返回 unsubscribe 函数
- [ ] 组件卸载时调用 unsubscribe
- [ ] 检查网络断连重连

### 3. 权限问题排查
```javascript
// Firestore Rules 测试
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isStaff() {
      return isAuthenticated() && request.auth.token.role == 'staff';
    }
    match /orders/{orderId} {
      allow read: if isAuthenticated();
      allow write: if isStaff();
    }
  }
}
```

### 4. 性能检查
- 避免全集合监听，按 `familyCode` 或 `orderNo` 过滤
- 分页：大集合使用 `query().limit()`