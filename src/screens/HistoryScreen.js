import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { 
    FlatList,
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorageContext } from '../context/StorageContext';

const HistoryScreen = ({ navigation }) => {
    const { getAllHistory, settings } = useContext(StorageContext);
    const history = getAllHistory();
    
    const theme = settings.darkMode ? styles.dark : styles.light;

    const handleChapterPress = (chapter) => {
        // Naviguer vers le Browser avec l'URL du chapitre
        navigation.navigate('Browser', { initialUrl: chapter.url });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = diffInMs / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            const mins = Math.floor(diffInMs / (1000 * 60));
            return `Il y a ${mins} minute${mins > 1 ? 's' : ''}`;
        } else if (diffInHours < 24) {
            const hours = Math.floor(diffInHours);
            return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        } else if (diffInHours < 48) {
            return 'Hier';
        } else {
            return date.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    const renderHistoryItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={[styles.historyCard, settings.darkMode && styles.historyCardDark]}
                onPress={() => handleChapterPress(item)}
            >
                {/* En-tête avec icône et titre série */}
                <View style={styles.historyHeader}>
                    <Ionicons 
                        name="book-outline" 
                        size={20} 
                        color="#e91e63" 
                    />
                    <Text 
                        style={[styles.seriesTitle, settings.darkMode && styles.textDark]} 
                        numberOfLines={1}
                    >
                        {item.seriesTitle}
                    </Text>
                </View>
                
                {/* Titre du chapitre */}
                <Text 
                    style={[styles.chapterTitle, settings.darkMode && styles.textDark]}
                    numberOfLines={2}
                >
                    {item.title}
                </Text>
                
                {/* Date de lecture */}
                <View style={styles.dateContainer}>
                    <Ionicons 
                        name="time-outline" 
                        size={12} 
                        color={settings.darkMode ? '#999' : '#666'} 
                    />
                    <Text style={[styles.dateText, settings.darkMode && styles.subtitleDark]}>
                        {formatDate(item.dateRead)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, theme]}>
            {/* Header */}
            <View style={[styles.header, settings.darkMode && styles.headerDark]}>
                <Text style={styles.headerTitle}>Historique</Text>
                {history.length > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{history.length}</Text>
                    </View>
                )}
            </View>

            {/* Liste de l'historique */}
            <FlatList
                data={history}
                renderItem={renderHistoryItem}
                keyExtractor={(item, index) => `${item.url}-${index}`}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="time-outline" size={64} color="#ccc" />
                        <Text style={[styles.emptyText, settings.darkMode && styles.textDark]}>
                            Aucun historique de lecture
                        </Text>
                        <Text style={[styles.emptySubtext, settings.darkMode && styles.subtitleDark]}>
                            Les chapitres que vous lisez apparaîtront ici
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

    // Carte historique
    historyCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    historyCardDark: {
        backgroundColor: '#1a1a1a',
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    seriesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    chapterTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
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

export default HistoryScreen;
