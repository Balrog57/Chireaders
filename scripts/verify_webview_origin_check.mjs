import { isValidChiReadsUrl } from '../src/utils/URLDetector.js';

console.log("Testing isValidChiReadsUrl...");
const validUrls = [
  'https://chireads.com/category/translatedtales/',
  'http://chireads.com',
  'https://www.chireads.com',
];

const invalidUrls = [
  'https://evil.com/chireads.com',
  'javascript:alert(1)',
  'file:///etc/passwd',
  'https://chireads.com.evil.com',
  'https://subdomain.chireads.com',
];

let failed = false;

validUrls.forEach(url => {
  if (!isValidChiReadsUrl(url)) {
    console.error(`❌ Expected ${url} to be valid.`);
    failed = true;
  } else {
    console.log(`✅ ${url} is valid.`);
  }
});

invalidUrls.forEach(url => {
  if (isValidChiReadsUrl(url)) {
    console.error(`❌ Expected ${url} to be invalid.`);
    failed = true;
  } else {
    console.log(`✅ ${url} is invalid.`);
  }
});

if (failed) {
  process.exit(1);
} else {
  console.log("All tests passed!");
}
