import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://chireads.com';

const ChiReadsScraper = {
    /**
     * Récupère la page d'accueil avec les romans en vedette et populaires
     */
    getHome: async () => {
        try {
            const { data } = await axios.get(BASE_URL, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile)' }
            });
            const $ = cheerio.load(data);
            const featured = [];

            // Sélecteurs basés sur l'observation générale (à affiner si structure spécifique)
            // On cherche les liens dans les conteneurs principaux
            // En l'absence de structure précise, on prend les conteneurs d'images/liens de romans
            // Pour l'instant, on fait une extraction générique des liens "/category/"

            // Note: Nous devrons ajuster ces sélecteurs avec le retour visuel de l'app si ça ne matche pas.
            // On suppose une structure classique de blog/CMS

            // Exemple hypothétique de structure basée sur sites similaires
            // Vedette = slider ou section top
            // Populaire = sidebar ou section distincte

            // Extraction générique pour démarrer
            $('a[href*="/category/"]').each((i, el) => {
                const link = $(el).attr('href');
                const title = $(el).text().trim() || $(el).attr('title');
                const img = $(el).find('img').attr('src');

                if (link && !link.includes('page') && title) {
                    // Exclusion des pages de catégories racines
                    const isRootCategory = link.endsWith('/category/translatedtales/') ||
                        link.endsWith('/category/original/') ||
                        title === 'Traductions' ||
                        title === 'Original';

                    if ((link.includes('translatedtales') || link.includes('original')) && !isRootCategory) {
                        featured.push({
                            id: link,
                            title: title,
                            cover: img,
                            url: link
                        });
                    }
                }
            });

            // Déduplication
            const unique = [];
            const map = new Map();
            for (const item of featured) {
                if (!map.has(item.url)) {
                    map.set(item.url, true);
                    unique.push(item);
                }
            }

            return { featured: unique.slice(0, 5), popular: unique.slice(5, 15) };
        } catch (error) {
            console.error('Error scraper home:', error);
            return { featured: [], popular: [] };
        }
    },

    /**
     * Récupère les détails d'un roman
     */
    getNovelDetails: async (url) => {
        try {
            const { data } = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const $ = cheerio.load(data);

            const title = $('h1').first().text().trim();
            // On cherche l'image principale
            let cover = $('article img').first().attr('src') || $('div.content img').first().attr('src');
            if (!cover) cover = $('img').first().attr('src'); // fallback

            // Synopsis: souvent dans des <p> après le titre ou dans une div .entry-content
            // On concatène les paragraphes
            let synopsis = '';
            $('div.entry-content p, article p').each((i, el) => {
                const text = $(el).text().trim();
                if (text && !text.includes('chapitre')) synopsis += text + '\n\n';
            });

            // Chapitres
            const chapters = [];
            $('a').each((i, el) => {
                const href = $(el).attr('href');
                const text = $(el).text().trim();
                // Lien de chapitre contient souvent "chapitre" ou "chapter"
                if (href && (href.includes('chapitre-') || href.includes('chapter-'))) {
                    chapters.push({
                        id: href,
                        title: text,
                        url: href
                    });
                }
            });

            // Inverser si nécessaire (souvent plus récent en haut sur les blogs)
            // Pour un lecteur, on veut souvent du 1er au dernier, mais vérifions l'ordre.
            // On suppose l'ordre du DOM. Si c'est décroissant, on inversera dans l'UI.

            return {
                title,
                cover,
                synopsis,
                chapters
            };

        } catch (error) {
            console.error('Error detail:', error);
            return null;
        }
    },

    /**
     * Récupère le contenu d'un chapitre
     */
    getChapterContent: async (url) => {
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);

            const title = $('h1').text().trim();

            // Contenu texte
            // Souvent dans .entry-content ou article
            let content = '';
            // On essaie de cibler le contenu texte principal
            const contentContainer = $('.entry-content, article, .post-content').first();

            if (contentContainer.length) {
                // On nettoie les scripts, pubs, etc.
                contentContainer.find('script, style, .ads').remove();
                // On formate les paragraphes
                contentContainer.find('p').each((i, el) => {
                    content += $(el).text().trim() + '\n\n';
                });
            } else {
                // Fallback brut
                $('p').each((i, el) => {
                    content += $(el).text().trim() + '\n\n';
                });
            }

            // Navigation
            // Chercher liens "Précédent" "Suivant"
            let prev = null;
            let next = null;

            $('a').each((i, el) => {
                const t = $(el).text().toLowerCase();
                if (t.includes('précédent') || t.includes('precedent')) prev = $(el).attr('href');
                if (t.includes('suivant') || t.includes('next')) next = $(el).attr('href');
            });

            return { title, content, prev, next };

        } catch (error) {
            console.error('Error chapter:', error);
            return null;
        }
    }
};

export default ChiReadsScraper;
