import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorageContext } from '../context/StorageContext';
import ChiReadsScraper from '../services/ChiReadsScraper';

const HomeScreen = ({ navigation }) => {
    const { favorites, settings } = useContext(StorageContext);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ featured: [], popular: [] });
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const loadData = async () => {
        setError(null);
        try {
            const result = await ChiReadsScraper.getHome();
            // Si le résultat est vide malgré le succès apparent (cas du scraper qui catch l'erreur interne)
            if (result.featured.length === 0 && result.popular.length === 0) {
                // On vérifie si on est sur le web, car c'est souvent CORS
                if (Platform.OS === 'web') {
                    throw new Error("Sur navigateur Web, le scraping est bloqué par la sécurité (CORS). Veuillez tester sur un émulateur Android ou via Expo Go sur votre téléphone.");
                } else {
                    throw new Error("Aucune donnée récupérée. Le site a peut-être changé ou est inaccessible.");
                }
            }
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const theme = settings.darkMode ? styles.dark : styles.light;
    const textTheme = settings.darkMode ? styles.textDark : styles.textLight;

    const renderNovelItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.novelItem, settings.darkMode ? styles.novelItemDark : styles.novelItemLight]}
            onPress={() => navigation.navigate('NovelDetail', { novelUrl: item.url, title: item.title })}
        >
            <Image source={{ uri: item.cover }} style={styles.cover} />
            <View style={styles.info}>
                <Text style={[styles.title, textTheme]} numberOfLines={2}>{item.title}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View>
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Button title="Réessayer" onPress={loadData} color="#e91e63" />
                </View>
            )}

            {favorites.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, textTheme]}>Favoris</Text>
                    <FlatList
                        horizontal
                        data={favorites}
                        renderItem={renderNovelItem}
                        keyExtractor={item => item.url}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                    />
                </View>
            )}

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, textTheme]}>En Vedette</Text>
                {data.featured.length > 0 ? (
                    <FlatList
                        horizontal
                        data={data.featured}
                        renderItem={renderNovelItem}
                        keyExtractor={item => item.url}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                    />
                ) : (
                    !loading && !error && <Text style={[styles.emptyText, textTheme]}>Aucun roman en vedette trouvé.</Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, textTheme]}>Populaires / Récents</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, theme]}>
                <ActivityIndicator size="large" color="#e91e63" />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, theme]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, textTheme]}>ChiReader</Text>
            </View>
            <FlatList
                data={data.popular}
                renderItem={renderNovelItem}
                keyExtractor={item => item.url}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={settings.darkMode ? '#fff' : '#000'} />
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    light: { backgroundColor: '#f5f5f5' },
    dark: { backgroundColor: '#121212' },
    textLight: { color: '#000' },
    textDark: { color: '#ecf0f1' },

    header: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#e91e63' },

    section: { marginTop: 20, marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15, marginBottom: 10 },

    horizontalList: { paddingHorizontal: 15 },

    novelItem: { marginRight: 15, width: 100, marginBottom: 15 },
    novelItemLight: {},
    novelItemDark: {},

    // Pour la liste verticale populaire (reusing same component visually but logic might differ if wanted)
    // Ici on use le même item style pour simplicité, mais dans FlatList vertical on peut vouloir row.
    // Pour l'instant on garde le style "carte" simple.

    cover: { width: 100, height: 150, borderRadius: 5, backgroundColor: '#ccc' },
    info: { marginTop: 5 },
    title: { fontSize: 12, fontWeight: '600' },

    listContent: { paddingBottom: 20 },

    errorContainer: { margin: 20, padding: 15, backgroundColor: '#ffebee', borderRadius: 8, alignItems: 'center' },
    errorText: { color: '#c62828', textAlign: 'center', marginBottom: 10 },
    emptyText: { marginHorizontal: 15, fontStyle: 'italic', opacity: 0.7 }
});

export default HomeScreen;
