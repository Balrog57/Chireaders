import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import ChiReadsScraper from './ChiReadsScraper';

const TASK_NAME = 'CHECK_NEW_CHAPTERS';

// Configure notification channel
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

TaskManager.defineTask(TASK_NAME, async () => {
    try {
        // 1. Load data
        const favsJson = await AsyncStorage.getItem('favorites');
        if (!favsJson) return BackgroundFetch.BackgroundFetchResult.NoData;

        const favorites = JSON.parse(favsJson);
        const favoritesToScan = favorites.filter(f => f.notificationsEnabled !== false); // Default to true if undefined

        if (favoritesToScan.length === 0) {
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // Store updates in a Map instead of modifying a local copy
        // This helps prevent race conditions where user changes (add/remove favs)
        // are lost during the long-running scrape process.
        const updates = new Map();

        // 2. Scan each favorite
        // We run these sequentially or in limited parallel to avoid overwhelming resources/network
        for (const fav of favoritesToScan) {
            try {
                // Get latest details (lightweight scrape if possible, but getNovelDetails scans chapters)
                const details = await ChiReadsScraper.getNovelDetails(fav.url);

                if (details && details.chapters && details.chapters.length > 0) {
                    // Sort chapters by number descending to get the latest
                    // The scraper already returns chapters. getNovelDetails sorts by number ASC.
                    // So last element is the latest.
                    const latestChapter = details.chapters[details.chapters.length - 1];

                    if (latestChapter) {
                        // Compare with stored latest
                        if (fav.latestKnownChapterUrl !== latestChapter.url) {
                            // NEW CHAPTER FOUND!

                            // Send Notification
                            await Notifications.scheduleNotificationAsync({
                                content: {
                                    title: `Nouveau chapitre : ${fav.title}`,
                                    body: `Le chapitre "${latestChapter.title}" est disponible !`,
                                    data: { url: fav.url, title: fav.title }, // Navigate to detail on tap
                                },
                                trigger: null, // Send immediately
                            });

                            // Store update to be applied later
                            updates.set(fav.url, latestChapter.url);
                        }
                    }
                }
            } catch (err) {
                console.error(`[BackgroundFetch] Error checking ${fav.title}:`, err);
            }
        }

        // 3. Save updates if any
        if (updates.size > 0) {
            // SECURITY/INTEGRITY FIX:
            // Re-fetch the latest data from storage to ensure we don't overwrite
            // any changes made by the user (adding/removing favorites) while we were scraping.
            const currentFavsJson = await AsyncStorage.getItem('favorites');
            if (currentFavsJson) {
                const currentFavorites = JSON.parse(currentFavsJson);
                let hasChanges = false;

                const finalFavorites = currentFavorites.map(f => {
                    // Apply update if this favorite still exists and needs update
                    if (updates.has(f.url) && f.latestKnownChapterUrl !== updates.get(f.url)) {
                        hasChanges = true;
                        return { ...f, latestKnownChapterUrl: updates.get(f.url) };
                    }
                    return f;
                });

                if (hasChanges) {
                    await AsyncStorage.setItem('favorites', JSON.stringify(finalFavorites));
                    return BackgroundFetch.BackgroundFetchResult.NewData;
                }
            }
        }

        return BackgroundFetch.BackgroundFetchResult.NoData;
    } catch (error) {
        console.error('[BackgroundFetch] Task failed:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

/**
 * Register the background fetch task
 */
export async function registerBackgroundFetchAsync() {
    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
        if (!isRegistered) {
            await BackgroundFetch.registerTaskAsync(TASK_NAME, {
                minimumInterval: 60 * 60, // 15 minutes (minimum allowed by iOS is usually 15-20 min, Android varies)
                // Let's set 1 hour (60 * 60 seconds) to be safe and battery friendly
                stopOnTerminate: false, // Android only
                startOnBoot: true, // Android only
            });
            console.log('[BackgroundFetch] Task registered');
        } else {
            console.log('[BackgroundFetch] Task already registered');
        }
    } catch (err) {
        console.log('[BackgroundFetch] Register failed:', err);
    }
}

/**
 * Unregister (if needed)
 */
export async function unregisterBackgroundFetchAsync() {
    try {
        await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
        console.log('[BackgroundFetch] Task unregistered');
    } catch (err) {
        console.log('[BackgroundFetch] Unregister failed:', err);
    }
}
