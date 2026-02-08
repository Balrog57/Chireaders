import axios from 'axios';
import * as Linking from 'expo-linking';
import packageJson from '../../package.json';

const GITHUB_API_URL = 'https://api.github.com/repos/Balrog57/Chireaders/releases/latest';
const CURRENT_VERSION = packageJson.version;

const UpdateService = {
    /**
     * Vérifie si une nouvelle version est disponible sur GitHub.
     * @returns {Promise<{ hasUpdate: boolean, latestVersion: string, downloadUrl: string, body: string }>}
     */
    async checkForUpdates() {
        try {
            const response = await axios.get(GITHUB_API_URL, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Chireaders-App'
                }
            });

            const latestRelease = response.data;
            const latestVersion = latestRelease.tag_name.replace('v', '');
            const downloadUrl = latestRelease.html_url;
            const body = latestRelease.body;

            // Comparaison simple de version (ex: 1.3.3 vs 1.3.4)
            const hasUpdate = this.isVersionNewer(CURRENT_VERSION, latestVersion);

            return {
                hasUpdate,
                latestVersion,
                downloadUrl,
                body
            };
        } catch (error) {
            console.error('UpdateService: Error checking for updates', error);
            throw error;
        }
    },

    /**
     * Compare deux chaînes de version.
     * @param {string} current 
     * @param {string} latest 
     * @returns {boolean} True si latest > current
     */
    isVersionNewer(current, latest) {
        const c = current.split('.').map(Number);
        const l = latest.split('.').map(Number);

        for (let i = 0; i < Math.max(c.length, l.length); i++) {
            const vC = c[i] || 0;
            const vL = l[i] || 0;
            if (vL > vC) return true;
            if (vL < vC) return false;
        }
        return false;
    },

    /**
     * Ouvre l'URL de téléchargement dans le navigateur.
     * @param {string} url 
     */
    async openDownloadPage(url) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            console.error("Don't know how to open URI: " + url);
        }
    }
};

export default UpdateService;
