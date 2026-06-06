const fs = require('fs');

const filePath = 'src/app/programs/page.tsx';
const buf = fs.readFileSync(filePath);

// Find the index of the sequence [0x5d, 0x3b, 0x87, 0x91] which is "];" followed by the invalid bytes 0x87, 0x91
const target = Buffer.from([0x5d, 0x3b, 0x87, 0x91]);
const index = buf.indexOf(target);

if (index !== -1) {
  console.log('Found corrupt bytes at index:', index);
  // Reconstruct the buffer by removing the 0x87 0x91 bytes (index + 2 and index + 3)
  const newBuf = Buffer.concat([
    buf.slice(0, index + 2), // up to "];"
    buf.slice(index + 4)     // skip the two invalid bytes
  ]);
  fs.writeFileSync(filePath, newBuf);
  console.log('Successfully removed invalid bytes and saved the file.');
} else {
  console.log('Corrupt sequence not found in the raw buffer.');
}
