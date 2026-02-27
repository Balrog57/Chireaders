import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import {
    AppState
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { registerBackgroundFetchAsync } from './src/services/BackgroundNotificationTask';
import ChiReadsScraper from './src/services/ChiReadsScraper';

import { StorageProvider } from './src/context/StorageContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import FavoritesScreen from './src/screens/FavoritesScreen';
import HomeScreen from './src/screens/HomeScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import NovelDetailScreen from './src/screens/NovelDetailScreen';
import ReaderScreen from './src/screens/ReaderScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
export const navigationRef = createNavigationContainerRef();

function MainTabs() {
    const { theme, isDarkMode } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Favorites') {
                        iconName = focused ? 'heart' : 'heart-outline';
                    } else if (route.name === 'Library') {
                        iconName = focused ? 'library' : 'library-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.tint,
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                tabBarStyle: {
                    paddingBottom: insets.bottom + 5, // Dynamic padding
                    paddingTop: 10,
                    height: 60 + insets.bottom, // Dynamic height
                    backgroundColor: theme.tabBar,
                    borderTopWidth: 1,
                    borderTopColor: theme.tabBarBorder,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Accueil',
                    tabBarLabel: 'Accueil'
                }}
            />
            <Tab.Screen
                name="Library"
                component={LibraryScreen}
                options={{
                    title: 'Bibliothèque',
                    tabBarLabel: 'Bibliothèque'
                }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{
                    title: 'Favoris',
                    tabBarLabel: 'Favoris'
                }}
            />
        </Tab.Navigator>
    );
}

function AppContent() {
    const { isDarkMode } = useTheme();

    return (
        <NavigationContainer ref={navigationRef} theme={isDarkMode ? DarkTheme : DefaultTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen name="NovelDetail" component={NovelDetailScreen} />
                <Stack.Screen name="Reader" component={ReaderScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
        </NavigationContainer>
    );
}

export default function App() {
    useEffect(() => {
        const initNotifications = async () => {
            // Expo Go SDK 53+ throws errors if we use Push Notifications APIs
            // So we skip notification initialization completely in Expo Go.
            if (Constants.appOwnership === 'expo') {
                console.log('Running in Expo Go: Skipping Push Notifications init to avoid SDK 53+ errors.');
                return;
            }

            try {
                // 1. Request permissions
                const { status } = await Notifications.requestPermissionsAsync();
                if (status === 'granted') {
                    console.log('Notification permissions granted');
                    // 2. Register background task
                    await registerBackgroundFetchAsync();
                } else {
                    console.log('Notification permissions denied');
                }
            } catch (err) {
                console.warn('Notification init failed:', err);
            }
        };

        const timer = setTimeout(initNotifications, 3000);

        let subscription;
        if (Constants.appOwnership !== 'expo') {
            // Listener for notification interaction (tap)
            subscription = Notifications.addNotificationResponseReceivedListener(response => {
                const data = response.notification.request.content.data;
                if (data && data.url) {
                    console.log('Notification tapped, navigating to:', data.url);
                    if (navigationRef.isReady()) {
                        navigationRef.navigate('NovelDetail', {
                            url: data.url,
                            title: data.title || 'Détails' // Fallback title
                        });
                    }
                }
            });
        }

        return () => {
            clearTimeout(timer);
            if (subscription) subscription.remove();
        };
    }, []);

    // Clear chapter cache when App goes to background
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                ChiReadsScraper.clearChapterCache();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StorageProvider>
                <ThemeProvider>
                    <SafeAreaProvider>
                        <AppContent />
                    </SafeAreaProvider>
                </ThemeProvider>
            </StorageProvider>
        </GestureHandlerRootView>
    );
}
