import axios from 'axios';
import * as cheerio from 'react-native-cheerio';
import { isValidChiReadsUrl } from '../utils/URLDetector';

const BASE_URL = 'https://chireads.com';
const TIMEOUT = 15000; // 15 seconds timeout
const MAX_CONTENT_LENGTH = 5 * 1024 * 1024; // 5MB max response size
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

// Secure Axios Instance
const client = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    maxContentLength: MAX_CONTENT_LENGTH,
    headers: {
        'User-Agent': USER_AGENT
    }
});

/**
 * Helper to ensure URLs are secure (HTTPS) and belong to the correct domain.
 * Prevents Open Redirects and Downgrade Attacks.
 */
const getSafeUrl = (url) => {
    if (!url) return null;
    let safeUrl = url.trim();

    // Handle relative URLs
    if (!safeUrl.startsWith('http')) {
        if (!safeUrl.startsWith('/')) safeUrl = '/' + safeUrl;
        safeUrl = `${BASE_URL}${safeUrl}`;
    }

    // Enforce HTTPS
    if (safeUrl.startsWith('http:')) {
        safeUrl = safeUrl.replace(/^http:/, 'https:');
    }

    // Domain Check - Ensure we only scrape chireads.com
    // Use robust URL validation
    if (!isValidChiReadsUrl(safeUrl)) {
        return null;
    }

    return safeUrl;
};

const ChiReadsScraper = {
    /**
     * Récupère les données de la page d'accueil (Nouveautés et Populaires)
     */
    getHome: async () => {
        try {
            const response = await client.get('/');
            // console.log('Scraper received HTML length:', response.data.length);
            const $ = cheerio.load(response.data);

            const featured = [];
            const latest = [];
            const newReleases = [];
            const popular = [];
            const recommended = [];

            // Helper to parse a standard book item
            const parseBookItem = (elem, selectorTitle, selectorUrl, selectorImage, selectorDesc = null) => {
                const title = $(elem).find(selectorTitle).text().trim();
                const rawUrl = $(elem).find(selectorUrl).attr('href');
                const image = $(elem).find(selectorImage).attr('src');
                const description = selectorDesc ? $(elem).find(selectorDesc).text().trim() : null;

                const safeUrl = getSafeUrl(rawUrl);

                if (title && safeUrl) {
                    return { title, url: safeUrl, image, description };
                }
                return null;
            };

            // 1. En Vedette
            $('.recommended-list').first().find('li').each((i, elem) => {
                const book = parseBookItem(elem, '.recommended-list-txt a', '.recommended-list-txt a', '.recommended-list-img img');
                if (book) featured.push(book);
            });

            // 2. Dernières mises à jour
            $('.dernieres-tabel table tr').each((i, elem) => {
                const seriesLink = $(elem).find('td').eq(0).find('a');
                const chapterLink = $(elem).find('td').eq(1).find('a');
                const dateLink = $(elem).find('td').eq(3).find('a');

                const safeSeriesUrl = getSafeUrl(seriesLink.attr('href'));
                const safeChapterUrl = getSafeUrl(chapterLink.attr('href'));

                if (seriesLink.length > 0 && safeSeriesUrl) {
                    latest.push({
                        title: seriesLink.text().trim(),
                        url: safeSeriesUrl,
                        latestChapter: {
                            title: chapterLink.text().trim(),
                            url: safeChapterUrl, // safeChapterUrl might be null, but usually valid relative
                            date: dateLink.text().trim()
                        }
                    });
                }
            });

            // 3. Nouvelle Parution
            let newsListContainer = null;
            $('.titre-section, h2, h3, div').each((i, elem) => {
                const txt = $(elem).text().trim();
                if (txt === 'Nouvelle Parution' || txt.includes('Nouvelle Parution')) {
                    newsListContainer = $(elem).next('.news-list');
                    if (newsListContainer.length === 0) {
                        newsListContainer = $(elem).parent().find('.news-list');
                    }
                    if (newsListContainer.length === 0) {
                        newsListContainer = $(elem).parent().next().find('.news-list');
                        if (newsListContainer.length === 0) newsListContainer = $(elem).next();
                    }
                    return false;
                }
            });
            if (!newsListContainer || newsListContainer.length === 0) newsListContainer = $('.news-list').first();

            newsListContainer.find('li').each((i, elem) => {
                const book = parseBookItem(elem, '.news-list-tit h5 a', '.news-list-tit h5 a', '.news-list-img img', '.news-list-txt');
                if (book) newReleases.push(book);
            });


            // 4. Populaire
            $('div.title, h2, h3').each((i, elem) => {
                if ($(elem).text().trim().includes('Populaire')) {
                    const list = $(elem).next('.recommended-list');
                    list.find('li').each((j, item) => {
                        const book = parseBookItem(item, '.recommended-list-txt a', '.recommended-list-txt a', '.recommended-list-img img');
                        if (book) popular.push(book);
                    });
                }
            });

            // 5. Recommandé
            $('.recommended li').each((i, elem) => {
                const rawUrl = $(elem).find('a').first().attr('href');
                const image = $(elem).find('img').attr('src');
                let refinedTitle = $(elem).find('.recommended-txt a, .recommended-list-txt a, h3, h4').text().trim();
                if (!refinedTitle) refinedTitle = $(elem).find('a').last().text().trim();

                const safeUrl = getSafeUrl(rawUrl);

                if (refinedTitle && safeUrl) {
                    recommended.push({ title: refinedTitle, url: safeUrl, image });
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
            console.error('Error scraping home:', error.message);
            return { featured: [], latest: [], newReleases: [], popular: [], recommended: [] };
        }
    },

    /**
     * Récupère les détails d'un livre (Info + Chapitres)
     * @param {string} novelUrl 
     */
    getNovelDetails: async (novelUrl) => {
        try {
            const safeNovelUrl = getSafeUrl(novelUrl);
            if (!safeNovelUrl) throw new Error('Invalid novel URL');

            const response = await client.get(safeNovelUrl);
            const $ = cheerio.load(response.data);

            const title = $('.inform-title').text().trim();
            const image = $('.inform-product img').attr('src');
            const author = $('.inform-inform-data h6').text().trim();
            let description = $('.inform-txt-show span').text().trim();

            if (!description) {
                description = $('.inform-txt-show').text().trim();
            }

            let chapters = [];
            let chapterLinks = $('.chapitre li a, .volume-content li a, .chapitre-table li a, .segment-content li a');

            const extractChapterNumber = (title) => {
                const keywordMatch = title.match(/(?:chapitre|ch|chapter|no|épisode|volume)\.?\s*(\d+(\.\d+)?)/i);
                if (keywordMatch) return parseFloat(keywordMatch[1]);

                const startMatch = title.match(/^\s*(\d+(\.\d+)?)\s*(?:-|:|–|\.)\s+/);
                if (startMatch) return parseFloat(startMatch[1]);

                const exactNumMatch = title.match(/^\s*(\d+(\.\d+)?)\s*$/);
                if (exactNumMatch) return parseFloat(exactNumMatch[1]);

                return -1;
            };

            chapterLinks.each((i, elem) => {
                const link = $(elem);
                const chapterTitle = link.text().trim();
                const rawChapterUrl = link.attr('href');
                const safeChapterUrl = getSafeUrl(rawChapterUrl);

                if (chapterTitle && safeChapterUrl) {
                    chapters.push({
                        title: chapterTitle,
                        url: safeChapterUrl,
                        date: '',
                        number: extractChapterNumber(chapterTitle)
                    });
                }
            });

            chapters.sort((a, b) => {
                const numA = a.number;
                const numB = b.number;
                if (numA !== -1 && numB !== -1) return numA - numB;
                return 0;
            });

            return {
                title,
                image,
                author,
                description,
                chapters
            };
        } catch (error) {
            console.error('Error scraping details:', error.message);
            return null;
        }
    },

    /**
     * Récupère le contenu d'un chapitre
     * @param {string} chapterUrl 
     */
    getChapterContent: async (chapterUrl) => {
        try {
            const safeChapterUrl = getSafeUrl(chapterUrl);
            if (!safeChapterUrl) throw new Error('Invalid chapter URL');

            const response = await client.get(safeChapterUrl);
            const $ = cheerio.load(response.data);

            const title = $('.article-title').text().trim();

            const paragraphs = [];
            $('#content p').each((i, elem) => {
                const text = $(elem).text().trim();
                if (text) paragraphs.push(text);
            });

            const navLinks = $('.article-function').first().find('a');
            let prevUrlRaw = navLinks.eq(0).attr('href');
            let nextUrlRaw = navLinks.eq(2).attr('href');

            if (prevUrlRaw === '#') prevUrlRaw = null;

            return {
                title,
                content: paragraphs,
                // html: removed to prevent XSS risk if used improperly
                prevUrl: getSafeUrl(prevUrlRaw),
                nextUrl: getSafeUrl(nextUrlRaw)
            };
        } catch (error) {
            console.error('Error scraping chapter:', error.message);
            return null;
        }
    },

    /**
     * Recherche de livres
     * @param {string} query
     */
    search: async (query) => {
        try {
            const searchUrl = `/?s=${encodeURIComponent(query)}`;
            const response = await client.get(searchUrl);
            const $ = cheerio.load(response.data);
            const books = [];

            $('.news-list li, .search-list li, .main-col li').each((i, elem) => {
                const titleElem = $(elem).find('.news-list-tit h5 a, h2 a, h3 a, .entry-title a').first();
                const title = titleElem.text().trim();
                const rawUrl = titleElem.attr('href') || $(elem).find('a').first().attr('href');
                const image = $(elem).find('img').first().attr('src');
                const description = $(elem).find('.news-list-txt, .entry-content').text().trim();

                const safeUrl = getSafeUrl(rawUrl);

                if (title && safeUrl && !safeUrl.includes('/chapitre-')) {
                    books.push({ title, url: safeUrl, image, description });
                }
            });

            const filteredBooks = books.filter(book =>
                book.title.toLowerCase().includes(query.toLowerCase())
            );

            return filteredBooks;
        } catch (error) {
            console.error('Error searching:', error.message);
            return [];
        }
    },

    /**
     * Récupère tous les livres (pour la bibliothèque)
     * @param {number} page
     * @param {string} category 'translatedtales' ou 'original'
     */
    getAllBooks: async (page = 1, category = 'translatedtales') => {
        try {
            const url = `/category/${category}/page/${page}/`;
            const response = await client.get(url);
            const $ = cheerio.load(response.data);

            const books = [];

            let items = $('.news-list li');
            if (items.length === 0) {
                items = $('.main-col li');
            }
            if (items.length === 0) {
                items = $('.search-list li');
            }
            if (items.length === 0) {
                items = $('.archive-list li');
            }

            items.each((i, elem) => {
                const titleElem = $(elem).find('.news-list-tit h5 a, h2 a, h3 a, .entry-title a, .archive-list-tit h5 a').first();
                const title = titleElem.text().trim();
                const rawUrl = titleElem.attr('href') || $(elem).find('a').first().attr('href');
                const image = $(elem).find('.news-list-img img, .archive-list-img img, img').first().attr('src');
                const description = $(elem).find('.news-list-txt, .entry-content, .archive-list-txt').text().trim();

                const safeUrl = getSafeUrl(rawUrl);

                if (title && safeUrl && !safeUrl.includes('/chapitre-')) {
                    books.push({ title, url: safeUrl, image, description });
                }
            });

            return books;
        } catch (error) {
            console.error(`Error scraping library (${category}):`, error.message);
            return [];
        }
    },

    /**
     * Récupère le nombre total de pages pour une catégorie
     * @param {string} category 
     */
    getLibraryCount: async (category = 'translatedtales') => {
        try {
            const url = `/category/${category}/`;
            const response = await client.get(url);
            const $ = cheerio.load(response.data);

            let lastPage = 1;
            $('.pagination a, .page-numbers a, .nav-links a, .wp-pagenavi a, .pd55 a').each((i, elem) => {
                const text = $(elem).text().trim();
                const num = parseInt(text);
                if (!isNaN(num) && num > lastPage) {
                    lastPage = num;
                }

                // Fallback: check href for page number (e.g. /page/5/)
                const href = $(elem).attr('href');
                if (href) {
                    const match = href.match(/\/page\/(\d+)\/?/);
                    if (match) {
                        const pNum = parseInt(match[1]);
                        if (!isNaN(pNum) && pNum > lastPage) {
                            lastPage = pNum;
                        }
                    }
                }
            });

            return lastPage;
        } catch (error) {
            console.error(`Error getting library count (${category}):`, error.message);
            return 1;
        }
    }
};

export default ChiReadsScraper;
