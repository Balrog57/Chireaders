import React, { createContext, useContext } from 'react';
import { StorageContext } from './StorageContext';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { settings, updateSettings } = useContext(StorageContext);

    // themeMode: 'light', 'dark', 'sepia'
    const themeMode = settings?.themeMode || 'light';

    const toggleTheme = async () => {
        let newMode;
        if (themeMode === 'light') newMode = 'dark';
        else if (themeMode === 'dark') newMode = 'sepia';
        else newMode = 'light';

        await updateSettings({
            themeMode: newMode,
            darkMode: newMode === 'dark' // Pour compatibilité ascendante
        });
    };

    // Theme Definition
    const theme = {
        mode: themeMode,
        background: themeMode === 'dark' ? '#121212' : (themeMode === 'sepia' ? '#F4ECD8' : '#fff'),
        text: themeMode === 'dark' ? '#fff' : (themeMode === 'sepia' ? '#5B4636' : '#333'),
        textSecondary: themeMode === 'dark' ? '#aaa' : (themeMode === 'sepia' ? '#8B735B' : '#666'),
        card: themeMode === 'dark' ? '#1e1e1e' : (themeMode === 'sepia' ? '#EAE0C8' : '#fff'),
        border: themeMode === 'dark' ? '#333' : (themeMode === 'sepia' ? '#D6C6A0' : '#eee'),
        tint: themeMode === 'dark' ? '#bb86fc' : (themeMode === 'sepia' ? '#8F6B4E' : '#e91e63'),
        tabBar: themeMode === 'dark' ? '#1e1e1e' : (themeMode === 'sepia' ? '#EAE0C8' : '#fff'),
        tabBarBorder: themeMode === 'dark' ? '#333' : (themeMode === 'sepia' ? '#D6C6A0' : '#f0f0f0'),
        statusBarStyle: themeMode === 'dark' ? 'light-content' : 'dark-content',
        sectionHeaderUser: themeMode === 'dark' ? '#1e1e1e' : (themeMode === 'sepia' ? '#E4D5B7' : '#f9f9f9'),
    };

    const isDarkMode = themeMode === 'dark';

    return (
        <ThemeContext.Provider value={{ themeMode, toggleTheme, theme, isDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
