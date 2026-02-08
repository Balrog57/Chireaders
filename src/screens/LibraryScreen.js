import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorageContext } from '../context/StorageContext';
import { useTheme } from '../context/ThemeContext';
import ChiReadsScraper from '../services/ChiReadsScraper';

const LibraryScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { saveLibraryCache, loadLibraryCache } = useContext(StorageContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false); // Mode recherche vs Mode navigation par défaut
    const [fullData, setFullData] = useState([]); // Store all books for local search

    // Helper to normalize text for search (remove accents, lowercase)
    const normalizeText = (text) => {
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    };

    const loadBooks = useCallback(async (forceRefresh = false) => {
        try {
            if (forceRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            // Try content from cache first if not forcing refresh
            if (!forceRefresh && !isSearching) {
                const cachedData = await loadLibraryCache();
                if (cachedData && cachedData.length > 0) {
                    setData(cachedData);
                    setFullData(cachedData);
                    setLoading(false);
                    return;
                }
            }

            setData([]);
            setHasMore(false); // No more demand-paging needed

            // 1. Get counts for both categories
            const [translatedCount, originalCount] = await Promise.all([
                ChiReadsScraper.getLibraryCount('translatedtales'),
                ChiReadsScraper.getLibraryCount('original')
            ]);

            const allBooks = [];
            const fetchCategory = async (category, totalPages) => {
                // Determine actual pages to fetch, with a safety cap for huge anomalies
                const maxPages = Math.min(totalPages, 100);
                const pagePromises = [];
                for (let p = 1; p <= maxPages; p++) {
                    pagePromises.push(ChiReadsScraper.getAllBooks(p, category));
                }
                const results = await Promise.all(pagePromises);
                results.forEach(pageBooks => allBooks.push(...pageBooks));
            };

            // Fetch everything in parallel
            await Promise.all([
                fetchCategory('translatedtales', translatedCount),
                fetchCategory('original', originalCount)
            ]);

            // Deduplicate and Sort Globably
            const existingUrls = new Set();
            const uniqueBooks = allBooks.filter(book => {
                if (existingUrls.has(book.url)) return false;
                existingUrls.add(book.url);
                return true;
            });

            const sortedBooks = uniqueBooks.sort((a, b) => a.title.localeCompare(b.title));
            setData(sortedBooks);
            setFullData(sortedBooks);

            // Save to cache
            await saveLibraryCache(sortedBooks);

        } catch (error) {
            console.error('Failed to load library', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, [isSearching, loadLibraryCache, saveLibraryCache]);

    const performSearch = useCallback((query) => {
        if (!query || !query.trim()) {
            setIsSearching(false);
            setData(fullData); // Restore full list
            return;
        }

        setIsSearching(true);
        const normalizedQuery = normalizeText(query);
        const queryTerms = normalizedQuery.split(' ').filter(term => term.length > 0);

        const filtered = fullData.filter(item => {
            const normalizedTitle = normalizeText(item.title);
            // Check if ALL terms are present in the title
            return queryTerms.every(term => normalizedTitle.includes(term));
        });

        setData(filtered);
    }, [fullData]);

    useEffect(() => {
        if (!isSearching) {
            loadBooks();
        }
    }, []);

    // Handle search input submission
    const handleSearchSubmit = () => {
        performSearch(searchQuery);
    };

    // Real-time search update
    useEffect(() => {
        performSearch(searchQuery);
    }, [searchQuery, performSearch]);

    const handleLoadMore = () => {
        // Disabled since we load everything at once
    };

    const onRefresh = useCallback(() => {
        loadBooks(true);
    }, [loadBooks]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('NovelDetail', { url: item.url, title: item.title })}
        >
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.tint} />
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Bibliothèque</Text>
                {/* Search Bar */}
                <View style={[styles.searchBar, { backgroundColor: theme.border }]}>
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Rechercher..."
                        placeholderTextColor={theme.text + '80'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearchSubmit}
                        returnKeyType="search"
                    />
                    <TouchableOpacity onPress={handleSearchSubmit} style={styles.searchButton}>
                        <Ionicons name="search" size={20} color={theme.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {loading && page === 1 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.url + index}
                    numColumns={3}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.tint]}
                            tintColor={theme.tint}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Text style={{ color: theme.text }}>Aucun résultat.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    listContent: {
        padding: 10,
    },
    itemContainer: {
        flex: 1 / 3,
        margin: 5,
        marginBottom: 15,
    },
    itemImage: {
        width: '100%',
        aspectRatio: 0.7,
        borderRadius: 4,
        backgroundColor: '#eee',
        marginBottom: 5,
    },
    itemContent: {
        paddingHorizontal: 2,
    },
    itemTitle: {
        fontSize: 12,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#e91e63',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    tabContainer: {
        display: 'none', // Hidden as we removed tabs
    },
    // Search Bar Styles
    searchBar: {
        flexDirection: 'row',
        marginTop: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        paddingVertical: 8,
        fontSize: 16,
        color: '#333',
    },
    searchButton: {
        padding: 5,
    },
});

export default LibraryScreen;
