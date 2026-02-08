import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorageContext } from '../context/StorageContext';
import { useTheme } from '../context/ThemeContext';
import BackupService from '../services/BackupService';

const SettingsScreen = ({ navigation }) => {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { settings, updateSettings, reloadData } = useContext(StorageContext);

    // Backup State
    const [backupFolder, setBackupFolder] = useState(null);
    const [isRestoring, setIsRestoring] = useState(false);

    useEffect(() => {
        checkBackupStatus();
    }, []);

    const checkBackupStatus = async () => {
        const folder = await BackupService.getBackupFolder();
        setBackupFolder(folder);
    };

    const handleConfigureBackup = async () => {
        console.log("handleConfigureBackup: Button clicked");
        try {
            if (!BackupService) {
                Alert.alert("Erreur", "Le service de sauvegarde n'est pas chargé.");
                return;
            }
            const uri = await BackupService.requestBackupFolder();
            if (uri) {
                setBackupFolder(uri);
                Alert.alert("Succès", "Dossier de sauvegarde configuré. Vos données seront sauvegardées automatiquement.");
            } else {
                Alert.alert("Information", "Aucun dossier n'a été sélectionné.");
            }
        } catch (e) {
            console.error("SettingsScreen: Backup config error", e);
            Alert.alert("Erreur", "Impossible de configurer le dossier.");
        }
    };

    const handleDisableBackup = async () => {
        await BackupService.clearBackupFolder();
        setBackupFolder(null);
    };

    const handleRestore = async () => {
        if (!backupFolder) {
            Alert.alert("Info", "Veuillez d'abord configurer un dossier.");
            return;
        }

        Alert.alert(
            "Restaurer les données",
            "Cela écrasera vos données actuelles avec celles de la dernière sauvegarde. Êtes-vous sûr ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Restaurer",
                    style: "destructive",
                    onPress: async () => {
                        setIsRestoring(true);
                        try {
                            const data = await BackupService.restoreFromBackup(backupFolder);
                            if (data) {
                                await reloadData(data); // We need to implement reloadData in Context
                                Alert.alert("Succès", "Données restaurées avec succès !");
                            } else {
                                Alert.alert("Erreur", "Aucun fichier de sauvegarde trouvé dans ce dossier.");
                            }
                        } catch (e) {
                            console.error(e);
                            Alert.alert("Erreur", "La restauration a échoué.");
                        } finally {
                            setIsRestoring(false);
                        }
                    }
                }
            ]
        );
    };

    // Helper Styles
    const containerStyle = [styles.container, { backgroundColor: theme.background }];
    const headerStyle = [styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }];
    const textStyle = { color: theme.text };
    const sectionTitleStyle = [styles.sectionTitle, { color: theme.tint }];
    const itemStyle = [styles.item, { backgroundColor: theme.card, borderColor: theme.border }];

    return (
        <SafeAreaView style={containerStyle}>
            <View style={headerStyle}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, textStyle]}>Paramètres</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>



                {/* Section Backup */}
                <Text style={sectionTitleStyle}>Sauvegarde & Synchronisation</Text>

                <View style={[itemStyle, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                    <Text style={[styles.itemTitle, textStyle, { marginBottom: 10 }]}>Sauvegarde Automatique</Text>

                    {backupFolder ? (
                        <>
                            <Text style={[styles.itemSubtitle, { color: 'green', marginBottom: 10 }]}>
                                ✅ Activé
                            </Text>
                            <Text style={[styles.pathText, { color: theme.textSecondary }]} numberOfLines={1} ellipsizeMode="middle">
                                {decodeURIComponent(backupFolder)}
                            </Text>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: '#e91e63' }]}
                                    onPress={handleDisableBackup}
                                >
                                    <Text style={styles.buttonText}>Désactiver</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: theme.tint }]}
                                    onPress={handleRestore}
                                    disabled={isRestoring}
                                >
                                    {isRestoring ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.buttonText}>Forcer Restauration</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={[styles.itemSubtitle, { color: theme.textSecondary, marginBottom: 15 }]}>
                                Configurez un dossier pour sauvegarder automatiquement vos favoris et votre progression.
                            </Text>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.tint, alignSelf: 'stretch' }]}
                                onPress={handleConfigureBackup}
                            >
                                <Text style={styles.buttonText}>Choisir un dossier de sauvegarde</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <Text style={[styles.version, { color: theme.textSecondary }]}>
                    Version 1.3.3
                </Text>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    item: {
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    itemSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    pathText: {
        fontSize: 10,
        marginBottom: 15,
        fontStyle: 'italic',
        width: '100%',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 5,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    version: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 12,
    }
});

export default SettingsScreen;
