/**
 * Utility for secure file operations.
 */

/**
 * Checks if a file URI matches a specific filename securely.
 * Handles URL decoding and prevents partial matches.
 *
 * @param {string} fileUri - The full URI of the file (e.g. from StorageAccessFramework)
 * @param {string} filename - The exact filename to look for (e.g. 'backup.json')
 * @returns {boolean} True if the URI points to the file, false otherwise.
 */
export const isMatchingFile = (fileUri, filename) => {
    if (!fileUri || !filename) return false;

    try {
        const decodedUri = decodeURIComponent(fileUri);

        // Check if it ends with the filename
        if (!decodedUri.endsWith(filename)) return false;

        // Get the character before the filename
        const charBefore = decodedUri.charAt(decodedUri.length - filename.length - 1);

        // It should be a separator (slash, colon, or empty if it's just the filename)
        // SAF URIs often use %2F (/) or %3A (:) as separators.
        // Since we decoded, we look for / or :.
        // Also handling the case where the URI is *just* the filename (unlikely but possible in some contexts)
        return charBefore === '/' || charBefore === ':' || charBefore === '' || decodedUri === filename;
    } catch (e) {
        console.error("Error matching file:", e);
        return false;
    }
};

export default {
    isMatchingFile
};
