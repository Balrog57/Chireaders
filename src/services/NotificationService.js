import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

/**
 * Service de gestion des notifications
 * Pour v1: notifications locales basiques
 * Pour v2 future: vérification automatique des nouveaux chapitres
 */

// Configuration du gestionnaire de notifications
if (Constants.appOwnership !== 'expo') {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });
}

/**
 * Demander les permissions de notifications
 * @returns {Promise<boolean>} True si permissions accordées
 */
export const requestNotificationPermissions = async () => {
    if (!Device.isDevice) {
        console.log('Les notifications ne fonctionnent que sur un appareil physique');
        return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Permissions de notification refusées');
        return false;
    }

    return true;
};

/**
 * Envoyer une notification locale immédiate
 * @param {string} title - Titre de la notification
 * @param {string} body - Corps de la notification
 * @param {Object} data - Données additionnelles (optionnel)
 */
export const sendLocalNotification = async (title, body, data = {}) => {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: null, // Immédiat
        });
    } catch (error) {
        console.error('Erreur envoi notification:', error);
    }
};

/**
 * Envoyer une notification pour un nouveau chapitre
 * @param {string} seriesTitle - Titre de la série
 * @param {string} chapterTitle - Titre du chapitre
 * @param {string} chapterUrl - URL du chapitre
 */
export const notifyNewChapter = async (seriesTitle, chapterTitle, chapterUrl) => {
    await sendLocalNotification(
        `${seriesTitle}`,
        `Nouveau chapitre: ${chapterTitle}`,
        { type: 'newChapter', url: chapterUrl }
    );
};

/**
 * Planifier une notification pour plus tard
 * @param {string} title - Titre
 * @param {string} body - Corps
 * @param {number} seconds - Délai en secondes
 * @param {Object} data - Données additionnelles
 */
export const scheduleNotification = async (title, body, seconds, data = {}) => {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: {
                seconds,
            },
        });
    } catch (error) {
        console.error('Erreur planification notification:', error);
    }
};

/**
 * Annuler toutes les notifications planifiées
 */
export const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Écouter les notifications reçues
 * @param {Function} callback - Fonction appelée quand une notification est reçue
 * @returns {Object} Subscription à nettoyer
 */
export const addNotificationReceivedListener = (callback) => {
    return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Écouter les interactions avec les notifications
 * @param {Function} callback - Fonction appelée quand l'utilisateur tape sur une notification
 * @returns {Object} Subscription à nettoyer
 */
export const addNotificationResponseListener = (callback) => {
    return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * NOTE: Vérification automatique des nouveaux chapitres
 * 
 * Pour implémenter la vérification en arrière-plan, il faudrait:
 * 1. Un backend qui scrape périodiquement chireads.com
 * 2. Envoyer des push notifications via Expo Push Notification service
 * 3. Ou utiliser Background Fetch pour vérifier localement (complexe avec WebView)
 * 
 * Pour v1, on garde juste la structure et les permissions.
 * La vérification peut être manuelle (bouton "Vérifier nouveaux chapitres" dans FavoritesScreen)
 */

export default {
    requestNotificationPermissions,
    sendLocalNotification,
    notifyNewChapter,
    scheduleNotification,
    cancelAllNotifications,
    addNotificationReceivedListener,
    addNotificationResponseListener
};
