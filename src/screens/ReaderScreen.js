import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    // SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    const { url: initialUrl, title: initialTitle, novelUrl } = route.params;

    // Add StorageContext
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

    const loadChapter = async (url) => {
        setLoading(true);
        try {
            const data = await ChiReadsScraper.getChapterContent(url);
            setChapter(data);

            // Mark as read immediately when loaded
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
        <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={[styles.container, { backgroundColor: currentTheme.background }]}>
            <StatusBar hidden={!headerVisible} />

            {/* Header / Navbar */}
            {headerVisible && (
                <View style={[styles.header, { backgroundColor: currentTheme.bar, borderBottomColor: currentTheme.text + '20' }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
                        <Ionicons name="arrow-back" size={24} color={currentTheme.icon} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: currentTheme.text }]} numberOfLines={1}>
                        {chapter.title}
                    </Text>
                    <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.navButton}>
                        <Ionicons name="text" size={24} color={currentTheme.icon} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Content */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={toggleHeader}
                style={styles.contentContainer}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                >
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

                    <View style={styles.navigationButtons}>
                        <TouchableOpacity
                            style={[
                                styles.navBtn,
                                styles.prevBtn,
                                !chapter.prevUrl && styles.disabledBtn
                            ]}
                            disabled={!chapter.prevUrl}
                            onPress={() => navigateChapter(chapter.prevUrl)}
                        >
                            <Text style={styles.navBtnText}>Précédent</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.navBtn,
                                styles.nextBtn,
                                !chapter.nextUrl && styles.disabledBtn
                            ]}
                            disabled={!chapter.nextUrl}
                            onPress={() => navigateChapter(chapter.nextUrl)}
                        >
                            <Text style={styles.navBtnText}>Suivant</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </TouchableOpacity>

            {/* Settings Modal */}
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
                    <View style={[styles.settingsContainer, { backgroundColor: currentTheme.bar }]}>
                        <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Thème</Text>
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
                                    <Text style={{ color: THEMES[t].text }}>{t === 'light' ? 'A' : t === 'dark' ? 'A' : 'A'}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.settingLabel, { color: currentTheme.text, marginTop: 20 }]}>Taille du texte: {fontSize}</Text>
                        <View style={styles.fontOptions}>
                            <TouchableOpacity onPress={() => saveSettings(Math.max(10, fontSize - 2), null)} style={styles.fontBtn}>
                                <Ionicons name="remove" size={24} color={currentTheme.text} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => saveSettings(Math.min(40, fontSize + 2), null)} style={styles.fontBtn}>
                                <Ionicons name="add" size={24} color={currentTheme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        elevation: 2,
        zIndex: 10,
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    navButton: {
        padding: 5,
    },
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
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
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        marginBottom: 20,
    },
    navBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        minWidth: 120,
        alignItems: 'center',
    },
    prevBtn: {
        backgroundColor: '#ddd',
    },
    nextBtn: {
        backgroundColor: '#e91e63',
    },
    disabledBtn: {
        opacity: 0.5,
    },
    navBtnText: {
        fontWeight: 'bold',
        color: '#333',
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
