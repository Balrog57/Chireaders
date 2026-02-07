import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorageContext } from '../context/StorageContext';
import { useTheme } from '../context/ThemeContext';

const FavoritesScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const {
        favorites,
        removeFavorite,
        getSeriesProgress,
        toggleFavoriteNotification,
        settings
    } = useContext(StorageContext);

    // const theme = settings.darkMode ? styles.dark : styles.light; // Replaced by global theme context

    const handleFavoritePress = (favorite) => {
        // Naviguer vers le Détail Natif
        navigation.navigate('NovelDetail', {
            url: favorite.url,
            title: favorite.title
        });
    };

    const handleDeletePress = (favorite) => {
        Alert.alert(
            'Retirer des favoris',
            `Voulez-vous retirer "${favorite.title}" de vos favoris ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Retirer',
                    style: 'destructive',
                    onPress: () => removeFavorite(favorite.url)
                }
            ]
        );
    };

    const renderFavoriteItem = ({ item }) => {
        const progress = getSeriesProgress(item.url);
        const lastChapter = item.lastChapterRead;

        return (
            <TouchableOpacity
                style={[styles.favoriteCard, { backgroundColor: theme.card }]}
                onPress={() => handleFavoritePress(item)}
            >
                {/* En-tête avec titre et bouton supprimer */}
                <View style={styles.favoriteHeader}>
                    <Text style={[styles.favoriteTitle, { color: theme.text }]} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                            onPress={() => toggleFavoriteNotification(item.url)}
                            style={[styles.deleteButton, { marginRight: 5 }]}
                        >
                            <Ionicons
                                name={item.notificationsEnabled ? "notifications" : "notifications-off-outline"}
                                size={22}
                                color={item.notificationsEnabled ? theme.tint : theme.text}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleDeletePress(item)}
                            style={styles.deleteButton}
                        >
                            <Ionicons name="trash-outline" size={22} color="#e91e63" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Dernier chapitre lu */}
                {lastChapter && (
                    <View style={styles.lastChapterContainer}>
                        <Ionicons name="bookmark" size={14} color="#4caf50" />
                        <Text style={[styles.lastChapterText, { color: theme.text }]} numberOfLines={1}>
                            {lastChapter.title}
                        </Text>
                    </View>
                )}

                {/* Progression */}
                <View style={styles.progressContainer}>
                    <Ionicons name="book-outline" size={14} color={theme.text} />
                    <Text style={[styles.progressText, { color: theme.text }]}>
                        {progress.length} chapitre{progress.length > 1 ? 's' : ''} lu{progress.length > 1 ? 's' : ''}
                    </Text>
                </View>

                {/* Date d'ajout */}
                <Text style={[styles.dateText, { color: theme.text }]}>
                    Ajouté le {new Date(item.dateAdded).toLocaleDateString('fr-FR')}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <Text style={styles.headerTitle}>Favoris</Text>
                <View style={[styles.badge, { backgroundColor: theme.tint }]}>
                    <Text style={styles.badgeText}>{favorites.length}</Text>
                </View>
            </View>

            {/* Liste des favoris */}
            <FlatList
                data={favorites}
                renderItem={renderFavoriteItem}
                keyExtractor={(item) => item.url}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="heart-outline" size={64} color="#ccc" />
                        <Text style={[styles.emptyText, { color: theme.text }]}>
                            Aucune série favorite
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.text }]}>
                            Appuyez sur le coeur sur une page série pour l'ajouter
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    light: {
        backgroundColor: '#f5f5f5',
    },
    dark: {
        backgroundColor: '#121212',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerDark: {
        backgroundColor: '#1a1a1a',
        borderBottomColor: '#333',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#e91e63',
        marginRight: 10,
    },
    badge: {
        backgroundColor: '#e91e63',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },

    // Liste
    listContent: {
        padding: 15,
    },

    // Carte favori
    favoriteCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    favoriteCardDark: {
        backgroundColor: '#1a1a1a',
    },
    favoriteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    favoriteTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    deleteButton: {
        padding: 5,
    },

    lastChapterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    lastChapterText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 6,
        flex: 1,
    },

    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    progressText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
    },

    dateText: {
        fontSize: 12,
        color: '#999',
    },

    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999',
        marginTop: 15,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },

    // Thème
    textDark: {
        color: '#ecf0f1',
    },
    subtitleDark: {
        color: '#999',
    },
});

export default FavoritesScreen;
