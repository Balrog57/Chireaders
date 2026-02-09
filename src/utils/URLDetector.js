/**
 * Utilitaire pour détecter les types de pages sur chireads.com
 * et extraire les informations pertinentes
 */

// Regex patterns pour détecter les types de pages
export const URL_PATTERNS = {
  // Page d'une série: https://chireads.com/category/translatedtales/super-gene/
  series: /\/category\/translatedtales\/([^\/]+)\/?$/,
  
  // Page d'un chapitre: https://chireads.com/translatedtales/super-gene/chapitre-1-.../
  chapter: /\/translatedtales\/([^\/]+)\/(chapitre-[^\/]+)/,
  
  // Page d'accueil
  home: /^https:\/\/chireads\.com\/?$/,
  
  // Catégorie (liste des séries)
  category: /\/category\/translatedtales\/?$/
};

/**
 * Détecte le type de page et extrait les données pertinentes
 * @param {string} url - L'URL à analyser
 * @returns {Object} Objet contenant le type et les données extraites
 */
export const detectPageType = (url) => {
  if (!url) return { type: 'unknown' };
  
  // Test série
  if (URL_PATTERNS.series.test(url)) {
    const match = url.match(URL_PATTERNS.series);
    return {
      type: 'series',
      seriesSlug: match[1],
      seriesUrl: url
    };
  }
  
  // Test chapitre
  if (URL_PATTERNS.chapter.test(url)) {
    const match = url.match(URL_PATTERNS.chapter);
    // Reconstituer l'URL de la série
    const seriesUrl = `https://chireads.com/category/translatedtales/${match[1]}/`;
    return {
      type: 'chapter',
      seriesSlug: match[1],
      chapterSlug: match[2],
      seriesUrl: seriesUrl,
      chapterUrl: url
    };
  }
  
  // Test catégorie
  if (URL_PATTERNS.category.test(url)) {
    return { type: 'category' };
  }
  
  // Test accueil
  if (URL_PATTERNS.home.test(url)) {
    return { type: 'home' };
  }
  
  return { type: 'other' };
};

/**
 * Convertit un slug en titre formaté
 * Exemple: "super-gene" → "Super Gene"
 * @param {string} slug - Le slug à convertir
 * @returns {string} Le titre formaté
 */
export const slugToTitle = (slug) => {
  if (!slug) return '';
  
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Extrait le numéro de chapitre depuis un slug
 * Exemple: "chapitre-42-titre" → "42"
 * @param {string} chapterSlug - Le slug du chapitre
 * @returns {string|null} Le numéro du chapitre ou null
 */
export const extractChapterNumber = (chapterSlug) => {
  if (!chapterSlug) return null;
  
  const match = chapterSlug.match(/chapitre-(\d+)/);
  return match ? match[1] : null;
};

/**
 * Vérifie si une URL est valide pour chireads.com
 * @param {string} url - L'URL à vérifier
 * @returns {boolean} True si l'URL est valide
 */
export const isValidChiReadsUrl = (url) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    // Strict hostname check
    return parsed.hostname === 'chireads.com' && parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

export default {
  URL_PATTERNS,
  detectPageType,
  slugToTitle,
  extractChapterNumber,
  isValidChiReadsUrl
};
