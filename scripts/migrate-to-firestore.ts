/**
 * scripts/migrate-to-firestore.ts
 * 将 localStorage 中的订单数据迁移到 Firestore
 *
 * 使用方式：
 * npx tsx scripts/migrate-to-firestore.ts
 *
 * 注意事项：
 * - 需要先配置 .env.local（或 .env.production）
 * - 会读取所有 localStorage 中的订单并上传到 Firestore
 * - 完成后不会删除 localStorage 数据，需要手动清理
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 验证配置
function validateConfig() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v || v.includes("your_"))
    .map(([k]) => k);

  if (missing.length > 0) {
    console.error(`❌ 缺少 Firebase 配置: ${missing.join(", ")}`);
    console.error("请在 .env.local 中配置这些变量");
    process.exit(1);
  }
}

// 从文件模拟 localStorage（用于 CLI 环境）
function getLocalStorageData(): Record<string, unknown>[] {
  const dataDir = path.join(process.cwd(), "localStorage-backup");

  if (!fs.existsSync(dataDir)) {
    console.error(`❌ 找不到 localStorage 备份目录: ${dataDir}`);
    console.error("请先运行浏览器控制台导出命令:");
    console.error(`
      const data = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('bridge_flow_tracker_v2::')) {
          data.push({ key, value: localStorage.getItem(key) });
        }
      }
      console.log(JSON.stringify(data));
    `);
    process.exit(1);
  }

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".json"));
  const orders = files.map(f => {
    const content = fs.readFileSync(path.join(dataDir, f), "utf-8");
    return JSON.parse(content);
  });

  return orders;
}

async function migrate() {
  console.log("🚀 开始迁移 localStorage 数据到 Firestore...\n");

  // 1. 验证配置
  validateConfig();

  // 2. 初始化 Firebase
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const db = getFirestore(app);

  // 3. 获取数据
  console.log("📂 读取 localStorage 备份数据...");
  const orders = getLocalStorageData();
  console.log(`   找到 ${orders.length} 个订单\n`);

  // 4. 迁移每个订单
  let success = 0;
  let failed = 0;

  for (const order of orders) {
    try {
      const orderRef = doc(db, "orders", order.orderNo);
      await setDoc(orderRef, {
        ...order,
        updatedAt: serverTimestamp(),
        migratedAt: Timestamp.now(),
        migratedFrom: "localStorage",
      }, { merge: true });

      success++;
      console.log(`   ✅ ${order.orderNo} - ${order.visitor?.name || "未知"}`);
    } catch (error) {
      failed++;
      console.error(`   ❌ ${order.orderNo}: ${(error as Error).message}`);
    }
  }

  // 5. 总结
  console.log(`\n📊 迁移完成: ${success} 成功, ${failed} 失败`);

  if (success > 0) {
    console.log("\n💡 后续步骤:");
    console.log("   1. 更新 TrackerMain.tsx 使用 fireorm.ts 替代 localStorage");
    console.log("   2. 在 Firebase Console 部署 firestore.rules 安全规则");
    console.log("   3. 测试实时同步功能");
    console.log("   4. 确认无误后清除 localStorage 数据");
  }
}

migrate().catch(console.error);