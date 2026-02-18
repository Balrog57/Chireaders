import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateBackupData } from '../Validation.mjs';

test('validateBackupData - valid data', () => {
    const validData = {
        favorites: [{ url: 'http://example.com', title: 'Test Novel' }],
        readChapters: { 'http://example.com': [{ url: 'http://example.com/c1', title: 'Chapter 1' }] },
        settings: { theme: 'dark' }
    };
    const result = validateBackupData(validData);
    assert.equal(result.isValid, true);
    assert.equal(result.error, null);
});

test('validateBackupData - missing favorites (allowed)', () => {
    const validData = {
        readChapters: {},
        settings: {}
    };
    const result = validateBackupData(validData);
    assert.equal(result.isValid, true);
});

test('validateBackupData - invalid favorites (not array)', () => {
    const invalidData = {
        favorites: "not an array"
    };
    const result = validateBackupData(invalidData);
    assert.equal(result.isValid, false);
    assert.ok(result.error.includes("favoris est corrompue"));
});

test('validateBackupData - invalid favorites item (missing url)', () => {
    const invalidData = {
        favorites: [{ title: 'Test Novel' }] // missing url
    };
    const result = validateBackupData(invalidData);
    assert.equal(result.isValid, false);
    assert.ok(result.error.includes("URL valide"));
});

test('validateBackupData - invalid readChapters (not object)', () => {
    const invalidData = {
        readChapters: [] // Array is technically an object but we want {}
    };
    const result = validateBackupData(invalidData);
    assert.equal(result.isValid, false);
    assert.ok(result.error.includes("lecture est corrompu"));
});

test('validateBackupData - invalid settings (not object)', () => {
    const invalidData = {
        settings: "bad settings"
    };
    const result = validateBackupData(invalidData);
    assert.equal(result.isValid, false);
    assert.ok(result.error.includes("paramètres sont corrompus"));
});

test('validateBackupData - invalid readChapters (null)', () => {
    const invalidData = {
        readChapters: null
    };
    const result = validateBackupData(invalidData);
    assert.equal(result.isValid, false);
    assert.ok(result.error.includes("lecture est corrompu"));
});
