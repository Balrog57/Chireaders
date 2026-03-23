import { performance } from 'perf_hooks';

// Simulate history behavior
const favorites = Array(50).fill(null).map((_, i) => ({ url: `url${i}`, title: `Title ${i}` }));
const readChapters = {};

// 1000 chapters per series
for (let i = 0; i < 50; i++) {
  readChapters[`url${i}`] = Array(100).fill(null).map((_, j) => ({ url: `c${j}`, title: `C${j}`, dateRead: Date.now() - j * 1000 }));
}

let cachedResult = null;
let lastFavorites = null;
let lastReadChapters = null;

function getAllHistoryMemoized() {
    if (cachedResult && lastFavorites === favorites && lastReadChapters === readChapters) {
        return cachedResult;
    }

    const allChapters = [];
    const favoritesMap = new Map();
    for (let i = 0; i < favorites.length; i++) {
        favoritesMap.set(favorites[i].url, favorites[i]);
    }

    Object.keys(readChapters).forEach(seriesUrl => {
        const favorite = favoritesMap.get(seriesUrl);
        readChapters[seriesUrl].forEach(chapter => {
            allChapters.push({
                ...chapter,
                seriesUrl,
                seriesTitle: favorite?.title || 'Série inconnue'
            });
        });
    });

    cachedResult = allChapters.sort((a, b) => b.dateRead - a.dateRead);
    lastFavorites = favorites;
    lastReadChapters = readChapters;
    return cachedResult;
}

const start = performance.now();
for(let i=0; i<100; i++) {
  getAllHistoryMemoized();
}
const end = performance.now();
console.log(`Time taken with memoization: ${end - start} ms`);
