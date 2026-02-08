import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
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
        icon: '#333'
    },
    dark: {
        background: '#1a1a1a',
        text: '#cccccc',
        bar: '#222222',
        icon: '#aaa'
    },
    sepia: {
        background: '#f4ecd8',
        text: '#5b4636',
        bar: '#efdec2',
        icon: '#5b4636'
    }
};

const ReaderScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { url: initialUrl, title: initialTitle, novelUrl } = route.params;

    const { markChapterAsRead } = useContext(StorageContext);

    const [loading, setLoading] = useState(true);
    const [chapter, setChapter] = useState(null);
    const [currentUrl, setCurrentUrl] = useState(initialUrl);

    // Settings
    const [fontSize, setFontSize] = useState(18);
    const [theme, setTheme] = useState('light');
    const [showSettings, setShowSettings] = useState(false);

    // UI visibility
    const [headerVisible, setHeaderVisible] = useState(true);

    const scrollViewRef = useRef(null);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        loadChapter(currentUrl);
    }, [currentUrl]);

    const loadSettings = async () => {
        try {
            const size = await AsyncStorage.getItem('reader_fontsize');
            const th = await AsyncStorage.getItem('reader_theme');
            if (size) setFontSize(parseInt(size));
            if (th) setTheme(th);
        } catch (e) {
            console.error('Failed to load settings', e);
        }
    };

    const saveSettings = async (newSize, newTheme) => {
        try {
            if (newSize) {
                setFontSize(newSize);
                await AsyncStorage.setItem('reader_fontsize', newSize.toString());
            }
            if (newTheme) {
                setTheme(newTheme);
                await AsyncStorage.setItem('reader_theme', newTheme);
            }
        } catch (e) {
            console.error('Failed to save settings', e);
        }
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

            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ y: 0, animated: false });
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

    const currentTheme = THEMES[theme];

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

            <Animated.ScrollView
                ref={scrollViewRef}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: 80, // Space for header + extra
                        paddingBottom: insets.bottom + 80 // Space for footer + safe area + extra
                    }
                ]}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={toggleHeader}>
                    <View>
                        <Text style={[styles.chapterTitle, { color: currentTheme.text }]}>
                            {chapter.title}
                        </Text>

                        {chapter.content && chapter.content.map((para, index) => (
                            <Text
                                key={index}
                                style={[
                                    styles.paragraph,
                                    {
                                        color: currentTheme.text,
                                        fontSize: fontSize,
                                        lineHeight: fontSize * 1.5
                                    }
                                ]}
                                selectable={true}
                            >
                                {para}
                            </Text>
                        ))}

                        <View style={{ height: 100 }} />
                    </View>
                </TouchableWithoutFeedback>
            </Animated.ScrollView>

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
                            >
                                <Ionicons name="close" size={24} color={currentTheme.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.themeOptions}>
                            {Object.keys(THEMES).map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[
                                        styles.themeOption,
                                        { backgroundColor: THEMES[t].background, borderWidth: theme === t ? 2 : 1, borderColor: theme === t ? '#e91e63' : '#ccc' }
                                    ]}
                                    onPress={() => saveSettings(null, t)}
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
                            >
                                <Ionicons name="remove" size={24} color={currentTheme.text} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => saveSettings(Math.min(40, fontSize + 2), null)}
                                style={styles.fontBtn}
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

