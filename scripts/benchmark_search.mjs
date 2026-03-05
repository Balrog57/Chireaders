import { performance } from 'perf_hooks';

// Helper to normalize text for search
const normalizeText = (text) => {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
};

// Generate dummy data (5000 items)
const fullData = [];
for (let i = 0; i < 5000; i++) {
    fullData.push({
        title: `Le Retour du Dieu de la Guerre - Chapitre ${i} - Édition Spéciale éàô`,
        url: `https://example.com/novel-${i}`
    });
}

// 1. Without pre-computation
const queryTerms = ['retour', 'dieu', 'guerre'];

const startWithoutPre = performance.now();
for (let j = 0; j < 50; j++) { // Simulate 50 keystrokes/searches
    const filtered = fullData.filter(item => {
        const normalizedTitle = normalizeText(item.title);
        return queryTerms.every(term => normalizedTitle.includes(term));
    });
}
const endWithoutPre = performance.now();

// 2. With pre-computation
// Pre-computation step (happens once on load)
const startPrecomputation = performance.now();
const preparedData = fullData.map(book => ({
    ...book,
    _normalizedTitle: normalizeText(book.title)
}));
const endPrecomputation = performance.now();

const startWithPre = performance.now();
for (let j = 0; j < 50; j++) { // Simulate 50 keystrokes/searches
    const filtered = preparedData.filter(item => {
        const normalizedTitle = item._normalizedTitle;
        return queryTerms.every(term => normalizedTitle.includes(term));
    });
}
const endWithPre = performance.now();

console.log(`Results for 50 searches on 5000 items:`);
console.log(`Without pre-computation: ${(endWithoutPre - startWithoutPre).toFixed(2)} ms`);
console.log(`With pre-computation: ${(endWithPre - startWithPre).toFixed(2)} ms`);
console.log(`(Pre-computation cost once: ${(endPrecomputation - startPrecomputation).toFixed(2)} ms)`);
console.log(`Improvement: ~${Math.round((endWithoutPre - startWithoutPre) / (endWithPre - startWithPre))}x faster during typing!`);
