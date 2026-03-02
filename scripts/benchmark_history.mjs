import { performance } from 'perf_hooks';

// Simulate data
const numFavorites = 5000;
const numSeriesWithReadChapters = 1000;
const numChaptersPerSeries = 200; // 200,000 read chapters total

const favorites = [];
for (let i = 0; i < numFavorites; i++) {
    favorites.push({ url: `url-${i}`, title: `Title ${i}` });
}

const readChapters = {};
for (let i = 0; i < numSeriesWithReadChapters; i++) {
    const url = `url-${i}`;
    readChapters[url] = [];
    for (let j = 0; j < numChaptersPerSeries; j++) {
        readChapters[url].push({ url: `chap-${j}`, dateRead: Date.now() - j * 1000 });
    }
}

// Old Logic
function oldGetAllHistory() {
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

// New Logic
function newGetAllHistory() {
    const allChapters = [];

    const favoritesMap = new Map();
    for (const f of favorites) {
        favoritesMap.set(f.url, f);
    }

    Object.keys(readChapters).forEach(seriesUrl => {
        const favorite = favoritesMap.get(seriesUrl);
        const seriesTitle = favorite?.title || 'Série inconnue';

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

console.log(`Running benchmark with ${numFavorites} favorites and ${numSeriesWithReadChapters * numChaptersPerSeries} total chapters read...`);

const oldStart = performance.now();
oldGetAllHistory();
const oldEnd = performance.now();
const oldTime = oldEnd - oldStart;

console.log(`Old logic O(N * M) took: ${oldTime.toFixed(2)}ms`);

const newStart = performance.now();
newGetAllHistory();
const newEnd = performance.now();
const newTime = newEnd - newStart;

console.log(`New logic O(N + M) took: ${newTime.toFixed(2)}ms`);
console.log(`Performance improvement: ${(oldTime / newTime).toFixed(2)}x faster`);
