/**
 * Valide les données de sauvegarde avant de les appliquer.
 * @param {Object} data - Les données restaurées
 * @returns {{ isValid: boolean, error: string|null }}
 */
export const validateBackupData = (data) => {
    if (!data || typeof data !== 'object') {
        return { isValid: false, error: "Les données de sauvegarde sont invalides (format incorrect)." };
    }

    // 1. Validate Favorites (must be array of objects with url/title)
    if (data.favorites !== undefined) {
        if (!Array.isArray(data.favorites)) {
            return { isValid: false, error: "La liste des favoris est corrompue." };
        }
        for (const item of data.favorites) {
            if (!item || typeof item !== 'object') {
                return { isValid: false, error: "Un élément des favoris est invalide." };
            }
            if (!item.url || typeof item.url !== 'string') {
                return { isValid: false, error: "Un favori manque d'URL valide." };
            }
            if (!item.title || typeof item.title !== 'string') {
                return { isValid: false, error: "Un favori manque de titre valide." };
            }
        }
    }

    // 2. Validate ReadChapters (must be object, keys are strings, values are arrays)
    if (data.readChapters !== undefined) {
        if (!data.readChapters || typeof data.readChapters !== 'object' || Array.isArray(data.readChapters)) {
            return { isValid: false, error: "L'historique de lecture est corrompu." };
        }
        for (const key in data.readChapters) {
            if (!Array.isArray(data.readChapters[key])) {
                return { isValid: false, error: `L'historique pour ${key} est invalide.` };
            }
            // Optional deep check: items inside array must be objects with url
            for (const ch of data.readChapters[key]) {
                 if (!ch || typeof ch !== 'object' || !ch.url) {
                     return { isValid: false, error: `Un chapitre lu pour ${key} est invalide.` };
                 }
            }
        }
    }

    // 3. Validate Settings (must be object)
    if (data.settings !== undefined) {
        if (!data.settings || typeof data.settings !== 'object' || Array.isArray(data.settings)) {
            return { isValid: false, error: "Les paramètres sont corrompus." };
        }
    }

    return { isValid: true, error: null };
};
