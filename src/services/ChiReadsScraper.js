import axios from 'axios';
import * as cheerio from 'react-native-cheerio';

const BASE_URL = 'https://chireads.com';

const ChiReadsScraper = {
    /**
     * Récupère les données de la page d'accueil (Nouveautés et Populaires)
     */
    getHome: async () => {
        try {
            const response = await axios.get(BASE_URL, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            console.log('Scraper received HTML length:', response.data.length);
            console.log('Scraper HTML start:', response.data.substring(0, 100));
            const $ = cheerio.load(response.data);

            const featured = [];
            const latest = [];
            const newReleases = [];
            const popular = [];
            const recommended = [];

            // Helper to parse a standard book item
            const parseBookItem = (elem, selectorTitle, selectorUrl, selectorImage, selectorDesc = null) => {
                const title = $(elem).find(selectorTitle).text().trim();
                const url = $(elem).find(selectorUrl).attr('href');
                const image = $(elem).find(selectorImage).attr('src');
                const description = selectorDesc ? $(elem).find(selectorDesc).text().trim() : null;

                if (title && url) {
                    return { title, url, image, description };
                }
                return null;
            };

            // 1. En Vedette (Assumption: First .recommended-list, or check for specific container)
            // L'analyse montre que c'est la première liste .recommended-list
            $('.recommended-list').first().find('li').each((i, elem) => {
                const book = parseBookItem(elem, '.recommended-list-txt a', '.recommended-list-txt a', '.recommended-list-img img');
                if (book) featured.push(book);
            });

            // 2. Dernières mises à jour
            $('.dernieres-tabel table tr').each((i, elem) => {
                const seriesLink = $(elem).find('td').eq(0).find('a');
                const chapterLink = $(elem).find('td').eq(1).find('a');
                const dateLink = $(elem).find('td').eq(3).find('a');

                if (seriesLink.length > 0) {
                    latest.push({
                        title: seriesLink.text().trim(),
                        url: seriesLink.attr('href'),
                        latestChapter: {
                            title: chapterLink.text().trim(),
                            url: chapterLink.attr('href'),
                            date: dateLink.text().trim()
                        }
                    });
                }
            });

            // 3. Nouvelle Parution (Chercher Header "Nouvelle Parution" -> .news-list)
            let newsListContainer = null;
            $('.titre-section, h2, h3, div').each((i, elem) => {
                const txt = $(elem).text().trim();
                if (txt === 'Nouvelle Parution' || txt.includes('Nouvelle Parution')) {
                    // Le conteneur .news-list est souvent le frère ou dans le parent suivant
                    // D'après l'analyse, c'est .news-list
                    newsListContainer = $(elem).next('.news-list');
                    if (newsListContainer.length === 0) {
                        // Fallback: chercher dans le parent si le header est wrapper
                        newsListContainer = $(elem).parent().find('.news-list');
                    }
                    if (newsListContainer.length === 0) {
                        // Fallback siblings lookup
                        newsListContainer = $(elem).parent().next().find('.news-list');
                        if (newsListContainer.length === 0) newsListContainer = $(elem).next(); // Simple next
                    }
                    return false; // Break
                }
            });
            // Fallback general si non trouvé via header
            if (!newsListContainer || newsListContainer.length === 0) newsListContainer = $('.news-list').first();

            newsListContainer.find('li').each((i, elem) => {
                // Selectors updated based on previous "Original" logic which worked for this class
                const book = parseBookItem(elem, '.news-list-tit h5 a', '.news-list-tit h5 a', '.news-list-img img', '.news-list-txt');
                if (book) newReleases.push(book);
            });


            // 4. Populaire (Header "Populaire" -> .recommended-list)
            $('div.title, h2, h3').each((i, elem) => {
                if ($(elem).text().trim().includes('Populaire')) {
                    const list = $(elem).next('.recommended-list');
                    list.find('li').each((j, item) => {
                        const book = parseBookItem(item, '.recommended-list-txt a', '.recommended-list-txt a', '.recommended-list-img img');
                        if (book) popular.push(book);
                    });
                }
            });

            // 5. Recommandé (.recommended li)
            $('.recommended li').each((i, elem) => {
                // Les sélecteurs semblent similaires aux autres listes recommandées ?
                // L'analyse montre: .recommended-list style items
                // On va tenter les mêmes sélecteurs génériques ou inspecter
                // Souvent c'est: titre dans a, img dans img.
                const title = $(elem).find('a').last().text().trim() || $(elem).text().trim(); // Fallback
                const url = $(elem).find('a').first().attr('href');
                const image = $(elem).find('img').attr('src');
                // Note: L'analyse montre titre 'Super Gène' etc.
                // Le markup exact n'est pas 100% visible mais on devine 'a' et 'img'.

                // Amélioration basée sur l'expérience Chireads:
                // .recommended li souvent contient .recommended-img et .recommended-txt
                let refinedTitle = $(elem).find('.recommended-txt a, .recommended-list-txt a, h3, h4').text().trim();
                if (!refinedTitle) refinedTitle = $(elem).find('a').last().text().trim();

                if (refinedTitle && url) {
                    recommended.push({ title: refinedTitle, url, image });
                }
            });

            return {
                featured,
                latest,
                newReleases,
                popular,
                recommended
            };
        } catch (error) {
            console.error('Error scraping home:', error);
            return { featured: [], latest: [], newReleases: [], popular: [], recommended: [] };
        }
    },

    /**
     * Récupère les détails d'un livre (Info + Chapitres)
     * @param {string} novelUrl 
     */
    getNovelDetails: async (novelUrl) => {
        try {
            const response = await axios.get(novelUrl);
            const $ = cheerio.load(response.data);


            const title = $('.inform-title').text().trim();
            const image = $('.inform-product img').attr('src');
            const author = $('.inform-inform-data h6').text().trim(); // Ou parsing plus fin si besoin
            let description = $('.inform-txt-show span').text().trim();

            // Si description vide, fallback
            if (!description) {
                description = $('.inform-txt-show').text().trim();
            }

            let chapters = [];
            // Chapter List Logic
            // Based on debug analysis, chapters are often in .chapitre li, or .volume-content li, or .segment-content li (accordions)
            // We combine them all.
            let chapterItems = $('.chapitre li, .volume-content li, .chapitre-table li, .segment-content li');

            // Remove debug logs (or keep minimal if needed)
            // console.log('Scraper DBG: Items found:', chapterItems.length);

            // Deduplicate logic might be needed if selectors overlap, but usually they are distinct containers from different themes.
            // We'll rely on the fact that usually only one type exists, or if multiple exist, they are distinct segments.

            chapterItems.each((i, elem) => {
                const link = $(elem).find('a').first();
                const chapterTitle = link.text().trim();
                const chapterUrl = link.attr('href');

                if (chapterTitle && chapterUrl) {
                    chapters.push({
                        title: chapterTitle,
                        url: chapterUrl,
                        date: '' // Date often not available in this list view
                    });
                }
            });

            // Reverse if needed (sometimes oldest first) - usually new to old logic applies
            // Only reverse if user wants oldest first, but standard is newest first for updates, 
            // oldest first for reading. Usually sites list Oldest -> Newest. 
            // We'll keep as is (scraped order).

            // Fix absolute URLs
            chapters = chapters.map(ch => ({
                ...ch,
                url: ch.url.startsWith('http') ? ch.url : `${BASE_URL}${ch.url}`
            }));
            // Fix sorting: The site often lists chapters in columns (1, 4, 7... 2, 5, 8...), 
            // so scraping in DOM order results in interleaved chapters.
            // We must sort by chapter number.
            const extractChapterNumber = (title) => {
                // Match "Chapitre 123" or "Ch. 123" or "123" at start
                const match = title.match(/(?:chapitre|ch|chapter|no)\.?\s*(\d+(\.\d+)?)/i);
                if (match) return parseFloat(match[1]);
                return -1; // Fallback for prologues etc
            };

            chapters.sort((a, b) => {
                const numA = extractChapterNumber(a.title);
                const numB = extractChapterNumber(b.title);

                // If both have numbers, sort by number
                if (numA !== -1 && numB !== -1) {
                    return numA - numB;
                }
                // If only one, prioritize number? Or keep order?
                // Usually prologue (no number) comes before Chap 1.
                // So -1 should be considered smaller? 
                // Let's assume -1 means "Prologue" or "Intro", likely smaller.
                // But if "Epilogue", it should be larger.
                // Complex. Let's just sort known numbers and leave others stable-ish relative to them?
                // Actually, if we just subtract, -1 - 1 = -2 (Prologue first).
                // 1 - (-1) = 2 (Prologue first).

                // However, let's look at "Chapitre 1".
                // If we have mixed content, maybe just rely on numbers if available.
                return numA - numB;
            });

            return {
                title,
                image,
                author,
                description,
                chapters
            };
        } catch (error) {
            console.error('Error scraping details:', error);
            return null;
        }
    },

    /**
     * Récupère le contenu d'un chapitre
     * @param {string} chapterUrl 
     */
    getChapterContent: async (chapterUrl) => {
        try {
            const response = await axios.get(chapterUrl);
            const $ = cheerio.load(response.data);

            const title = $('.article-title').text().trim();

            const paragraphs = [];
            $('#content p').each((i, elem) => {
                const text = $(elem).text().trim();
                // Avoid empty lines if possible
                if (text) paragraphs.push(text);
            });

            // Navigation (Chapitre précédent / suivant)
            // Utilisation des index fixes observés: 0 = Prev, 2 = Next
            const navLinks = $('.article-function').first().find('a');
            let prevUrl = navLinks.eq(0).attr('href');
            let nextUrl = navLinks.eq(2).attr('href');

            // Si prevUrl est "#", c'est qu'il n'y a pas de chapitre précédent
            if (prevUrl === '#') prevUrl = null;

            return {
                title,
                content: paragraphs,
                html: $('#content').html(),
                prevUrl,
                nextUrl
            };
        } catch (error) {
            console.error('Error scraping chapter:', error);
            return null;
        }
    },

    /**
     * Récupère tous les livres (pour la bibliothèque)
     * Peut nécessiter une pagination
     */
    /**
     * Récupère tous les livres (pour la bibliothèque)
     * @param {number} page
     * @param {string} category 'translatedtales' ou 'original'
     */
    getAllBooks: async (page = 1, category = 'translatedtales') => {
        try {
            const url = `${BASE_URL}/category/${category}/page/${page}/`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const $ = cheerio.load(response.data);

            const books = [];

            // Updated selector based on deep analysis (same as news-list items)
            // 'article' was wrong. It is likely a standard .news-list or similar structure.
            // Analysis showed images inside div.news-list-img inside li.
            // So we select keys based on that.

            // Check for list items regardless of container class if specific class fails, 
            // but .news-list li is the strong candidate.
            let items = $('.news-list li');

            // Defines fallback if .news-list is not found directly (e.g. if it uses a different wrapper)
            if (items.length === 0) {
                items = $('.main-col li'); // Fallback to main column list items
            }

            items.each((i, elem) => {
                const titleElem = $(elem).find('.news-list-tit h5 a, h2 a, h3 a, .entry-title a').first();
                const title = titleElem.text().trim();
                const url = titleElem.attr('href') || $(elem).find('a').first().attr('href');
                const image = $(elem).find('.news-list-img img, img').first().attr('src');
                const description = $(elem).find('.news-list-txt, .entry-content').text().trim();

                if (title && url) {
                    books.push({ title, url, image, description });
                }
            });

            return books;
        } catch (error) {
            console.error(`Error scraping library (${category}):`, error);
            return [];
        }
    }
};

export default ChiReadsScraper;
