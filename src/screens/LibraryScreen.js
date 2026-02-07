import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ChiReadsScraper from '../services/ChiReadsScraper';

const LibraryScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [category, setCategory] = useState('translatedtales'); // 'translatedtales' or 'original'

    const loadBooks = useCallback(async (pageNum, cat) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const books = await ChiReadsScraper.getAllBooks(pageNum, cat);

            if (books.length === 0) {
                setHasMore(false);
            } else {
                setData(prev => {
                    if (pageNum === 1) return books;
                    // Filter out duplicates based on URL
                    const existingUrls = new Set(prev.map(b => b.url));
                    const newBooks = books.filter(b => !existingUrls.has(b.url));
                    return [...prev, ...newBooks];
                });
            }
        } catch (error) {
            console.error('Failed to load library', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setData([]); // Clear data immediately on switch
        loadBooks(1, category);
    }, [category]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadBooks(nextPage, category);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('NovelDetail', { url: item.url, title: item.title })}
        >
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemContent}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#e91e63" />
            </View>
        );
    };

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[styles.tab, category === 'translatedtales' && styles.activeTab]}
                onPress={() => setCategory('translatedtales')}
            >
                <Text style={[styles.tabText, category === 'translatedtales' && styles.activeTabText]}>Traductions</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, category === 'original' && styles.activeTab]}
                onPress={() => setCategory('original')}
            >
                <Text style={[styles.tabText, category === 'original' && styles.activeTabText]}>Original</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Bibliothèque</Text>
            </View>
            {renderTabs()}
            {loading && page === 1 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#e91e63" />
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
    activeTabText: {
        color: '#e91e63',
        fontWeight: 'bold',
    },
});

export default LibraryScreen;
