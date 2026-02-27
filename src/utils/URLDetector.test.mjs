import { slugToTitle, extractChapterNumber } from './URLDetector.js';

console.log("=== Testing URLDetector.js ===");

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
        process.exit(1);
    } else {
        console.log(`✅ PASS: ${message}`);
    }
}

function testSlugToTitle() {
    console.log("\n--- Testing slugToTitle ---");

    // Valid cases
    assert(slugToTitle("hello-world") === "Hello World", "Valid slug: hello-world -> Hello World");
    assert(slugToTitle("test") === "Test", "Valid slug: test -> Test");

    // Invalid cases (current crash)
    try {
        const res = slugToTitle(123);
        assert(res === "", "Number input: 123 -> ''");
    } catch (e) {
        console.log(`❌ FAIL: slugToTitle crashed on number input: ${e.message}`);
    }

    try {
        const res = slugToTitle({});
        assert(res === "", "Object input: {} -> ''");
    } catch (e) {
        console.log(`❌ FAIL: slugToTitle crashed on object input: ${e.message}`);
    }

    try {
        const res = slugToTitle(null);
        assert(res === "", "Null input: null -> ''");
    } catch (e) {
        console.log(`❌ FAIL: slugToTitle crashed on null input: ${e.message}`);
    }
}

function testExtractChapterNumber() {
    console.log("\n--- Testing extractChapterNumber ---");

    // Valid cases
    assert(extractChapterNumber("chapitre-10") === "10", "Valid: chapitre-10 -> 10");
    assert(extractChapterNumber("chapitre-42-test") === "42", "Valid: chapitre-42-test -> 42");

    // Invalid cases (current crash)
    try {
        const res = extractChapterNumber(123);
        assert(res === null, "Number input: 123 -> null");
    } catch (e) {
        console.log(`❌ FAIL: extractChapterNumber crashed on number input: ${e.message}`);
    }

    try {
        const res = extractChapterNumber({});
        assert(res === null, "Object input: {} -> null");
    } catch (e) {
        console.log(`❌ FAIL: extractChapterNumber crashed on object input: ${e.message}`);
    }
}

testSlugToTitle();
testExtractChapterNumber();
