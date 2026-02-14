import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageAccessFramework } from 'expo-file-system/legacy';
import { Alert } from 'react-native';

const BACKUP_FILE_NAME = 'chireaders_backup.json';
const BACKUP_FOLDER_KEY = 'backup_folder_uri';

// Helper function for strict matching to prevent file confusion attacks
const findStrictFileUri = (files, filename) => {
    if (!files || !filename) return undefined;
    return files.find(uri => {
        const decoded = decodeURIComponent(uri);
        // Ensure the URI ends with the filename preceded by a separator
        return decoded.endsWith('/' + filename) || decoded.endsWith(':' + filename);
    });
};

/*
 * BackupService handles automatic backup to a user-selected folder using SAF.
 */
const BackupService = {

    /**
     * Request permission to access a folder.
     * Returns the URI of the selected folder or null if cancelled/failed.
     */
    async requestBackupFolder() {
        console.log("requestBackupFolder: starting");
        try {
            // Delay to avoid conflict with initial notification prompt
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log("requestBackupFolder: calling SAF");
            const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
            console.log("requestBackupFolder: SAF result:", JSON.stringify(permissions));

            if (permissions.granted) {
                const uri = permissions.directoryUri;
                await AsyncStorage.setItem(BACKUP_FOLDER_KEY, uri);
                console.log("Backup folder selected:", uri);
                return uri;
            } else {
                console.log("Directory permissions denied or cancelled");
            }
        } catch (error) {
            console.error("Error requesting backup folder:", error);
            Alert.alert("Debug Error", error.message);
        }
        return null;
    },

    /**
     * Get the currently configured backup folder URI.
     */
    async getBackupFolder() {
        return await AsyncStorage.getItem(BACKUP_FOLDER_KEY);
    },

    /**
     * Clear the backup folder setting (disable auto-backup).
     */
    async clearBackupFolder() {
        await AsyncStorage.removeItem(BACKUP_FOLDER_KEY);
    },

    /**
     * Save data to the backup file in the configured folder.
     * @param {Object} data - The full state object to save (favorites, readChapters, settings).
     */
    async autoBackup(data) {
        try {
            const folderUri = await this.getBackupFolder();
            if (!folderUri) return; // Auto-backup not configured

            const backupData = JSON.stringify(data, null, 2);

            // Check if file exists to overwrite, or create new
            // SAF doesn't have a simple "overwrite", usually we create a file. 
            // If it exists, createUrl might throw or create a duplicate.
            // Best approach: try to find the file first.

            const files = await StorageAccessFramework.readDirectoryAsync(folderUri);

            // Use strict matching instead of loose includes
            const backupFile = findStrictFileUri(files, BACKUP_FILE_NAME);

            let targetUri = backupFile;

            if (targetUri) {
                // Overwrite existing
                await StorageAccessFramework.writeAsStringAsync(targetUri, backupData);
                console.log("Backup updated successfully at", targetUri);
            } else {
                // Create new
                targetUri = await StorageAccessFramework.createFileAsync(folderUri, BACKUP_FILE_NAME, 'application/json');
                await StorageAccessFramework.writeAsStringAsync(targetUri, backupData);
                console.log("Backup created successfully at", targetUri);
            }

        } catch (error) {
            console.error("Auto-backup failed:", error);
            // If permission lost (e.g. folder deleted), maybe clear the setting?
            // For now, just log.
        }
    },

    /**
     * restoration: Read data from the backup file in the configured folder.
     * @param {string} folderUri - Optional, can pass explicitly if just selected.
     */
    async restoreFromBackup(folderUri = null) {
        try {
            const uri = folderUri || await this.getBackupFolder();
            if (!uri) return null;

            const files = await StorageAccessFramework.readDirectoryAsync(uri);

            // Use strict matching instead of manual iteration and loose includes
            const fileUri = findStrictFileUri(files, BACKUP_FILE_NAME);

            if (fileUri) {
                console.log("Backup file found:", fileUri);
                const content = await StorageAccessFramework.readAsStringAsync(fileUri);
                return JSON.parse(content);
            }

            console.log("No backup file found in folder.");

        } catch (error) {
            console.error("Restore failed:", error);
        }
        return null;
    },

    /**
     * Save content to a specific file in the backup folder.
     * @param {string} filename - Name of the file.
     * @param {string} content - Content to save.
     */
    async saveFile(filename, content) {
        try {
            const folderUri = await this.getBackupFolder();
            if (!folderUri) return false;

            // Check if file exists
            const files = await StorageAccessFramework.readDirectoryAsync(folderUri);

            // strict matching
            const existingFile = findStrictFileUri(files, filename);

            if (existingFile) {
                await StorageAccessFramework.writeAsStringAsync(existingFile, content);
                console.log(`File ${filename} updated successfully.`);
            } else {
                const newFileUri = await StorageAccessFramework.createFileAsync(folderUri, filename, 'application/json');
                await StorageAccessFramework.writeAsStringAsync(newFileUri, content);
                console.log(`File ${filename} created successfully.`);
            }
            return true;
        } catch (error) {
            console.error(`Failed to save file ${filename}:`, error);
            return false;
        }
    },

    /**
     * Read content from a specific file in the backup folder.
     * @param {string} filename - Name of the file.
     * @returns {string|null} Content of the file or null if not found/error.
     */
    async readFile(filename) {
        try {
            const folderUri = await this.getBackupFolder();
            if (!folderUri) return null;

            const files = await StorageAccessFramework.readDirectoryAsync(folderUri);

            // strict matching
            const fileUri = findStrictFileUri(files, filename);

            if (fileUri) {
                return await StorageAccessFramework.readAsStringAsync(fileUri);
            }
            return null;
        } catch (error) {
            console.error(`Failed to read file ${filename}:`, error);
            return null;
        }
    },

    /**
     * Save library cache to file.
     * @param {Array} data - Library data to save.
     */
    async saveLibraryCache(data) {
        const content = JSON.stringify(data);
        return await this.saveFile('chireaders_library_cache.json', content);
    },

    /**
     * Load library cache from file.
     * @returns {Array|null} Library data or null.
     */
    async loadLibraryCache() {
        const content = await this.readFile('chireaders_library_cache.json');
        if (content) {
            try {
                return JSON.parse(content);
            } catch (e) {
                console.error("Failed to parse library cache", e);
                return null;
            }
        }
        return null;
    }
};

export default BackupService;
