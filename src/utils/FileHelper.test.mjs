import { isMatchingFile } from './FileHelper.mjs';
import assert from 'assert';

console.log('Testing FileHelper.mjs...');

// Test cases
const tests = [
    {
        name: 'Exact match (decoded)',
        uri: 'content://com.android.externalstorage.documents/document/primary:Backups/backup.json',
        filename: 'backup.json',
        expected: true
    },
    {
        name: 'Exact match (encoded)',
        uri: 'content%3A%2F%2Fcom.android.externalstorage.documents%2Fdocument%2Fprimary%3ABackups%2Fbackup.json',
        filename: 'backup.json',
        expected: true
    },
    {
        name: 'Partial match (should fail)',
        uri: 'content://com.android.externalstorage.documents/document/primary:Backups/evil_backup.json',
        filename: 'backup.json',
        expected: false
    },
    {
        name: 'Directory match (should fail)',
        uri: 'content://com.android.externalstorage.documents/document/primary:Backups/backup.json/something',
        filename: 'backup.json',
        expected: false
    },
    {
        name: 'Different extension (should fail)',
        uri: 'content://com.android.externalstorage.documents/document/primary:Backups/backup.json.txt',
        filename: 'backup.json',
        expected: false
    },
    {
        name: 'Just filename',
        uri: 'backup.json',
        filename: 'backup.json',
        expected: true
    },
    {
        name: 'Empty URI',
        uri: '',
        filename: 'backup.json',
        expected: false
    },
    {
        name: 'Null inputs',
        uri: null,
        filename: null,
        expected: false
    }
];

let passed = 0;
let failed = 0;

tests.forEach(test => {
    try {
        const result = isMatchingFile(test.uri, test.filename);
        assert.strictEqual(result, test.expected);
        passed++;
    } catch (e) {
        console.error(`❌ Test failed: ${test.name}`);
        console.error(`   Expected: ${test.expected}, Got: ${!test.expected}`);
        failed++;
    }
});

console.log(`\nResults: ${passed} passed, ${failed} failed.`);

if (failed > 0) process.exit(1);
