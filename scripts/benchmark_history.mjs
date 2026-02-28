import { performance } from 'perf_hooks';

// Mock data
const favorites = Array.from({ length: 500 }, (_, i) => ({
    url: `https://chireads.com/series-${i}`,
    title: `Series ${i}`
}));

const readChapters = {};
for (let i = 0; i < 500; i++) {
    readChapters[`https://chireads.com/series-${i}`] = Array.from({ length: 100 }, (_, j) => ({
        url: `https://chireads.com/series-${i}/chapter-${j}`,
        title: `Chapter ${j}`,
        dateRead: Date.now() - Math.random() * 1000000
    }));
}

function getAllHistoryOld() {
    const allChapters = [];
    Object.keys(readChapters).forEach(seriesUrl => {
        readChapters[seriesUrl].forEach(chapter => {
            const favorite = favorites.find(f => f.url === seriesUrl);
            allChapters.push({
                ...chapter,
                seriesUrl,
                seriesTitle: favorite?.title || 'Série inconnue'
            });
        });
    });
    return allChapters.sort((a, b) => b.dateRead - a.dateRead);
}

function getAllHistoryNew() {
    const allChapters = [];

    // Pre-calculate favorites map for O(1) lookup
    const favoritesMap = new Map();
    favorites.forEach(f => favoritesMap.set(f.url, f.title));

    Object.keys(readChapters).forEach(seriesUrl => {
        const seriesTitle = favoritesMap.get(seriesUrl) || 'Série inconnue';
        readChapters[seriesUrl].forEach(chapter => {
            allChapters.push({
                ...chapter,
                seriesUrl,
                seriesTitle
            });
        });
    });
    return allChapters.sort((a, b) => b.dateRead - a.dateRead);
}

const startOld = performance.now();
getAllHistoryOld();
const endOld = performance.now();
console.log(`Old: ${endOld - startOld}ms`);

const startNew = performance.now();
getAllHistoryNew();
const endNew = performance.now();
console.log(`New: ${endNew - startNew}ms`);
