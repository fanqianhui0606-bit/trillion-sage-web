import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function copyJxzk() {
  const dist = path.join(root, "node_modules/@chinese-fonts/jxzk/dist");
  const dir = fs.readdirSync(dist).find((x) => x !== "index.json");
  if (!dir) throw new Error("jxzk dist folder missing");
  const cssPath = path.join(dist, dir, "result.css");
  const css = fs.readFileSync(cssPath, "utf8");
  const outDir = path.join(root, "public/fonts/jxzk");
  fs.mkdirSync(outDir, { recursive: true });

  const rewritten = css.replace(/url\(([^)]+)\)/g, (full, u) => {
    const clean = String(u).replace(/['"]/g, "");
    if (clean.startsWith("http") || clean.startsWith("data:")) return full;
    const base = path.basename(clean);
    const src = path.join(path.dirname(cssPath), clean);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(outDir, base));
    return `url(/fonts/jxzk/${base})`;
  });
  fs.writeFileSync(path.join(outDir, "result.css"), rewritten);
  console.log(
    "jxzk:",
    (rewritten.match(/@font-face/g) || []).length,
    "faces"
  );
}

function copyHonglei() {
  const pkg = path.join(root, "node_modules/cn-fontsource-hong-lei-zhuo-shu-regular");
  const css = fs.readFileSync(path.join(pkg, "font.css"), "utf8");
  const outDir = path.join(root, "public/fonts/honglei");
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of fs.readdirSync(pkg).filter((x) => x.endsWith(".woff2"))) {
    fs.copyFileSync(path.join(pkg, f), path.join(outDir, f));
  }
  const rewritten = css.replace(/url\('([^']+)'\)/g, "url('/fonts/honglei/$1')");
  fs.writeFileSync(path.join(outDir, "font.css"), rewritten);
  console.log(
    "honglei:",
    (rewritten.match(/@font-face/g) || []).length,
    "faces"
  );
}

copyJxzk();
copyHonglei();

// 供 Next.js 以 import 方式加载（避免 layout 里手写 <link> 触发 lint）
const stylesDir = path.join(root, "src/styles");
fs.mkdirSync(stylesDir, { recursive: true });
fs.writeFileSync(
  path.join(stylesDir, "honglei.font.css"),
  '@import url("/fonts/honglei/font.css");\n'
);
fs.writeFileSync(
  path.join(stylesDir, "jxzk.font.css"),
  '@import url("/fonts/jxzk/result.css");\n'
);
console.log("wrote src/styles/*.font.css bridges");
