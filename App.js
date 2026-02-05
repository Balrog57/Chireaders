// Polyfills pour Cheerio/Node
global.Buffer = global.Buffer || require('buffer').Buffer;
global.process = global.process || require('process');

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StorageProvider } from './src/context/StorageContext';
import HomeScreen from './src/screens/HomeScreen';
import NovelDetailScreen from './src/screens/NovelDetailScreen';
import ReaderScreen from './src/screens/ReaderScreen';

// Maintenir le splash screen visible
try {
    SplashScreen.preventAutoHideAsync();
} catch (e) {
    console.warn("Erreur Splash Screen preventAutoHide:", e);
}

const Stack = createStackNavigator();

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Simulation chargement
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    useEffect(() => {
        if (appIsReady) {
            SplashScreen.hideAsync().catch(console.warn);
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StorageProvider>
                <SafeAreaProvider>
                    <NavigationContainer>
                        <Stack.Navigator
                            initialRouteName="Home"
                            screenOptions={{
                                headerStyle: { backgroundColor: '#e91e63' },
                                headerTintColor: '#fff',
                                headerTitleStyle: { fontWeight: 'bold' },
                            }}
                        >
                            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="NovelDetail" component={NovelDetailScreen} options={{ title: 'Détails' }} />
                            <Stack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: false }} />
                        </Stack.Navigator>
                        <StatusBar style="auto" />
                    </NavigationContainer>
                </SafeAreaProvider>
            </StorageProvider>
        </GestureHandlerRootView>
    );
}
