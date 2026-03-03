import { isValidChiReadsUrl } from '../src/utils/URLDetector.js';

function simulateWebViewMessage(url, data) {
    if (!url || !isValidChiReadsUrl(url)) {
        console.log(`[BLOCKED] Origin validation failed for: ${url}`);
        return false;
    }

    console.log(`[ALLOWED] Origin validation passed for: ${url}`);
    return true;
}

// Test cases
console.log('--- Testing Origin Validation ---');
const tests = [
    { url: 'https://chireads.com', expected: true },
    { url: 'https://www.chireads.com', expected: true },
    { url: 'http://chireads.com/path', expected: true },
    { url: 'https://chireads.com/translatedtales/super-gene/', expected: true },
    { url: 'https://malicious.com', expected: false },
    { url: 'http://localhost:3000', expected: false },
    { url: 'file:///data/local/tmp/test.html', expected: false },
    { url: 'javascript:alert(1)', expected: false },
    { url: 'https://chireads.com.evil.com', expected: false },
    { url: 'https://evil.chireads.com', expected: false }, // only exact match allowed based on URLDetector
    { url: null, expected: false },
    { url: '', expected: false },
];

let passed = 0;
for (const test of tests) {
    const result = simulateWebViewMessage(test.url, '{}');
    if (result === test.expected) {
        passed++;
    } else {
        console.error(`[ERROR] Test failed for ${test.url}. Expected ${test.expected}, got ${result}`);
    }
}

console.log(`--- Results: ${passed}/${tests.length} passed ---`);
if (passed === tests.length) {
    console.log('SUCCESS');
    process.exit(0);
} else {
    console.error('FAILURE');
    process.exit(1);
}
