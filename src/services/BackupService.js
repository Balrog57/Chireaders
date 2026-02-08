import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';

const BACKUP_FILE_NAME = 'chireaders_backup.json';
const BACKUP_FOLDER_KEY = 'backup_folder_uri';

/*
 * BackupService handles automatic backup to a user-selected folder using SAF.
 */
const BackupService = {

    /**
     * Request permission to access a folder.
     * Returns the URI of the selected folder or null if cancelled/failed.
     */
    async requestBackupFolder() {
        try {
            const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
                const uri = permissions.directoryUri;
                await AsyncStorage.setItem(BACKUP_FOLDER_KEY, uri);
                return uri;
            }
        } catch (error) {
            console.error("Error requesting backup folder:", error);
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
            const backupFile = files.find(uri => uri.includes(BACKUP_FILE_NAME)); // Basic check, uri contains filename usually

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
            // Needs robust finding method. SAF URIs are opaque but often end with filename encoded.
            // However, we can just look for any file? No, we should look specifically for our backup.
            // We can iterate and check content? Too slow.
            // Let's assume file creation resulted in a consistent name if possible, 
            // but SAF might name it `chireaders_backup (1).json`. 
            // We should look for the file we created. 
            // A simple strategy: Look for a file that typically matches our name.
            // Implementation detail: `createFileAsync` returns a URI. We *could* store that URI,
            // but the file might be deleted and recreated.

            // Let's filter by name assuming typical SAF behavior or just content type?
            // SAF doesn't give names easily in `readDirectoryAsync` result (it's just an array of strings).
            // We might need to keep track of the file URI too, or just Try to read the most recent one?
            // Wait, standard SAF usage involves parsing the URIs or using `getInfoAsync`.

            // Refined strategy:
            // 1. Get all files in directory.
            // 2. We can't easily know the name without `getInfoAsync` on each, which is slow.
            // 3. BUT, `BACKUP_FILE_NAME` was used to create it. 
            //    On Android, the URI might usually contain the name.
            //    Let's try to just find a file that matches our criteria.

            // Actually, for a *User Selected Folder*, we expect it to contain our backup.
            // Let's try to find our specific file if we can.

            // Workaround: We will just try to read "chireaders_backup.json" if possible? No, SAF doesn't work by path.
            // We really have to search.

            // Optimization: If we have many files, this is bad. 
            // But usually this folder is specific or user knows.

            // Let's defer to a simple check:
            // If we stored the *File URI*, we could try that. But "Auto Backup" implies we write to the same file.
            // If we create a file, we get a URI. We should probably store that URI too?
            // But if the user deletes the file, the URI is dead.

            // Let's iterate and check names (decoded).
            for (const fileUri of files) {
                const info = await FileSystem.getInfoAsync(fileUri);
                if (info.exists && !info.isDirectory && decodeURIComponent(fileUri).includes(BACKUP_FILE_NAME)) {
                    const content = await StorageAccessFramework.readAsStringAsync(fileUri);
                    return JSON.parse(content);
                }
            }

            console.log("No backup file found in folder.");

        } catch (error) {
            console.error("Restore failed:", error);
        }
        return null;
    }
};

export default BackupService;
