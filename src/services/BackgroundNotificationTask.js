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

        // Use a Map to store updates to avoid race conditions
        // Key: Novel URL, Value: New Chapter URL
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

                            // Store update for later merge
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
            // CRITICAL SECURITY FIX: Race Condition Prevention
            // Re-read storage strictly before saving to minimize the "Check-Then-Act" window.
            // This prevents overwriting user actions (like deleting a favorite) that happened
            // while the background task was running.
            const freshFavsJson = await AsyncStorage.getItem('favorites');
            const freshFavorites = freshFavsJson ? JSON.parse(freshFavsJson) : [];

            let hasChanges = false;
            const mergedFavorites = freshFavorites.map(freshFav => {
                if (updates.has(freshFav.url)) {
                    const newChapterUrl = updates.get(freshFav.url);
                    // Only update if the chapter is actually newer/different
                    if (freshFav.latestKnownChapterUrl !== newChapterUrl) {
                        hasChanges = true;
                        return { ...freshFav, latestKnownChapterUrl: newChapterUrl };
                    }
                }
                return freshFav;
            });

            if (hasChanges) {
                await AsyncStorage.setItem('favorites', JSON.stringify(mergedFavorites));
                return BackgroundFetch.BackgroundFetchResult.NewData;
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
