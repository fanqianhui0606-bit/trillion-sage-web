#!/usr/bin/env node

/**
 * 激活码批量离线生成工具
 * 使用方式：
 *   node scripts/generate_codes.mjs <数量>
 * 示例：
 *   node scripts/generate_codes.mjs 10
 */

import { randomInt } from "crypto";

function generateCode() {
  // 1. 生成 4 位随机序列号
  const seq = randomInt(1000, 9999).toString();
  
  // 2. 计算校验和
  const content = "TSG" + seq;
  let sum = 0;
  for (let i = 0; i < content.length; i++) {
    sum += content.charCodeAt(i) * (i + 1);
  }
  
  // 3. 模 100000 补足 5 位
  const checksum = (sum % 100000).toString().padStart(5, "0");
  
  return `TSG${seq}${checksum}`;
}

const count = parseInt(process.argv[2], 10) || 5;

console.log(`\n===============================================`);
console.log(`  千殊教育 · 桥梁计划 · 批量激活码生成器 (专业版)`);
console.log(`===============================================`);
console.log(`正在生成 ${count} 个激活码，前置公式为：字符ASCII * 位置权重的累加模和\n`);

const codes = [];
for (let i = 0; i < count; i++) {
  codes.push(generateCode());
}

codes.forEach((code, idx) => {
  console.log(`[${(idx + 1).toString().padStart(2, "0")}]  ${code}`);
});

console.log(`\n说明：请妥善复制并分发给付费用户。`);
console.log(`===============================================\n`);
