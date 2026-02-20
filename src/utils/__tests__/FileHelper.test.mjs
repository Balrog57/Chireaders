import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isMatchingFile } from '../FileHelper.mjs';

describe('isMatchingFile', () => {
  it('should return true for a valid SAF URI ending with filename', () => {
    const uri = 'content://com.android.externalstorage.documents/document/primary%3Afolder%2Fbackup.json';
    // Decodes to .../primary:folder/backup.json
    assert.strictEqual(isMatchingFile(uri, 'backup.json'), true);
  });

  it('should return true for a valid SAF URI at root (colon)', () => {
    const uri = 'content://com.android.externalstorage.documents/document/primary%3Abackup.json';
    // Decodes to .../primary:backup.json
    assert.strictEqual(isMatchingFile(uri, 'backup.json'), true);
  });

  it('should return false for a partial match', () => {
    const uri = 'content://com.android.externalstorage.documents/document/primary%3Afolder%2Fnot_backup.json';
    // Decodes to .../primary:folder/not_backup.json
    assert.strictEqual(isMatchingFile(uri, 'backup.json'), false);
  });

  it('should return false for a file with same prefix but different extension', () => {
    const uri = 'content://com.android.externalstorage.documents/document/primary%3Afolder%2Fbackup.json.bak';
    // Decodes to .../primary:folder/backup.json.bak
    assert.strictEqual(isMatchingFile(uri, 'backup.json'), false);
  });

  it('should return false for a file with similar name but different suffix', () => {
    const uri = 'content://com.android.externalstorage.documents/document/primary%3Afolder%2Fbackup.json2';
    assert.strictEqual(isMatchingFile(uri, 'backup.json'), false);
  });

  it('should return true for an already decoded URI', () => {
    const uri = 'content://com.android.externalstorage.documents/document/primary:folder/backup.json';
    assert.strictEqual(isMatchingFile(uri, 'backup.json'), true);
  });

  it('should handle null or undefined inputs gracefully', () => {
    assert.strictEqual(isMatchingFile(null, 'backup.json'), false);
    assert.strictEqual(isMatchingFile(undefined, 'backup.json'), false);
    assert.strictEqual(isMatchingFile('uri', null), false);
  });
});
