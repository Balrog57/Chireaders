import { isValidChiReadsUrl } from '../src/utils/URLDetector.js';

console.log("=== Testing WebView Origin Validation Logic ===");

let passed = 0;
let failed = 0;

function test(name, result) {
    if (result) {
        console.log(`✅ PASS: ${name}`);
        passed++;
    } else {
        console.log(`❌ FAIL: ${name}`);
        failed++;
    }
}

// simulate handleMessage logic
function simulateHandleMessage(sourceUrl) {
    if (!isValidChiReadsUrl(sourceUrl)) {
        return "BLOCKED";
    }
    return "ALLOWED";
}

test("Valid origin (https://chireads.com) should be ALLOWED", simulateHandleMessage("https://chireads.com/category/translatedtales/") === "ALLOWED");
test("Valid origin (https://www.chireads.com) should be ALLOWED", simulateHandleMessage("https://www.chireads.com/") === "ALLOWED");
test("Valid origin (http://chireads.com) should be ALLOWED", simulateHandleMessage("http://chireads.com/translatedtales/super-gene/chapitre-1/") === "ALLOWED");

test("Malicious origin (https://evil.com) should be BLOCKED", simulateHandleMessage("https://evil.com") === "BLOCKED");
test("Malicious origin (javascript:alert('xss')) should be BLOCKED", simulateHandleMessage("javascript:alert('xss')") === "BLOCKED");
test("Malicious origin (file:///etc/passwd) should be BLOCKED", simulateHandleMessage("file:///etc/passwd") === "BLOCKED");
test("Malicious origin with fake domain (https://chireads.com.evil.com) should be BLOCKED", simulateHandleMessage("https://chireads.com.evil.com") === "BLOCKED");
test("Malicious origin with fake subdomain (https://evil.chireads.com) should be BLOCKED", simulateHandleMessage("https://evil.chireads.com") === "BLOCKED");
test("Null origin should be BLOCKED", simulateHandleMessage(null) === "BLOCKED");
test("Undefined origin should be BLOCKED", simulateHandleMessage(undefined) === "BLOCKED");

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
