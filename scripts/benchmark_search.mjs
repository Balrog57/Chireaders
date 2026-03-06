const normalizeText = (text) => {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
};

// Generate fake data
const dataSize = 5000;
const fullData = [];
for (let i = 0; i < dataSize; i++) {
    fullData.push({
        title: `Le chapitre ${i} de l'histoire héroïque avec des accents éèà`,
        url: `http://example.com/chapitre-${i}`
    });
}

const query = "heroique avec";
const queryTerms = normalizeText(query).split(' ').filter(term => term.length > 0);

// Unoptimized
console.time('Unoptimized Search');
for (let j = 0; j < 100; j++) {
    fullData.filter(item => {
        const normalizedTitle = normalizeText(item.title);
        return queryTerms.every(term => normalizedTitle.includes(term));
    });
}
console.timeEnd('Unoptimized Search');

// Pre-compute
console.time('Pre-computation');
const optimizedData = fullData.map(item => ({
    ...item,
    normalizedTitle: normalizeText(item.title)
}));
console.timeEnd('Pre-computation');

// Optimized
console.time('Optimized Search');
for (let j = 0; j < 100; j++) {
    optimizedData.filter(item => {
        return queryTerms.every(term => item.normalizedTitle.includes(term));
    });
}
console.timeEnd('Optimized Search');
