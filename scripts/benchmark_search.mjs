const normalizeText = (text) => {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
};

const numItems = 5000;
const items = Array.from({ length: numItems }).map((_, i) => ({
    title: `Titre du Livre Épique ${i} - Édition Spéciale`,
    url: `url-${i}`,
}));

const queryTerms = ["titre", "epique"];

console.time("Filter Without Pre-computation");
for (let j = 0; j < 100; j++) {
    items.filter(item => {
        const normalizedTitle = normalizeText(item.title);
        return queryTerms.every(term => normalizedTitle.includes(term));
    });
}
console.timeEnd("Filter Without Pre-computation");

const enhancedItems = items.map(item => ({
    ...item,
    normalizedTitle: normalizeText(item.title)
}));

console.time("Filter With Pre-computation");
for (let j = 0; j < 100; j++) {
    enhancedItems.filter(item => {
        const normalizedTitle = item.normalizedTitle;
        return queryTerms.every(term => normalizedTitle.includes(term));
    });
}
console.timeEnd("Filter With Pre-computation");
