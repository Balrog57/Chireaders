/**
 * Utility functions for working with the Storage Access Framework (SAF).
 */

/**
 * Safely checks if a SAF URI matches a given filename.
 * This prevents partial matches (e.g., "malicious_file.json" matching "file.json")
 * and ensures the correct file is targeted.
 *
 * @param {string} uri - The SAF URI (e.g., content://...)
 * @param {string} filename - The target filename (e.g., chireaders_backup.json)
 * @returns {boolean} True if the URI points exactly to the filename.
 */
export const isSAFFileMatch = (uri, filename) => {
    if (!uri || !filename) return false;

    try {
        const decoded = decodeURIComponent(uri);
        // SAF URIs typically end with the filename, but the separator depends on the provider.
        // Common patterns:
        // - .../file.json (file path style)
        // - ...:file.json (ID style)
        // Checking for strict suffix with separator ensures we don't match substrings.
        return decoded.endsWith('/' + filename) || decoded.endsWith(':' + filename);
    } catch (e) {
        // If URI decoding fails, it's not a match
        return false;
    }
};

export default {
    isSAFFileMatch
};
