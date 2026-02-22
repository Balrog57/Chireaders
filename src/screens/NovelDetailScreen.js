import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image'; // Optimized image component for better caching and performance
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    // Image, // Replaced by expo-image
    // SafeAreaView, // Removed deprecated
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity, // For feedback
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';


import { StorageContext } from '../context/StorageContext';
import { useTheme } from '../context/ThemeContext'; // Import ThemeContext
import ChiReadsScraper from '../services/ChiReadsScraper';



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
        favorites, // Add favorites to context
        updateFavoriteLatestChapter,
        toggleFavoriteNotification,
        isChapterRead,
        getLastChapterRead,
        markChapterAsRead,
        markChapterAsUnread,
        markChaptersAsRead,
        markChaptersAsUnread,
        readChapters // to trigger re-renders
    } = useContext(StorageContext);

    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState(null);
    const [isFav, setIsFav] = useState(false);
    const [reversed, setReversed] = useState(false);
    const [currentTab, setCurrentTab] = useState(0);

    // State for notification (local only for UI, synced with context)
    const [notifyEnabled, setNotifyEnabled] = useState(true);

    useEffect(() => {
        checkFavorite();
        loadDetails();
    }, [favorites]); // Add favorites dependency to react to changes

    const checkFavorite = async () => {
        const fav = favorites.find(f => f.url === url);
        if (fav) {
            setIsFav(true);
            setNotifyEnabled(fav.notificationsEnabled !== false);
        } else {
            setIsFav(false);
            setNotifyEnabled(true); // Default for new
        }
    };

    const loadDetails = async () => {
        try {
            const data = await ChiReadsScraper.getNovelDetails(url);
            setDetails(data);

            // If favorite, update latest known chapter silently
            if (isFavorite(url) && data.chapters.length > 0) {
                const latest = data.chapters[data.chapters.length - 1];
                updateFavoriteLatestChapter(url, latest.url);
            }

        } catch (error) {
            console.error('Error loading details:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async () => {
        // Haptic feedback for better UX
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (isFav) {
            await removeFavorite(url);
            setIsFav(false);
        } else {
            const latestChapter = details?.chapters?.length > 0 ? details.chapters[details.chapters.length - 1] : null;

            const novelData = {
                title: details?.title || initialTitle,
                url: url,
                cover: details?.image,
                author: details?.author,
                latestChapterUrl: latestChapter ? latestChapter.url : null
            };
            await addFavorite(novelData);
            setIsFav(true);
        }
    };

    const handleNotifyToggle = async () => {
        if (isFav) {
            await toggleFavoriteNotification(url);
            // State will update via useEffect -> checkFavorite
        }
    };

    // ... handleResume, handleChapterPress ...
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

    const handleGroupLongPress = (bucket) => {
        const chapters = bucket.chapters;
        // Check if ALL chapters in this bucket are read
        const allRead = chapters.every(ch => isChapterRead(url, ch.url));

        if (allRead) {
            // Mark all as Unread
            const urls = chapters.map(ch => ch.url);
            markChaptersAsUnread(url, urls);
            ToastAndroid.show(`${chapters.length} chapitres marqués comme non lus`, ToastAndroid.SHORT);
        } else {
            // Mark all as Read (even if some are already read, just mark the rest)
            markChaptersAsRead(url, chapters);
            ToastAndroid.show(`${chapters.length} chapitres marqués comme lus`, ToastAndroid.SHORT);
        }
    };

    // Memoize chapter grouping to prevent expensive recalculations on every render
    const processedChapters = useMemo(() => {
        if (!details || !details.chapters) return { unnumbered: [], buckets: [] };

        const unnumbered = [];
        const numbered = [];

        // 1. Separate Unnumbered (Bonus) and Numbered Chapters
        for (const chapter of details.chapters) {
            if (chapter.number === -1) {
                unnumbered.push(chapter);
            } else {
                numbered.push(chapter);
            }
        }

        // 2. Sort numbered chapters ensures strict order before grouping
        numbered.sort((a, b) => a.number - b.number);

        // 3. Group Numbered Chapters into Buckets of 50 (Optimized O(N))
        const CHUNK_SIZE = 50;
        const buckets = [];

        if (numbered.length > 0) {
            const maxNum = numbered[numbered.length - 1].number;
            let currentStart = 1;
            let currentIndex = 0;

            // Iterate through ranges until we cover the max chapter number
            while (currentStart <= maxNum) {
                const currentEnd = currentStart + CHUNK_SIZE - 1;
                const chunk = [];

                // Collect chapters for this bucket
                while (currentIndex < numbered.length) {
                    const ch = numbered[currentIndex];
                    if (ch.number < currentStart) {
                        // Skip chapters that are somehow below current start (shouldn't happen if sorted and >=1)
                        currentIndex++;
                        continue;
                    }
                    if (ch.number > currentEnd) {
                        // Belongs to next bucket
                        break;
                    }
                    chunk.push(ch);
                    currentIndex++;
                }

                if (chunk.length > 0) {
                    buckets.push({
                        start: currentStart,
                        end: currentEnd,
                        chapters: chunk
                    });
                }
                currentStart += CHUNK_SIZE;
            }
        }

        return { unnumbered, buckets };
    }, [details?.chapters]);

    const renderHeader = () => {
        if (!details) return null;
        return (
            <View style={[styles.headerContent, { backgroundColor: theme.card }]}>
                <Image
                    source={{ uri: details.image }}
                    style={styles.coverImage}
                    contentFit="cover"
                    transition={500}
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
                                style={[styles.resumeButton, { backgroundColor: theme.tint, marginLeft: isFav ? 10 : 0 }]}
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
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    accessibilityLabel="Retour"
                    accessibilityRole="button"
                    accessibilityHint="Retourner à l'écran précédent"
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.navTitle, { color: theme.text }]} numberOfLines={1}>{details.title}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} style={{ flex: 1 }}>
                {renderHeader()}

                <View style={[styles.section, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
                    <Text style={[styles.description, { color: theme.text }]}>{details.description}</Text>
                </View>

                <View style={[styles.chaptersHeader, { backgroundColor: theme.sectionHeaderUser }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Chapitres ({details.chapters.length})</Text>
                    <TouchableOpacity
                        onPress={() => setReversed(!reversed)}
                        accessibilityLabel={reversed ? "Trier du plus ancien au plus récent" : "Trier du plus récent au plus ancien"}
                        accessibilityRole="button"
                        accessibilityHint="Double-tap pour changer l'ordre de tri des chapitres"
                    >
                        <Ionicons name="swap-vertical" size={20} color={theme.tint} />
                    </TouchableOpacity>
                </View>

                {/* Main Chapter List */}
                <View style={styles.chapterList}>
                    {(() => {
                        const { unnumbered, buckets } = processedChapters;
                        // 4. Handle Reversal
                        const displayBuckets = reversed ? [...buckets].reverse() : buckets;

                        const renderChapter = (chapter, idx) => {
                            const isRead = isChapterRead(url, chapter.url);
                            return (
                                <TouchableOpacity
                                    key={chapter.url + idx}
                                    style={[styles.chapterItem, { borderBottomColor: theme.border }]}
                                    onPress={() => handleChapterPress(chapter)}
                                    onLongPress={() => handleChapterLongPress(chapter)}
                                >
                                    <Text style={[
                                        styles.chapterTitle,
                                        { color: isRead ? '#888' : theme.text }
                                    ]}>
                                        {chapter.title}
                                    </Text>
                                    {isRead && <Ionicons name="checkmark" size={16} color={theme.tint} />}
                                </TouchableOpacity>
                            );
                        };

                        return (
                            <>
                                {/* Unnumbered / Bonus Chapters */}
                                {unnumbered.length > 0 && (
                                    <View style={styles.accordionContainer}>
                                        <View style={[styles.accordionHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                                            <Text style={[styles.accordionTitle, { color: theme.text }]}>
                                                Hors-Série ({unnumbered.length})
                                            </Text>
                                        </View>
                                        {unnumbered.map((c, i) => renderChapter(c, i))}
                                    </View>
                                )}

                                {/* Numbered Buckets */}
                                {displayBuckets.map((bucket, bucketIdx) => {
                                    const isExpanded = currentTab === bucketIdx;

                                    // If reversed, chapters inside bucket should also be reversed?
                                    // Usually "Latest First" means logical order is reversed.
                                    // e.g. Bucket 201-250: Display 250, 249... 
                                    // Let's reverse content if 'reversed' is true.
                                    const content = reversed ? [...bucket.chapters].reverse() : bucket.chapters;

                                    return (
                                        <View key={bucket.start} style={styles.accordionContainer}>
                                            <TouchableOpacity
                                                style={[styles.accordionHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
                                                onPress={() => setCurrentTab(isExpanded ? -1 : bucketIdx)}
                                                onLongPress={() => handleGroupLongPress(bucket)}
                                                delayLongPress={500}
                                                accessibilityRole="button"
                                                accessibilityState={{ expanded: isExpanded }}
                                                accessibilityHint="Double-tap pour afficher ou masquer les chapitres de ce groupe"
                                            >
                                                <Text style={[styles.accordionTitle, { color: theme.text }]}>
                                                    Chapitres {bucket.start} - {bucket.end}
                                                </Text>
                                                <Ionicons
                                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                                    size={20}
                                                    color={theme.text}
                                                />
                                            </TouchableOpacity>

                                            {isExpanded && content.map((chapter, index) => renderChapter(chapter, index))}
                                        </View>
                                    );
                                })}
                            </>
                        );
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
    iconButton: {
        padding: 8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
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
