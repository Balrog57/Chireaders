import assert from 'assert';
import { isValidChiReadsUrl } from '../src/utils/URLDetector.js';

function runTests() {
  console.log('Running isValidChiReadsUrl Tests...');

  // Valid URLs
  assert.strictEqual(isValidChiReadsUrl('https://chireads.com'), true, 'Should accept valid https url');
  assert.strictEqual(isValidChiReadsUrl('http://chireads.com'), true, 'Should accept valid http url');
  assert.strictEqual(isValidChiReadsUrl('https://www.chireads.com'), true, 'Should accept valid www https url');
  assert.strictEqual(isValidChiReadsUrl('https://chireads.com/category/translatedtales/super-gene/'), true, 'Should accept valid deep url');

  // Invalid URLs
  assert.strictEqual(isValidChiReadsUrl('https://evil.com'), false, 'Should reject completely different domain');
  assert.strictEqual(isValidChiReadsUrl('https://chireads.com.evil.com'), false, 'Should reject trailing domain spoofing');
  assert.strictEqual(isValidChiReadsUrl('https://evil.com/chireads.com'), false, 'Should reject domain in path');
  assert.strictEqual(isValidChiReadsUrl('javascript:alert(1)'), false, 'Should reject javascript pseudo-protocol');
  assert.strictEqual(isValidChiReadsUrl('data:text/html,<script>alert(1)</script>'), false, 'Should reject data pseudo-protocol');
  assert.strictEqual(isValidChiReadsUrl('file:///etc/passwd'), false, 'Should reject file pseudo-protocol');
  assert.strictEqual(isValidChiReadsUrl(''), false, 'Should reject empty string');
  assert.strictEqual(isValidChiReadsUrl(null), false, 'Should reject null');
  assert.strictEqual(isValidChiReadsUrl(undefined), false, 'Should reject undefined');

  console.log('✅ All URL Validation tests passed!');

  // Simulate WebView Message Handler Logic
  console.log('\nSimulating WebView Message Handler...');

  let stateModified = false;

  const mockHandleMessage = (event) => {
    if (!isValidChiReadsUrl(event.nativeEvent.url)) {
      console.warn('Simulated Warning: Message WebView ignoré depuis origine non autorisée:', event.nativeEvent.url);
      return;
    }
    try {
        const message = JSON.parse(event.nativeEvent.data);
        if (message.type === 'malicious_state_change') {
            stateModified = true;
        }
    } catch (e) {}
  };

  // Test with Valid Origin
  console.log('Testing with valid origin...');
  stateModified = false;
  mockHandleMessage({
      nativeEvent: {
          url: 'https://chireads.com/some/path',
          data: JSON.stringify({ type: 'malicious_state_change' })
      }
  });
  assert.strictEqual(stateModified, true, 'Valid origin should process message');

  // Test with Invalid Origin
  console.log('Testing with malicious origin...');
  stateModified = false;
  mockHandleMessage({
      nativeEvent: {
          url: 'https://evil.com/fake-chireads-page',
          data: JSON.stringify({ type: 'malicious_state_change' })
      }
  });
  assert.strictEqual(stateModified, false, 'Invalid origin should NOT process message');

  console.log('✅ WebView Message Handler simulation passed!');
}

try {
  runTests();
} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1);
}
