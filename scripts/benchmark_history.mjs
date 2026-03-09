const favorites = Array.from({ length: 1000 }, (_, i) => ({ url: `url${i}`, title: `Title ${i}` }));
const readChapters = {};
for (let i = 0; i < 500; i++) {
    readChapters[`url${i}`] = Array.from({ length: 200 }, (_, j) => ({ url: `url${i}/ch${j}`, title: `Chapter ${j}`, dateRead: Date.now() - j }));
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
    // O(N) where N is number of favorites
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
    return allChapters.sort((a, b) => b.dateRead - a.dateRead);
}

console.time('Old O(N*M)');
getAllHistoryOld();
console.timeEnd('Old O(N*M)');

console.time('New O(N+M)');
getAllHistoryNew();
console.timeEnd('New O(N+M)');
