import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useEffect, useState } from 'react';

export const StorageContext = createContext();

export const StorageProvider = ({ children }) => {
    // Structure des données:
    // favorites: [{ url, title, slug, dateAdded, lastVisited, lastChapterRead: { url, title, date } }]
    // readChapters: { seriesUrl: [{ url, title, dateRead }] }
    // settings: { darkMode, fontSize, notifications: { enabled, checkInterval } }

    const [favorites, setFavorites] = useState([]);
    const [readChapters, setReadChapters] = useState({});
    const [settings, setSettings] = useState({
        darkMode: false,
        fontSize: 18,
        notifications: {
            enabled: true,
            checkInterval: 3600000 // 1 heure en ms
        }
    });
    const [isLoading, setIsLoading] = useState(true);

    // Charger les données au démarrage
    useEffect(() => {
        const loadData = async () => {
            try {
                const favs = await AsyncStorage.getItem('favorites');
                const read = await AsyncStorage.getItem('readChapters');
                const sett = await AsyncStorage.getItem('settings');

                if (favs) setFavorites(JSON.parse(favs));
                if (read) setReadChapters(JSON.parse(read));
                if (sett) setSettings(JSON.parse(sett));
            } catch (e) {
                console.error("Failed to load local data", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // ===== FAVORIS =====

    /**
     * Ajouter une série aux favoris
     * @param {Object} seriesData - { url, title, slug, latestChapterUrl }
     */
    const addFavorite = useCallback(async (seriesData) => {
        const newFav = {
            url: seriesData.url,
            title: seriesData.title,
            slug: seriesData.slug,
            image: seriesData.image || seriesData.cover,
            author: seriesData.author,
            dateAdded: Date.now(),
            lastVisited: Date.now(),
            lastChapterRead: null,
            notificationsEnabled: true, // Par défaut activé
            latestKnownChapterUrl: seriesData.latestChapterUrl || null
        };

        // Retirer si existe déjà, puis ajouter en premier
        const newFavorites = [newFav, ...favorites.filter(f => f.url !== seriesData.url)];
        setFavorites(newFavorites);
        await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    }, [favorites]);

    /**
     * Retirer une série des favoris
     * @param {string} url - URL de la série
     */
    const removeFavorite = useCallback(async (url) => {
        const newFavorites = favorites.filter(f => f.url !== url);
        setFavorites(newFavorites);
        await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    }, [favorites]);

    /**
     * Vérifier si une série est en favoris
     * @param {string} url - URL de la série
     * @returns {boolean}
     */
    const isFavorite = useCallback((url) => {
        return favorites.some(f => f.url === url);
    }, [favorites]);

    /**
     * Toggle favori (ancienne fonction pour compatibilité)
     */
    const toggleFavorite = useCallback(async (seriesData) => {
        if (isFavorite(seriesData.url)) {
            await removeFavorite(seriesData.url);
        } else {
            await addFavorite(seriesData);
        }
    }, [isFavorite, removeFavorite, addFavorite]);

    /**
     * Toggle notifications for a favorite series
     * @param {string} url - URL de la série
     */
    const toggleFavoriteNotification = useCallback(async (url) => {
        const newFavorites = favorites.map(f => {
            if (f.url === url) {
                return { ...f, notificationsEnabled: !f.notificationsEnabled };
            }
            return f;
        });
        setFavorites(newFavorites);
        await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    }, [favorites]);

    /**
     * Update the latest known chapter for a favorite (sync without notifying)
     * Used when opening the details screen
     * @param {string} url - Novel URL
     * @param {string} latestChapterUrl - URL of the latest chapter found
     */
    const updateFavoriteLatestChapter = useCallback(async (url, latestChapterUrl) => {
        const favIndex = favorites.findIndex(f => f.url === url);
        if (favIndex !== -1 && latestChapterUrl) {
            // Only update if changed
            if (favorites[favIndex].latestKnownChapterUrl !== latestChapterUrl) {
                const newFavorites = [...favorites];
                newFavorites[favIndex] = {
                    ...newFavorites[favIndex],
                    latestKnownChapterUrl: latestChapterUrl
                };
                setFavorites(newFavorites);
                await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
            }
        }
    }, [favorites]);

    // ===== CHAPITRES LUS =====

    /**
     * Marquer un chapitre comme lu
     * @param {string} seriesUrl - URL de la série
     * @param {Object} chapterData - { url, title }
     */
    const markChapterAsRead = useCallback(async (seriesUrl, chapterData) => {
        const newReadChapters = { ...readChapters };

        if (!newReadChapters[seriesUrl]) {
            newReadChapters[seriesUrl] = [];
        }

        // Vérifier si pas déjà lu
        const alreadyRead = newReadChapters[seriesUrl].some(ch => ch.url === chapterData.url);
        if (!alreadyRead) {
            newReadChapters[seriesUrl].push({
                url: chapterData.url,
                title: chapterData.title,
                dateRead: Date.now()
            });
        }

        setReadChapters(newReadChapters);
        await AsyncStorage.setItem('readChapters', JSON.stringify(newReadChapters));

        // Mettre à jour lastChapterRead dans favorites si c'est un favori
        const favIndex = favorites.findIndex(f => f.url === seriesUrl);
        if (favIndex !== -1) {
            const newFavorites = [...favorites];
            newFavorites[favIndex] = {
                ...newFavorites[favIndex],
                lastVisited: Date.now(),
                lastChapterRead: {
                    url: chapterData.url,
                    title: chapterData.title,
                    date: Date.now()
                }
            };
            setFavorites(newFavorites);
            await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
        }
    }, [readChapters, favorites]);

    /**
     * Marquer un chapitre comme non lu
     * @param {string} seriesUrl - URL de la série
     * @param {string} chapterUrl - URL du chapitre
     */
    const markChapterAsUnread = useCallback(async (seriesUrl, chapterUrl) => {
        const newReadChapters = { ...readChapters };

        if (newReadChapters[seriesUrl]) {
            newReadChapters[seriesUrl] = newReadChapters[seriesUrl].filter(ch => ch.url !== chapterUrl);

            if (newReadChapters[seriesUrl].length === 0) {
                delete newReadChapters[seriesUrl];
            }

            setReadChapters(newReadChapters);
            await AsyncStorage.setItem('readChapters', JSON.stringify(newReadChapters));

            // Update favorites last chapter
            const favIndex = favorites.findIndex(f => f.url === seriesUrl);
            if (favIndex !== -1) {
                const newFavorites = [...favorites];
                const seriesChapters = newReadChapters[seriesUrl] || [];
                const lastChapter = seriesChapters.length > 0 ? seriesChapters[seriesChapters.length - 1] : null;

                newFavorites[favIndex] = {
                    ...newFavorites[favIndex],
                    lastVisited: Date.now(),
                    lastChapterRead: lastChapter ? {
                        url: lastChapter.url,
                        title: lastChapter.title,
                        date: lastChapter.dateRead
                    } : null
                };
                setFavorites(newFavorites);
                await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
            }
        }
    }, [readChapters, favorites]);

    /**
     * Marquer plusieurs chapitres comme lus
     * @param {string} seriesUrl - URL de la série
     * @param {Array} chaptersArray - Liste d'objets chapitre { url, title }
     */
    const markChaptersAsRead = useCallback(async (seriesUrl, chaptersArray) => {
        const newReadChapters = { ...readChapters };

        if (!newReadChapters[seriesUrl]) {
            newReadChapters[seriesUrl] = [];
        }

        let hasChanges = false;
        const currentReadUrls = new Set(newReadChapters[seriesUrl].map(ch => ch.url));

        chaptersArray.forEach(chapter => {
            if (!currentReadUrls.has(chapter.url)) {
                newReadChapters[seriesUrl].push({
                    url: chapter.url,
                    title: chapter.title,
                    dateRead: Date.now()
                });
                currentReadUrls.add(chapter.url);
                hasChanges = true;
            }
        });

        if (hasChanges) {
            setReadChapters(newReadChapters);
            await AsyncStorage.setItem('readChapters', JSON.stringify(newReadChapters));

            // Update favorites if needed
            const favIndex = favorites.findIndex(f => f.url === seriesUrl);
            if (favIndex !== -1) {
                // Find the last read chapter among the newly added ones + existing ones
                // Ideally we sort by dateRead or trust the existing order + new ones at end?
                // Actually the chaptersArray might not be in order.
                // Let's just find the last one from the new list as "most recent interaction"
                // or simpler: just take the last element of the updated list
                const seriesChapters = newReadChapters[seriesUrl];
                const lastChapter = seriesChapters[seriesChapters.length - 1];

                const newFavorites = [...favorites];
                newFavorites[favIndex] = {
                    ...newFavorites[favIndex],
                    lastVisited: Date.now(),
                    lastChapterRead: {
                        url: lastChapter.url,
                        title: lastChapter.title,
                        date: lastChapter.dateRead
                    }
                };
                setFavorites(newFavorites);
                await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
            }
        }
    }, [readChapters, favorites]);


    /**
     * Marquer plusieurs chapitres comme non lus
     * @param {string} seriesUrl - URL de la série
     * @param {Array} chapterUrlsArray - Liste d'URLs de chapitres
     */
    const markChaptersAsUnread = useCallback(async (seriesUrl, chapterUrlsArray) => {
        const newReadChapters = { ...readChapters };

        if (newReadChapters[seriesUrl]) {
            const urlsToRemove = new Set(chapterUrlsArray);
            const originalLength = newReadChapters[seriesUrl].length;

            newReadChapters[seriesUrl] = newReadChapters[seriesUrl].filter(
                ch => !urlsToRemove.has(ch.url)
            );

            if (newReadChapters[seriesUrl].length !== originalLength) {
                if (newReadChapters[seriesUrl].length === 0) {
                    delete newReadChapters[seriesUrl];
                }

                setReadChapters(newReadChapters);
                await AsyncStorage.setItem('readChapters', JSON.stringify(newReadChapters));

                // Update favorites last chapter
                const favIndex = favorites.findIndex(f => f.url === seriesUrl);
                if (favIndex !== -1) {
                    const newFavorites = [...favorites];
                    const seriesChapters = newReadChapters[seriesUrl] || [];
                    const lastChapter = seriesChapters.length > 0 ? seriesChapters[seriesChapters.length - 1] : null;

                    newFavorites[favIndex] = {
                        ...newFavorites[favIndex],
                        lastVisited: Date.now(),
                        lastChapterRead: lastChapter ? {
                            url: lastChapter.url,
                            title: lastChapter.title,
                            date: lastChapter.dateRead
                        } : null
                    };
                    setFavorites(newFavorites);
                    await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
                }
            }
        }
    }, [readChapters, favorites]);

    /**
     * Obtenir la progression d'une série (liste des chapitres lus)
     * @param {string} seriesUrl - URL de la série
     * @returns {Array} Liste des chapitres lus
     */
    const getSeriesProgress = useCallback((seriesUrl) => {
        return readChapters[seriesUrl] || [];
    }, [readChapters]);

    /**
     * Obtenir le dernier chapitre lu d'une série
     * @param {string} seriesUrl - URL de la série
     * @returns {Object|null} Dernier chapitre lu ou null
     */
    const getLastChapterRead = useCallback((seriesUrl) => {
        const chapters = readChapters[seriesUrl] || [];
        if (chapters.length === 0) return null;
        return chapters[chapters.length - 1];
    }, [readChapters]);

    /**
     * Vérifier si un chapitre est lu
     * @param {string} seriesUrl - URL de la série
     * @param {string} chapterUrl - URL du chapitre
     * @returns {boolean}
     */
    const isChapterRead = useCallback((seriesUrl, chapterUrl) => {
        const chapters = readChapters[seriesUrl] || [];
        return chapters.some(ch => ch.url === chapterUrl);
    }, [readChapters]);

    /**
     * Obtenir tout l'historique de lecture (tous chapitres, triés par date)
     * @returns {Array} Liste de tous les chapitres lus
     */
    const getAllHistory = useCallback(() => {
        const allChapters = [];

        Object.keys(readChapters).forEach(seriesUrl => {
            readChapters[seriesUrl].forEach(chapter => {
                const favorite = favorites.find(f => f.url === seriesUrl);
                allChapters.push({
                    ...chapter,
                    seriesUrl,
                    seriesTitle: favorite?.title || 'Série inconnue'
                });
            });
        });

        // Trier par date décroissante (plus récent en premier)
        return allChapters.sort((a, b) => b.dateRead - a.dateRead);
    }, [readChapters, favorites]);

    // ===== SETTINGS =====

    /**
     * Mettre à jour les paramètres
     * @param {Object} newSettings - Nouveaux paramètres
     */
    const updateSettings = useCallback(async (newSettings) => {
        const merged = { ...settings, ...newSettings };
        setSettings(merged);
        await AsyncStorage.setItem('settings', JSON.stringify(merged));
    }, [settings]);

    // ===== ANCIENNES FONCTIONS (pour compatibilité) =====

    const toggleChapterRead = useCallback(async (novelUrl, chapterUrl) => {
        // Cette fonction n'est plus utilisée dans la nouvelle architecture
        // mais on la garde pour ne pas casser l'ancien code
        if (isChapterRead(novelUrl, chapterUrl)) {
            // Retirer du read
            const newReadChapters = { ...readChapters };
            if (newReadChapters[novelUrl]) {
                newReadChapters[novelUrl] = newReadChapters[novelUrl].filter(
                    ch => ch.url !== chapterUrl
                );
            }
            setReadChapters(newReadChapters);
            await AsyncStorage.setItem('readChapters', JSON.stringify(newReadChapters));
        } else {
            await markChapterAsRead(novelUrl, { url: chapterUrl, title: 'Chapitre' });
        }
    }, [readChapters, isChapterRead, markChapterAsRead]);

    return (
        <StorageContext.Provider value={{
            // État
            favorites,
            readChapters,
            settings,
            isLoading,

            // Favoris
            addFavorite,
            removeFavorite,
            isFavorite,
            toggleFavorite, // compatibilité
            toggleFavoriteNotification,
            updateFavoriteLatestChapter,

            // Chapitres
            markChapterAsRead,
            markChapterAsUnread,
            markChaptersAsRead,
            markChaptersAsUnread,
            getSeriesProgress,
            getLastChapterRead,
            isChapterRead,
            getAllHistory,
            toggleChapterRead, // compatibilité

            // Settings
            updateSettings
        }}>
            {children}
        </StorageContext.Provider>
    );
};
