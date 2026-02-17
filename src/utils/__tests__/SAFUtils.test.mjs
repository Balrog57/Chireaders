// src/utils/__tests__/SAFUtils.test.mjs
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { isSAFFileMatch } from '../SAFUtils.mjs';

describe('isSAFFileMatch', () => {
    const filename = 'chireaders_backup.json';

    it('should return false for invalid inputs', () => {
        assert.equal(isSAFFileMatch(null, filename), false);
        assert.equal(isSAFFileMatch(undefined, filename), false);
        assert.equal(isSAFFileMatch('uri', null), false);
    });

    it('should match standard encoded SAF URI', () => {
        const uri = 'content://com.android.externalstorage.documents/document/primary%3ADocuments%2Fchireaders_backup.json';
        assert.equal(isSAFFileMatch(uri, filename), true);
    });

    it('should match standard decoded SAF URI', () => {
        const uri = 'content://com.android.externalstorage.documents/document/primary:Documents/chireaders_backup.json';
        assert.equal(isSAFFileMatch(uri, filename), true);
    });

    it('should match root level ID SAF URI', () => {
        const uri = 'content://com.android.externalstorage.documents/document/primary%3Achireaders_backup.json';
        assert.equal(isSAFFileMatch(uri, filename), true);
    });

    it('should NOT match partial filenames', () => {
        const maliciousUri = 'content://com.android.externalstorage.documents/document/primary%3ADocuments%2Fmalicious_chireaders_backup.json';
        assert.equal(isSAFFileMatch(maliciousUri, filename), false);
    });

    it('should return false for malformed URIs', () => {
        const badUri = 'content://%E0%A4%A';
        assert.equal(isSAFFileMatch(badUri, filename), false);
    });
});
