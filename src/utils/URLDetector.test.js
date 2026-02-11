
import { isValidChiReadsUrl } from './URLDetector.js';
import assert from 'assert';

console.log('Running URLDetector security tests...');

const validUrls = [
  'https://chireads.com',
  'http://chireads.com',
  'https://chireads.com/translatedtales/super-gene/',
  'https://chireads.com/random/path'
];

const invalidUrls = [
  'https://chireads.com.evil.com',
  'https://chireads.com@attacker.com',
  'http://evil.com/chireads.com',
  'https://google.com',
  'ftp://chireads.com',
  'javascript:alert(1)',
  'file:///etc/passwd',
  null,
  undefined,
  123
];

let failures = 0;

validUrls.forEach(url => {
  if (!isValidChiReadsUrl(url)) {
    console.error(`[FAIL] Valid URL rejected: ${url}`);
    failures++;
  } else {
    console.log(`[PASS] Valid URL accepted: ${url}`);
  }
});

invalidUrls.forEach(url => {
  if (isValidChiReadsUrl(url)) {
    console.error(`[FAIL] Invalid URL accepted: ${url}`);
    failures++;
  } else {
    console.log(`[PASS] Invalid URL rejected: ${url}`);
  }
});

if (failures > 0) {
  console.error(`\n${failures} tests failed.`);
  process.exit(1);
} else {
  console.log('\nAll tests passed.');
}
