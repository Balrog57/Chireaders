
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import ChiReadsScraper from '../services/ChiReadsScraper';

const HomeScreen = () => {
    const navigation = useNavigation();
    const { themeMode, toggleTheme, theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [homeData, setHomeData] = useState({
        featured: [],
        latest: [],
        newReleases: [],
        popular: [],
        recommended: []
    });

    const loadData = useCallback(async () => {
        try {
            const data = await ChiReadsScraper.getHome();
            setHomeData(data);
        } catch (error) {
            console.error('Failed to load home data', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const openLink = (url) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    // Style Helpers
    const containerStyle = [styles.container, { backgroundColor: theme.background }];
    const headerStyle = [styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }];
    const textStyle = { color: theme.text };

    const renderBookItem = ({ item }) => (
        <TouchableOpacity
            style={styles.bookItem}
            onPress={() => navigation.navigate('NovelDetail', { url: item.url, title: item.title })}
        >
            <Image source={{ uri: item.image }} style={styles.bookImage} />
            <Text style={[styles.bookTitle, textStyle]} numberOfLines={2}>{item.title}</Text>
        </TouchableOpacity>
    );

    const renderSection = (title, data) => {
        if (!data || data.length === 0) return null;
        return (
            <View style={styles.section}>
                <View style={[styles.sectionHeader, { backgroundColor: theme.sectionHeaderUser, borderLeftColor: theme.tint }]}>
                    <Text style={[styles.sectionTitle, textStyle]}>{title}</Text>
                </View>
                <FlatList
                    horizontal
                    data={data}
                    renderItem={renderBookItem}
                    keyExtractor={(item, index) => item.url + index}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                />
            </View>
        );
    };

    const renderLatestItem = ({ item }) => (
        <View style={[styles.latestItem, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
                style={styles.latestInfo}
                onPress={() => navigation.navigate('NovelDetail', { url: item.url, title: item.title })}
            >
                <Text style={[styles.latestTitle, textStyle]} numberOfLines={1}>{item.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.latestChapter}
                onPress={() => navigation.navigate('Reader', { url: item.latestChapter.url, title: item.latestChapter.title, novelUrl: item.url })}
            >
                <Text style={[styles.chapterText, { color: theme.tint }]} numberOfLines={1}>{item.latestChapter.title}</Text>
                <Text style={styles.dateText}>{item.latestChapter.date}</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={containerStyle}>
                <StatusBar barStyle={theme.statusBarStyle} />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            </SafeAreaView>
        );
    }

    const getThemeIcon = () => {
        if (themeMode === 'light') return "moon";
        if (themeMode === 'dark') return "book"; // Sepia trigger
        return "sunny"; // Sepia -> Light
    };

    return (
        <SafeAreaView style={containerStyle}>
            <StatusBar barStyle={theme.statusBarStyle} />
            <View style={headerStyle}>
                <Text style={[styles.headerTitle, { color: theme.tint }]}>ChiReaders</Text>

                <View style={styles.headerIcons}>
                    {/* Discord Icon */}
                    <TouchableOpacity onPress={() => openLink('https://discordapp.com/invite/mMDsVAa')} style={styles.iconButton}>
                        <FontAwesome5 name="discord" size={24} color={themeMode === 'dark' ? "#7289da" : "#5865F2"} />
                    </TouchableOpacity>

                    {/* Website Icon */}
                    <TouchableOpacity onPress={() => openLink('https://chireads.com/')} style={styles.iconButton}>
                        <FontAwesome5 name="globe" size={22} color={theme.text} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconButton}>
                        <Ionicons name="settings-outline" size={24} color={theme.text} />
                    </TouchableOpacity>

                    {/* Theme Toggle */}
                    <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
                        <Ionicons name={getThemeIcon()} size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.tint]} tintColor={theme.tint} />
                }
            >
                {/* En Vedette */}
                {renderSection('En Vedette', homeData.featured)}

                {/* Nouvelle Parution */}
                {renderSection('Nouvelle Parution', homeData.newReleases)}

                {/* Populaire */}
                {renderSection('Populaire', homeData.popular)}

                {/* Recommandé */}
                {renderSection('Recommandé', homeData.recommended)}

                {/* Dernières Mises à Jour */}
                {homeData.latest.length > 0 && (
                    <View style={styles.section}>
                        <View style={[styles.sectionHeader, { backgroundColor: theme.sectionHeaderUser, borderLeftColor: theme.tint }]}>
                            <Text style={[styles.sectionTitle, textStyle]}>Dernières Mises à Jour</Text>
                        </View>
                        <View style={styles.latestList}>
                            {homeData.latest.map((item, index) => (
                                <View key={index + item.url}>
                                    {renderLatestItem({ item })}
                                    {index < homeData.latest.length - 1 && <View style={[styles.separator, { backgroundColor: theme.border }]} />}
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <View style={{ height: 20 }} />
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
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        elevation: 2,
        paddingHorizontal: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        marginLeft: 5,
    },
    // Sections
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        paddingHorizontal: 15,
        marginBottom: 10,
        marginTop: 10,
        borderLeftWidth: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingLeft: 10,
    },
    horizontalList: {
        paddingHorizontal: 10,
    },
    bookItem: {
        width: 120,
        marginHorizontal: 5,
    },
    bookImage: {
        width: 120,
        height: 180,
        borderRadius: 8,
        backgroundColor: '#eee',
        marginBottom: 5,
    },
    bookTitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    // Latest
    latestList: {
        paddingHorizontal: 15,
    },
    latestItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent', // Handled by inline style
    },
    latestInfo: {
        marginBottom: 5,
    },
    latestTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    latestChapter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chapterText: {
        fontSize: 14,
        flex: 1,
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    separator: {
        height: 1,
    },
});

export default HomeScreen;
