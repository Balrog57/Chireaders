/**
 * Utility for secure file matching in Storage Access Framework URIs.
 */

/**
 * Checks if a SAF URI matches a specific filename securely.
 * @param {string} uri - The full SAF URI (encoded or decoded).
 * @param {string} filename - The filename to check against (e.g., 'backup.json').
 * @returns {boolean} True if the URI points to the filename.
 */
export const isMatchingFile = (uri, filename) => {
    if (!uri || !filename) return false;

    // Decode the URI to handle %2F, %3A, etc.
    const decodedUri = decodeURIComponent(uri);

    // SAF URIs typically end with the filename, often preceded by a slash or colon.
    // e.g. .../document/primary:MyFolder/myFile.txt
    // or .../document/primary%3AMyFolder%2FmyFile.txt (decoded -> .../myFile.txt)

    // We check strictly for the end of the string to avoid partial matches
    // (e.g. 'myFile.txt' matching 'not_myFile.txt')

    // 1. Check if it ends with /filename
    if (decodedUri.endsWith('/' + filename)) return true;

    // 2. Check if it ends with :filename (root of volume)
    if (decodedUri.endsWith(':' + filename)) return true;

    // 3. Exact match (unlikely for full URI but good for safety)
    if (decodedUri === filename) return true;

    return false;
};
