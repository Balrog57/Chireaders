import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ReaderFooter from '../components/ReaderFooter';
import ReaderHeader from '../components/ReaderHeader';
import { StorageContext } from '../context/StorageContext';
import ChiReadsScraper from '../services/ChiReadsScraper';

const THEMES = {
    light: {
        background: '#ffffff',
        text: '#333333',
        bar: '#f9f9f9',
        icon: '#333',
        label: 'Thème clair'
    },
    dark: {
        background: '#1a1a1a',
        text: '#cccccc',
        bar: '#222222',
        icon: '#aaa',
        label: 'Thème sombre'
    },
    sepia: {
        background: '#f4ecd8',
        text: '#5b4636',
        bar: '#efdec2',
        icon: '#5b4636',
        label: 'Thème sépia'
    }
};

const ReaderScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { url: initialUrl, title: initialTitle, novelUrl } = route.params;

    const { markChapterAsRead, settings, updateSettings } = useContext(StorageContext);

    const [loading, setLoading] = useState(true);
    const [chapter, setChapter] = useState(null);
    const [currentUrl, setCurrentUrl] = useState(initialUrl);

    // Settings from StorageContext
    const fontSize = settings?.readerFontSize || 18;
    const theme = settings?.themeMode || 'light';
    const [showSettings, setShowSettings] = useState(false);

    // UI visibility
    const [headerVisible, setHeaderVisible] = useState(true);

    const flatListRef = useRef(null);

    useEffect(() => {
        loadChapter(currentUrl);
    }, [currentUrl]);

    const saveSettings = async (newSize, newTheme) => {
        const updates = {};
        if (newSize) updates.readerFontSize = newSize;
        if (newTheme) {
            updates.themeMode = newTheme;
            updates.darkMode = newTheme === 'dark'; // Pour compatibilité
        }
        await updateSettings(updates);
    };

    // Chapter List functionality
    const [chapterList, setChapterList] = useState([]);
    const [showChapterList, setShowChapterList] = useState(false);

    useEffect(() => {
        if (novelUrl) {
            fetchChapterList();
        }
    }, [novelUrl]);

    const fetchChapterList = async () => {
        try {
            const details = await ChiReadsScraper.getNovelDetails(novelUrl);
            if (details && details.chapters) {
                setChapterList(details.chapters);
            }
        } catch (e) {
            console.error('Failed to fetch chapter list', e);
        }
    };

    const loadChapter = async (url) => {
        setLoading(true);
        setShowChapterList(false); // Close modal if open
        try {
            const data = await ChiReadsScraper.getChapterContent(url);
            setChapter(data);

            if (novelUrl) {
                markChapterAsRead(novelUrl, {
                    url: url,
                    title: data.title
                });
            }

            if (flatListRef.current) {
                flatListRef.current.scrollToOffset({ offset: 0, animated: false });
            }
        } catch (error) {
            console.error('Error loading chapter:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigateChapter = (url) => {
        if (url) {
            setCurrentUrl(url);
        }
    };

    const toggleHeader = () => {
        console.log('Toggling header visibility:', !headerVisible);
        setHeaderVisible(!headerVisible);
    };

    const tapGesture = Gesture.Tap()
        .onEnd(() => {
            toggleHeader();
        })
        .runOnJS(true);

    const currentTheme = THEMES[theme];

    const renderItem = useCallback(({ item }) => (
        <Text
            style={[
                styles.paragraph,
                {
                    color: currentTheme.text,
                    fontSize: fontSize,
                    lineHeight: fontSize * 1.5
                }
            ]}
            selectable={false}
        >
            {item}
        </Text>
    ), [currentTheme, fontSize]);

    const renderHeader = useCallback(() => (
        <Text style={[styles.chapterTitle, { color: currentTheme.text }]}>
            {chapter?.title}
        </Text>
    ), [chapter?.title, currentTheme]);

    const renderFooterComponent = useCallback(() => (
        <View style={{ height: 100 }} />
    ), []);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#e91e63" />
                </View>
            </SafeAreaView>
        );
    }

    if (!chapter) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
                <View style={styles.centerContainer}>
                    <Text style={{ color: currentTheme.text }}>Erreur de chargement.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
            <StatusBar
                hidden={!headerVisible}
                barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={headerVisible ? currentTheme.bar : 'transparent'}
                translucent={true}
            />

            <ReaderHeader
                visible={headerVisible}
                title={chapter.title}
                onBack={() => navigation.goBack()}
                onSettings={() => setShowSettings(true)}
                theme={currentTheme}
            />

            <GestureDetector gesture={tapGesture}>
                <Animated.FlatList
                    ref={flatListRef}
                    data={chapter.content}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    ListHeaderComponent={renderHeader}
                    ListFooterComponent={renderFooterComponent}
                    contentContainerStyle={[
                        styles.scrollContent,
                        {
                            paddingTop: 80, // Space for header + extra
                            paddingBottom: insets.bottom + 80 // Space for footer + safe area + extra
                        }
                    ]}
                    style={{ flex: 1 }}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={true}
                />
            </GestureDetector>

            <ReaderFooter
                visible={headerVisible}
                onNext={() => navigateChapter(chapter.nextUrl)}
                onPrev={() => navigateChapter(chapter.prevUrl)}
                hasNext={!!chapter.nextUrl}
                hasPrev={!!chapter.prevUrl}
                theme={currentTheme}
                onChapters={() => setShowChapterList(true)}
            />

            {/* Chapter List Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showChapterList}
                onRequestClose={() => setShowChapterList(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowChapterList(false)}
                >
                    <View style={[
                        styles.settingsContainer,
                        {
                            backgroundColor: currentTheme.bar,
                            height: '70%',
                            paddingBottom: insets.bottom + 20
                        }
                    ]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <Text style={[styles.settingLabel, { color: currentTheme.text, marginBottom: 0 }]}>Chapitres</Text>
                            <TouchableOpacity
                                onPress={() => setShowChapterList(false)}
                                style={{ padding: 5 }}
                                accessibilityLabel="Fermer la liste des chapitres"
                                accessibilityRole="button"
                                accessibilityHint="Ferme la fenêtre modale"
                            >
                                <Ionicons name="close" size={24} color={currentTheme.text} />
                            </TouchableOpacity>
                        </View>

                        {chapterList.length > 0 ? (
                            <FlatList
                                data={chapterList}
                                keyExtractor={(item) => item.url}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: currentTheme.text + '20' }}
                                        onPress={() => loadChapter(item.url)}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Chapitre: ${item.title}`}
                                        accessibilityState={{ selected: item.url === currentUrl }}
                                        accessibilityHint={item.url === currentUrl ? "Chapitre actuel" : "Lire ce chapitre"}
                                    >
                                        <Text style={{ color: item.url === currentUrl ? '#e91e63' : currentTheme.text, fontWeight: item.url === currentUrl ? 'bold' : 'normal' }}>
                                            {item.title}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                initialNumToRender={20}
                            />
                        ) : (
                            <ActivityIndicator size="large" color="#e91e63" style={{ marginTop: 20 }} />
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Settings Modal - Kept same as before but styled a bit cleaner if needed */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showSettings}
                onRequestClose={() => setShowSettings(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSettings(false)}
                >
                    <View style={[
                        styles.settingsContainer,
                        {
                            backgroundColor: currentTheme.bar,
                            paddingBottom: insets.bottom + 20
                        }
                    ]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <Text style={[styles.settingLabel, { color: currentTheme.text, marginBottom: 0 }]}>Thème</Text>
                            <TouchableOpacity
                                onPress={() => setShowSettings(false)}
                                style={{ padding: 5 }}
                                accessibilityLabel="Fermer les paramètres"
                                accessibilityRole="button"
                                accessibilityHint="Ferme la fenêtre modale"
                            >
                                <Ionicons name="close" size={24} color={currentTheme.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.themeOptions} accessibilityRole="radiogroup">
                            {Object.keys(THEMES).map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[
                                        styles.themeOption,
                                        { backgroundColor: THEMES[t].background, borderWidth: theme === t ? 2 : 1, borderColor: theme === t ? '#e91e63' : '#ccc' }
                                    ]}
                                    onPress={() => saveSettings(null, t)}
                                    accessibilityRole="radio"
                                    accessibilityLabel={THEMES[t].label}
                                    accessibilityState={{ selected: theme === t }}
                                    accessibilityHint="Appuyez deux fois pour activer ce thème"
                                >
                                    <Text style={{ color: THEMES[t].text }}>A</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.settingLabel, { color: currentTheme.text, marginTop: 20 }]}>Taille du texte: {fontSize}</Text>
                        <View style={styles.fontOptions}>
                            <TouchableOpacity
                                onPress={() => saveSettings(Math.max(10, fontSize - 2), null)}
                                style={styles.fontBtn}
                                accessibilityLabel="Diminuer la taille du texte"
                                accessibilityRole="button"
                                accessibilityHint="Réduit la taille de la police"
                            >
                                <Ionicons name="remove" size={24} color={currentTheme.text} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => saveSettings(Math.min(40, fontSize + 2), null)}
                                style={styles.fontBtn}
                                accessibilityLabel="Augmenter la taille du texte"
                                accessibilityRole="button"
                                accessibilityHint="Augmente la taille de la police"
                            >
                                <Ionicons name="add" size={24} color={currentTheme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    chapterTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    paragraph: {
        marginBottom: 15,
        textAlign: 'justify',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    settingsContainer: {
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    themeOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    themeOption: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    fontOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    fontBtn: {
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 10,
        width: 60,
        alignItems: 'center',
    },
});

export default ReaderScreen;

