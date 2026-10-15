import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
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

const CHAPTER_ROW_HEIGHT = 56;
const shortVolume = (title) => title.split(/[:\-–]/)[0].trim(); // « Tome 2: Titre » -> « Tome 2 »

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

    // Position de lecture: dernier paragraphe visible, mémorisé par roman
    const posKey = `readerPos:${novelUrl || initialUrl}`;
    const pendingIndex = useRef(null);
    const saveTimer = useRef(null);
    const currentUrlRef = useRef(currentUrl);
    currentUrlRef.current = currentUrl;

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        const index = viewableItems[0]?.index;
        if (index == null) return;
        // Restauration en cours: on n'écrase pas la position tant qu'on n'est pas arrivé
        if (pendingIndex.current != null) {
            if (index < pendingIndex.current - 1) return;
            pendingIndex.current = null;
        }
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            AsyncStorage.setItem(posKey, JSON.stringify({ url: currentUrlRef.current, index })).catch(() => {});
        }, 500);
    }).current;

    useEffect(() => () => clearTimeout(saveTimer.current), []);

    useEffect(() => {
        loadChapter(currentUrl);
    }, [currentUrl]);

    // Clear cache when leaving the reader
    useEffect(() => {
        return () => {
            ChiReadsScraper.clearChapterCache();
        };
    }, []);

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

    // La fiche complète du roman est lourde: on ne la charge qu'à l'ouverture de la liste
    useEffect(() => {
        if (novelUrl && showChapterList && chapterList.length === 0) {
            fetchChapterList();
        }
    }, [novelUrl, showChapterList]);

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

            const saved = JSON.parse(await AsyncStorage.getItem(posKey) || 'null');
            pendingIndex.current = saved?.url === url && saved.index > 0 ? saved.index : null;

            if (novelUrl) {
                markChapterAsRead(novelUrl, {
                    url: url,
                    title: data.title
                });
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
        chapter?.nextUrl ? (
            <TouchableOpacity
                style={styles.nextButton}
                onPress={() => navigateChapter(chapter.nextUrl)}
                accessibilityRole="button"
                accessibilityLabel="Chapitre suivant"
            >
                <Text style={styles.nextButtonText}>Chapitre suivant</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
        ) : <View style={{ height: 100 }} />
    ), [chapter?.nextUrl]);

    const restorePosition = () => {
        const index = pendingIndex.current;
        if (index == null) return;
        // Réessayé à chaque agrandissement du contenu jusqu'à ce que le paragraphe soit visible
        flatListRef.current?.scrollToIndex({ index: Math.min(index, chapter.content.length - 1), animated: false });
    };

    const currentIndex = chapterList.findIndex(c => c.url === currentUrl);

    // Tomes: la numérotation repart à 1 dans chaque tome, le saut se fait dans le tome choisi
    const chapterListRef = useRef(null);
    const [jumpVolume, setJumpVolume] = useState(null);
    const volumes = useMemo(() => [...new Set(chapterList.map(c => c.volume).filter(Boolean))], [chapterList]);
    const activeVolume = jumpVolume ?? chapterList[currentIndex]?.volume ?? null;

    const scrollChapterList = (index) => {
        if (index >= 0) chapterListRef.current?.scrollToIndex({ index, animated: false });
    };
    const jumpToChapterNumber = (text) => {
        scrollChapterList(chapterList.findIndex(c => c.number === parseFloat(text) && (!activeVolume || c.volume === activeVolume)));
    };
    const jumpToVolume = (volume) => {
        setJumpVolume(volume);
        scrollChapterList(chapterList.findIndex(c => c.volume === volume));
    };

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
                    onViewableItemsChanged={onViewableItemsChanged}
                    onContentSizeChange={restorePosition}
                    onScrollToIndexFailed={({ index, averageItemLength }) => {
                        flatListRef.current?.scrollToOffset({ offset: index * (averageItemLength || 120), animated: false });
                    }}
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
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close" size={24} color={currentTheme.text} />
                            </TouchableOpacity>
                        </View>

                        {chapterList.length > 0 && (
                            <TextInput
                                style={[styles.jumpInput, { color: currentTheme.text, borderColor: currentTheme.text + '40' }]}
                                placeholder="Aller au chapitre n°"
                                placeholderTextColor={currentTheme.text + '80'}
                                keyboardType="numeric"
                                returnKeyType="go"
                                onSubmitEditing={(e) => jumpToChapterNumber(e.nativeEvent.text)}
                            />
                        )}

                        {volumes.length > 1 && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, flexShrink: 0, marginBottom: 8 }}>
                                {volumes.map(v => (
                                    <TouchableOpacity
                                        key={v}
                                        onPress={() => jumpToVolume(v)}
                                        style={[styles.volumeChip, { borderColor: v === activeVolume ? '#e91e63' : currentTheme.text + '40' }]}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Aller au ${v}`}
                                        accessibilityState={{ selected: v === activeVolume }}
                                    >
                                        <Text style={{ color: v === activeVolume ? '#e91e63' : currentTheme.text }}>{shortVolume(v)}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {chapterList.length > 0 ? (
                            <FlatList
                                ref={chapterListRef}
                                data={chapterList}
                                keyExtractor={(item) => item.url}
                                getItemLayout={(_, index) => ({ length: CHAPTER_ROW_HEIGHT, offset: CHAPTER_ROW_HEIGHT * index, index })}
                                initialScrollIndex={Math.max(currentIndex, 0)}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={{ height: CHAPTER_ROW_HEIGHT, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: currentTheme.text + '20' }}
                                        onPress={() => { setShowChapterList(false); navigateChapter(item.url); }}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Chapitre: ${item.title}`}
                                        accessibilityState={{ selected: item.url === currentUrl }}
                                        accessibilityHint={item.url === currentUrl ? "Chapitre actuel" : "Lire ce chapitre"}
                                    >
                                        <Text numberOfLines={1} style={{ color: item.url === currentUrl ? '#e91e63' : currentTheme.text, fontWeight: item.url === currentUrl ? 'bold' : 'normal' }}>
                                            {item.title}
                                        </Text>
                                        {volumes.length > 1 && item.volume && (
                                            <Text style={{ color: currentTheme.text + '80', fontSize: 12 }}>{shortVolume(item.volume)}</Text>
                                        )}
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
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="remove" size={24} color={currentTheme.text} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => saveSettings(Math.min(40, fontSize + 2), null)}
                                style={styles.fontBtn}
                                accessibilityLabel="Augmenter la taille du texte"
                                accessibilityRole="button"
                                accessibilityHint="Augmente la taille de la police"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
    volumeChip: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
    },
    jumpInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 8,
    },
    nextButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e91e63',
        borderRadius: 10,
        paddingVertical: 14,
        marginVertical: 30,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 4,
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

