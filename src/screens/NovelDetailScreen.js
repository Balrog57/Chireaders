import { Ionicons } from '@expo/vector-icons'; // Assure que @expo/vector-icons est installée
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StorageContext } from '../context/StorageContext';
import ChiReadsScraper from '../services/ChiReadsScraper';

const NovelDetailScreen = ({ route, navigation }) => {
    const { novelUrl, title } = route.params;
    const { isFavorite, toggleFavorite, history, settings } = useContext(StorageContext);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            const data = await ChiReadsScraper.getNovelDetails(novelUrl);
            setDetails(data);
            setLoading(false);
        };
        fetchDetails();
    }, [novelUrl]);

    // Header Right Button for Favorite
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => details && toggleFavorite({ url: novelUrl, title: details.title, cover: details.cover })} style={{ marginRight: 15 }}>
                    <Ionicons name={isFavorite(novelUrl) ? "heart" : "heart-outline"} size={24} color={isFavorite(novelUrl) ? "red" : settings.darkMode ? "white" : "black"} />
                </TouchableOpacity>
            ),
            title: title || 'Détails'
        });
    }, [navigation, isFavorite, novelUrl, details, settings.darkMode]);

    const theme = settings.darkMode ? styles.dark : styles.light;
    const textTheme = settings.darkMode ? styles.textDark : styles.textLight;

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, theme]}>
                <ActivityIndicator size="large" color="#e91e63" />
            </View>
        );
    }

    if (!details) {
        return (
            <View style={[styles.container, styles.centered, theme]}>
                <Text style={textTheme}>Erreur de chargement.</Text>
            </View>
        );
    }

    const renderChapter = ({ item }) => {
        const isRead = history[novelUrl] && history[novelUrl].chapterUrl === item.url;
        return (
            <TouchableOpacity
                style={[styles.chapterItem, settings.darkMode ? styles.chapterItemDark : styles.chapterItemLight]}
                onPress={() => navigation.navigate('Reader', { chapterUrl: item.url, novelUrl: novelUrl })}
            >
                <Text style={[styles.chapterTitle, isRead ? styles.readText : textTheme]}>
                    {item.title}
                </Text>
                {isRead && <Ionicons name="eye" size={16} color="#4caf50" />}
            </TouchableOpacity>
        );
    };

    return (
        <FlatList
            data={details.chapters}
            renderItem={renderChapter}
            keyExtractor={item => item.url}
            ListHeaderComponent={
                <View style={styles.headerContent}>
                    <View style={styles.topInfo}>
                        <Image source={{ uri: details.cover }} style={styles.cover} />
                        <View style={styles.meta}>
                            <Text style={[styles.novelTitle, textTheme]}>{details.title}</Text>
                            <Text style={[styles.synopsisLabel, textTheme]}>Synopsis:</Text>
                            <Text style={[styles.synopsis, textTheme]} numberOfLines={6}>{details.synopsis}</Text>
                        </View>
                    </View>
                    <Text style={[styles.chapterHeader, textTheme]}>Chapitres ({details.chapters.length})</Text>
                </View>
            }
            contentContainerStyle={[styles.listContent, theme]}
            style={[styles.container, theme]}
        />
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    light: { backgroundColor: '#fff' },
    dark: { backgroundColor: '#121212' },
    textLight: { color: '#000' },
    textDark: { color: '#ecf0f1' },

    headerContent: { padding: 15 },
    topInfo: { flexDirection: 'row', marginBottom: 20 },
    cover: { width: 120, height: 180, borderRadius: 5, backgroundColor: '#ccc' },
    meta: { flex: 1, marginLeft: 15 },
    novelTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    synopsisLabel: { fontWeight: 'bold', marginBottom: 5 },
    synopsis: { fontSize: 14, lineHeight: 20, color: '#666' },

    chapterHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },

    chapterItem: { paddingVertical: 12, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    chapterItemLight: { borderBottomColor: '#eee' },
    chapterItemDark: { borderBottomColor: '#333' },
    chapterTitle: { fontSize: 14 },
    readText: { color: '#4caf50' },

    listContent: { paddingBottom: 20 }
});

export default NovelDetailScreen;
