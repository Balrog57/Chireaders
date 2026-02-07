
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('appTheme');
            if (savedTheme === 'dark') {
                setIsDarkMode(true);
            }
        } catch (e) {
            console.error('Failed to load theme', e);
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = async () => {
        try {
            const newMode = !isDarkMode;
            setIsDarkMode(newMode);
            await AsyncStorage.setItem('appTheme', newMode ? 'dark' : 'light');
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    const theme = {
        background: isDarkMode ? '#121212' : '#fff',
        text: isDarkMode ? '#fff' : '#333',
        card: isDarkMode ? '#1e1e1e' : '#fff',
        border: isDarkMode ? '#333' : '#eee',
        tint: isDarkMode ? '#bb86fc' : '#e91e63',
        tabBar: isDarkMode ? '#1e1e1e' : '#fff',
        tabBarBorder: isDarkMode ? '#333' : '#f0f0f0',
        statusBarStyle: isDarkMode ? 'light-content' : 'dark-content',
        sectionHeaderUser: isDarkMode ? '#1e1e1e' : '#f9f9f9',
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
