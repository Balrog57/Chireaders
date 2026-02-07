import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    // SafeAreaView, // Removed deprecated
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid // For feedback
    ,











    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // New import
import { StorageContext } from '../context/StorageContext';
import { useTheme } from '../context/ThemeContext'; // Import ThemeContext
import ChiReadsScraper from '../services/ChiReadsScraper';

const { width } = Dimensions.get('window');

const NovelDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { url, title: initialTitle } = route.params;

    // Theme
    const { theme } = useTheme();

    // Storage
    const {
        isFavorite,
        addFavorite,
        removeFavorite,
        isChapterRead,
        getLastChapterRead,
        markChapterAsRead,
        markChapterAsUnread,
        readChapters // to trigger re-renders
    } = useContext(StorageContext);

    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState(null);
    const [isFav, setIsFav] = useState(false);
    const [reversed, setReversed] = useState(false);
    const [currentTab, setCurrentTab] = useState(0);

    useEffect(() => {
        checkFavorite();
        loadDetails();
    }, []);

    const checkFavorite = async () => {
        const fav = await isFavorite(url);
        setIsFav(fav);
    };

    const loadDetails = async () => {
        try {
            const data = await ChiReadsScraper.getNovelDetails(url);
            setDetails(data);
        } catch (error) {
            console.error('Error loading details:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async () => {
        if (isFav) {
            await removeFavorite(url);
            setIsFav(false);
        } else {
            const novelData = {
                title: details?.title || initialTitle,
                url: url,
                cover: details?.image,
                author: details?.author
            };
            await addFavorite(novelData);
            setIsFav(true);
        }
    };

    const handleResume = () => {
        const lastRead = getLastChapterRead(url);
        if (lastRead) {
            navigation.navigate('Reader', {
                url: lastRead.url,
                title: lastRead.title,
                novelUrl: url
            });
        }
    };

    const handleChapterPress = (chapter) => {
        navigation.navigate('Reader', {
            url: chapter.url,
            title: chapter.title,
            novelUrl: url // Pass novelUrl for tracking
        });
    };

    // Manual toggle logic
    const handleChapterLongPress = (chapter) => {
        const isRead = isChapterRead(url, chapter.url);
        if (isRead) {
            markChapterAsUnread(url, chapter.url);
            ToastAndroid.show('Marqué comme non lu', ToastAndroid.SHORT);
        } else {
            markChapterAsRead(url, chapter);
            ToastAndroid.show('Marqué comme lu', ToastAndroid.SHORT);
        }
    };

    const renderHeader = () => {
        if (!details) return null;
        return (
            <View style={[styles.headerContent, { backgroundColor: theme.card }]}>
                <Image
                    source={{ uri: details.image }}
                    style={styles.coverImage}
                    resizeMode="cover"
                />
                <View style={styles.infoContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>{details.title}</Text>
                    <Text style={[styles.author, { color: theme.text }]}>{details.author}</Text>

                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.favButton, isFav ? styles.favButtonActive : { backgroundColor: theme.border }]}
                            onPress={toggleFavorite}
                        >
                            <Ionicons name={isFav ? "heart" : "heart-outline"} size={20} color={isFav ? "#fff" : theme.text} />
                            <Text style={[styles.favButtonText, { color: isFav ? "#fff" : theme.text }]}>
                                {isFav ? "Favoris" : "Ajouter"}
                            </Text>
                        </TouchableOpacity>

                        {getLastChapterRead(url) && (
                            <TouchableOpacity
                                style={[styles.resumeButton, { backgroundColor: theme.tint }]}
                                onPress={handleResume}
                            >
                                <Ionicons name="play" size={20} color="#fff" />
                                <Text style={styles.resumeButtonText}>Reprendre</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            </SafeAreaView>
        );
    }

    if (!details) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.centerContainer}>
                    <Text style={{ color: theme.text }}>Erreur de chargement ou livre non trouvé.</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!details) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.centerContainer}>
                    <Text style={{ color: theme.text }}>Erreur de chargement ou livre non trouvé.</Text>
                </View>
            </SafeAreaView>
        );
    }

    // chaptersToShow removed, logic moved to render

    return (
        <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.navBar, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.navTitle, { color: theme.text }]} numberOfLines={1}>{details.title}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {renderHeader()}

                <View style={[styles.section, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
                    <Text style={[styles.description, { color: theme.text }]}>{details.description}</Text>
                </View>

                <View style={[styles.chaptersHeader, { backgroundColor: theme.sectionHeaderUser }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Chapitres ({details.chapters.length})</Text>
                    <TouchableOpacity onPress={() => setReversed(!reversed)}>
                        <Ionicons name="swap-vertical" size={20} color={theme.tint} />
                    </TouchableOpacity>
                </View>

                {/* Accordion List */}
                <View style={styles.chapterList}>
                    {/* Helper to chunk logic */}
                    {(() => {
                        const total = details.chapters.length;
                        const validChapters = reversed ? [...details.chapters].reverse() : details.chapters;
                        const CHUNK_SIZE = 50;
                        const chunks = [];

                        for (let i = 0; i < total; i += CHUNK_SIZE) {
                            chunks.push(validChapters.slice(i, i + CHUNK_SIZE));
                        }

                        return chunks.map((chunk, chunkIndex) => {
                            // Calculate labels based on ACTUAL content if possible, or just index
                            // If reversed, the range labels might look weird (High to Low).
                            // Let's use the first and last chapter title or index for label?
                            // Or just "Partie X"
                            const start = chunkIndex * CHUNK_SIZE + 1;
                            const end = Math.min((chunkIndex + 1) * CHUNK_SIZE, total);

                            // State for this accordion
                            const isExpanded = currentTab === chunkIndex; // Reusing currentTab as expanded index

                            // Note: If we want multiple expandable, we need array state. 
                            // User said "open and close", usually implies one at a time or toggle.
                            // Let's use toggle logic: if clicked, set currentTab. If same, null?
                            // For simplicity, let's keep one open at a time (Accordion style).

                            return (
                                <View key={chunkIndex} style={styles.accordionContainer}>
                                    <TouchableOpacity
                                        style={[styles.accordionHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
                                        onPress={() => setCurrentTab(isExpanded ? -1 : chunkIndex)}
                                    >
                                        <Text style={[styles.accordionTitle, { color: theme.text }]}>
                                            {reversed ? `Chapitres ${total - start + 1} - ${total - end + 1}` : `Chapitres ${start} - ${end}`}
                                        </Text>
                                        <Ionicons
                                            name={isExpanded ? "chevron-up" : "chevron-down"}
                                            size={20}
                                            color={theme.text}
                                        />
                                    </TouchableOpacity>

                                    {isExpanded && chunk.map((chapter, index) => {
                                        const isRead = isChapterRead(url, chapter.url);
                                        return (
                                            <TouchableOpacity
                                                key={chapter.url + index}
                                                style={[styles.chapterItem, { borderBottomColor: theme.border }]}
                                                onPress={() => handleChapterPress(chapter)}
                                                onLongPress={() => handleChapterLongPress(chapter)}
                                            >
                                                <Text style={[
                                                    styles.chapterTitle,
                                                    { color: isRead ? '#888' : theme.text } // Grey out read chapters
                                                ]}>
                                                    {chapter.title}
                                                </Text>
                                                {isRead && <Ionicons name="checkmark" size={16} color={theme.tint} />}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            );
                        });
                    })()}
                </View>
            </ScrollView>
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
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    navTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        padding: 15,
    },
    coverImage: {
        width: 100,
        height: 150,
        borderRadius: 5,
        backgroundColor: '#ddd',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    author: {
        fontSize: 14,
        marginBottom: 15,
    },
    actionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    favButton: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 5,
    },
    favButtonActive: {
        backgroundColor: '#e91e63',
    },
    favButtonText: {
        marginLeft: 5,
        fontSize: 12,
        fontWeight: '600',
    },
    resumeButton: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 5,
    },
    resumeButtonText: {
        color: '#fff',
        marginLeft: 5,
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        padding: 15,
        borderBottomWidth: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
    },
    chaptersHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    chapterList: {
        paddingBottom: 20,
    },
    accordionContainer: {
        marginBottom: 5,
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
    },
    accordionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    chapterItem: {
        padding: 15,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chapterTitle: {
        fontSize: 14,
        flex: 1,
    },
});

export default NovelDetailScreen;
