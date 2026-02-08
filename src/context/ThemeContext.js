
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Modes: 'light', 'dark', 'sepia'
    const [themeMode, setThemeMode] = useState('light');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('appTheme');
            if (savedTheme) {
                setThemeMode(savedTheme);
            }
        } catch (e) {
            console.error('Failed to load theme', e);
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = async () => {
        try {
            let newMode;
            if (themeMode === 'light') newMode = 'dark';
            else if (themeMode === 'dark') newMode = 'sepia';
            else newMode = 'light';

            setThemeMode(newMode);
            await AsyncStorage.setItem('appTheme', newMode);
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    // Theme Definition
    const theme = {
        mode: themeMode, // Expose current mode string if needed
        background: themeMode === 'dark' ? '#121212' : (themeMode === 'sepia' ? '#F4ECD8' : '#fff'),
        text: themeMode === 'dark' ? '#fff' : (themeMode === 'sepia' ? '#5B4636' : '#333'),
        textSecondary: themeMode === 'dark' ? '#aaa' : (themeMode === 'sepia' ? '#8B735B' : '#666'),
        card: themeMode === 'dark' ? '#1e1e1e' : (themeMode === 'sepia' ? '#EAE0C8' : '#fff'),
        border: themeMode === 'dark' ? '#333' : (themeMode === 'sepia' ? '#D6C6A0' : '#eee'),
        tint: themeMode === 'dark' ? '#bb86fc' : (themeMode === 'sepia' ? '#8F6B4E' : '#e91e63'),
        tabBar: themeMode === 'dark' ? '#1e1e1e' : (themeMode === 'sepia' ? '#EAE0C8' : '#fff'),
        tabBarBorder: themeMode === 'dark' ? '#333' : (themeMode === 'sepia' ? '#D6C6A0' : '#f0f0f0'),
        statusBarStyle: themeMode === 'dark' ? 'light-content' : 'dark-content', // Sepia usually good with dark icons (dark-content)
        sectionHeaderUser: themeMode === 'dark' ? '#1e1e1e' : (themeMode === 'sepia' ? '#E4D5B7' : '#f9f9f9'),
    };

    // Compatibility helper
    const isDarkMode = themeMode === 'dark';

    return (
        <ThemeContext.Provider value={{ themeMode, toggleTheme, theme, isDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
