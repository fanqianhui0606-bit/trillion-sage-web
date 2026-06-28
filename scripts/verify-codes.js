const { validateActivationCode } = require('../src/lib/cosine-similarity.ts');
const fs = require('fs');
const path = require('path');

// Test 1: validateActivationCode helper
console.log('--- TEST 1: Quiz Activation Codes ---');
const codesToTest = [
  'BRIDGE-TEST',       // Beta code
  'BRIDGE_ADMIN',      // Admin code
  'TSG_ADMIN_PAGE',    // Legacy admin code
  'TSG100001523',      // Generated serial code for 1000
  'TSG123401579',      // Generated serial code for 1234
  'INVALID-CODE'       // Invalid code
];

codesToTest.forEach(code => {
  try {
    const isValid = validateActivationCode(code);
    console.log(`Code [${code}]: ${isValid ? 'VALID' : 'INVALID'}`);
  } catch (err) {
    console.error(`Error testing [${code}]:`, err.message);
  }
});

// Test 2: VIP Activation Logic
console.log('\n--- TEST 2: Paid Chat Activation Logic ---');
const familyCode = 'QS-ABCD';
const expectedVIPKey = `VIP-${familyCode}`;
console.log(`For Family Code: ${familyCode}`);
console.log(`Expected VIP Key to activate paid features: ${expectedVIPKey}`);
