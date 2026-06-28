const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    try {
      // Check if destination directory exists, if not create it
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(src, dest);
    } catch (e) {
      console.error(`[Warning] Failed to copy ${src} -> ${dest}:`, e.message);
    }
  }
}

const srcPublic = path.resolve(__dirname, '../public');
const destPublic = path.resolve(__dirname, '../.next/standalone/public');

const srcStatic = path.resolve(__dirname, '../.next/static');
const destStatic = path.resolve(__dirname, '../.next/standalone/.next/static');

try {
  const destNextDir = path.resolve(__dirname, '../.next/standalone/.next');
  if (!fs.existsSync(destNextDir)) {
    fs.mkdirSync(destNextDir, { recursive: true });
  }

  if (fs.existsSync(srcPublic)) {
    console.log('Copying public directory to standalone...');
    copyRecursiveSync(srcPublic, destPublic);
    console.log('Finished copying public directory.');
  } else {
    console.log('Warning: public directory does not exist.');
  }

  if (fs.existsSync(srcStatic)) {
    console.log('Copying .next/static directory to standalone...');
    copyRecursiveSync(srcStatic, destStatic);
    console.log('Finished copying .next/static directory.');
  } else {
    console.log('Warning: .next/static directory does not exist.');
  }
} catch (err) {
  console.error('Fatal error during postbuild asset copy:', err);
  process.exit(1);
}
