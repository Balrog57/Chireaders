import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';

export const StorageContext = createContext();

export const StorageProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [history, setHistory] = useState({}); // { novelUrl: { chapterUrl, chapterTitle, timestamp } }
    const [settings, setSettings] = useState({
        darkMode: false,
        fontSize: 16
    });

    // Charger les données au démarrage
    useEffect(() => {
        const loadData = async () => {
            try {
                const favs = await AsyncStorage.getItem('favorites');
                const hist = await AsyncStorage.getItem('history');
                const sett = await AsyncStorage.getItem('settings');

                if (favs) setFavorites(JSON.parse(favs));
                if (hist) setHistory(JSON.parse(hist));
                if (sett) setSettings(JSON.parse(sett));
            } catch (e) {
                console.error("Failed to load local data", e);
            }
        };
        loadData();
    }, []);

    // Sauvegarder les favoris
    const toggleFavorite = async (novel) => {
        let newFavs;
        const exists = favorites.find(f => f.url === novel.url);
        if (exists) {
            newFavs = favorites.filter(f => f.url !== novel.url);
        } else {
            // On ajoute au début
            newFavs = [novel, ...favorites];
        }
        setFavorites(newFavs);
        await AsyncStorage.setItem('favorites', JSON.stringify(newFavs));
    };

    const isFavorite = (url) => {
        return favorites.some(f => f.url === url);
    };

    // Sauvegarder l'historique
    const saveProgress = async (novelUrl, chapterData) => {
        const newHistory = {
            ...history,
            [novelUrl]: {
                ...chapterData,
                timestamp: Date.now()
            }
        };
        setHistory(newHistory);
        await AsyncStorage.setItem('history', JSON.stringify(newHistory));
    };

    const getProgress = (novelUrl) => {
        return history[novelUrl] || null;
    };

    // Sauvegarder les settings
    const updateSettings = async (newSettings) => {
        const merged = { ...settings, ...newSettings };
        setSettings(merged);
        await AsyncStorage.setItem('settings', JSON.stringify(merged));
    };

    return (
        <StorageContext.Provider value={{
            favorites,
            history,
            settings,
            toggleFavorite,
            isFavorite,
            saveProgress,
            getProgress,
            updateSettings
        }}>
            {children}
        </StorageContext.Provider>
    );
};
