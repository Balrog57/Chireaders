import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import ChiReadsScraper from '../services/ChiReadsScraper';

const LibraryScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false); // Mode recherche vs Mode navigation par défaut

    const loadBooks = useCallback(async (pageNum) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            // Fetch both categories in parallel for merged view
            const [translated, original] = await Promise.all([
                ChiReadsScraper.getAllBooks(pageNum, 'translatedtales'),
                ChiReadsScraper.getAllBooks(pageNum, 'original')
            ]);

            // Simple merge: Interleave or concat. 
            // Since original might be smaller, concat might result in blocks.
            // Let's concat for now, or mix.
            const combined = [...translated, ...original];

            if (combined.length === 0) {
                setHasMore(false);
            } else {
                setData(prev => {
                    if (pageNum === 1) return combined.sort((a, b) => a.title.localeCompare(b.title));
                    // Filter out duplicates based on URL
                    const existingUrls = new Set(prev.map(b => b.url));
                    const newBooks = combined.filter(b => !existingUrls.has(b.url));
                    const finalData = [...prev, ...newBooks];
                    // Sort alphabetically by title
                    return finalData.sort((a, b) => a.title.localeCompare(b.title));
                });
            }
        } catch (error) {
            console.error('Failed to load library', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    const performSearch = useCallback(async (query) => {
        if (!query.trim()) {
            setIsSearching(false);
            loadBooks(1);
            return;
        }

        try {
            setLoading(true);
            setIsSearching(true);
            const results = await ChiReadsScraper.search(query);
            setData(results);
            setHasMore(false); // Search results usually not paginated in this simple implementation
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    }, [loadBooks]);

    useEffect(() => {
        if (!isSearching) {
            setPage(1);
            setHasMore(true);
            loadBooks(1);
        }
    }, []); // Only on mount/mode switch, but loadBooks dependency handled by logic

    // Handle search input submission
    const handleSearchSubmit = () => {
        performSearch(searchQuery);
    };

    const handleLoadMore = () => {
        if (!isSearching && !loadingMore && hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadBooks(nextPage);
        }
    };

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
