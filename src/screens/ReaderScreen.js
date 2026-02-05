import { Ionicons } from '@expo/vector-icons';
import { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StorageContext } from '../context/StorageContext';
import ChiReadsScraper from '../services/ChiReadsScraper';

const ReaderScreen = ({ route, navigation }) => {
    const { chapterUrl, novelUrl } = route.params;
    const { settings, updateSettings, saveProgress } = useContext(StorageContext);
    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);
    const scrollViewRef = useRef(null);

    const loadChapter = async (url) => {
        setLoading(true);
        const data = await ChiReadsScraper.getChapterContent(url);
        setChapter(data);
        setLoading(false);

        // Scroll to top
        if (scrollViewRef.current) scrollViewRef.current.scrollTo({ y: 0, animated: false });

        // Save progress
        if (data) {
            saveProgress(novelUrl, {
                chapterUrl: url,
                chapterTitle: data.title
            });
        }
    };

    useEffect(() => {
        loadChapter(chapterUrl);
    }, [chapterUrl]);

    const handleNext = () => {
        if (chapter && chapter.next) {
            // "next" fetched by scraper is often just the relative or full URL
            // Need to ensure we navigate to the same screen with new params
            // Ideally we push or replace. Replace is better for reader flow usually, or push to keep history.
            // Push allows "Back".
            navigation.push('Reader', { chapterUrl: chapter.next, novelUrl });
        }
    };

    const handlePrev = () => {
        if (chapter && chapter.prev) {
            navigation.push('Reader', { chapterUrl: chapter.prev, novelUrl });
        }
    };

    const theme = settings.darkMode ? styles.dark : styles.light;
    const textTheme = settings.darkMode ? styles.textDark : styles.textLight;
    const fontSize = { fontSize: settings.fontSize, lineHeight: settings.fontSize * 1.5 };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, theme]}>
                <ActivityIndicator size="large" color="#e91e63" />
            </View>
        );
    }

    if (!chapter) {
        return (
            <View style={[styles.container, styles.centered, theme]}>
                <Text style={textTheme}>Erreur de chargement du chapitre.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, theme]}>
            {/* Toolbar */}
            <View style={[styles.toolbar, theme, { borderBottomColor: settings.darkMode ? '#333' : '#ddd' }]}>
                <TouchableOpacity onPress={() => updateSettings({ fontSize: Math.max(12, settings.fontSize - 2) })} style={styles.toolBtn}>
                    <Ionicons name="text" size={18} color={settings.darkMode ? 'white' : 'black'} />
                    <Text style={[textTheme, { fontSize: 10 }]}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => updateSettings({ fontSize: Math.min(30, settings.fontSize + 2) })} style={styles.toolBtn}>
                    <Ionicons name="text" size={24} color={settings.darkMode ? 'white' : 'black'} />
                    <Text style={[textTheme, { fontSize: 10 }]}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => updateSettings({ darkMode: !settings.darkMode })} style={styles.toolBtn}>
                    <Ionicons name={settings.darkMode ? "sunny" : "moon"} size={24} color={settings.darkMode ? 'white' : 'black'} />
                </TouchableOpacity>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={[styles.title, textTheme]}>{chapter.title}</Text>
                <Text style={[styles.text, textTheme, fontSize]}>{chapter.content}</Text>

                <View style={styles.navigation}>
                    <TouchableOpacity
                        disabled={!chapter.prev}
                        onPress={handlePrev}
                        style={[styles.navBtn, !chapter.prev && styles.disabledBtn]}
                    >
                        <Text style={styles.navText}>Précédent</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={!chapter.next}
                        onPress={handleNext}
                        style={[styles.navBtn, !chapter.next && styles.disabledBtn]}
                    >
                        <Text style={styles.navText}>Suivant</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    light: { backgroundColor: '#f9f9f9' },
    dark: { backgroundColor: '#1a1a1a' },
    textLight: { color: '#333' },
    textDark: { color: '#ccc' },

    toolbar: { flexDirection: 'row', justifyContent: 'flex-end', padding: 10, borderBottomWidth: 1 },
    toolBtn: { marginHorizontal: 10, alignItems: 'center', justifyContent: 'center' },

    content: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 50 },

    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    text: { textAlign: 'justify' },

    navigation: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, marginBottom: 20 },
    navBtn: { backgroundColor: '#e91e63', padding: 10, borderRadius: 5, minWidth: 100, alignItems: 'center' },
    disabledBtn: { backgroundColor: '#ccc' },
    navText: { color: 'white', fontWeight: 'bold' }
});

export default ReaderScreen;
