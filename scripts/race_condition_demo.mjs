
// scripts/race_condition_demo.mjs

// Mock AsyncStorage
const AsyncStorage = {
    _data: new Map(),
    getItem: async (key) => {
        // Simulate IO delay
        await new Promise(r => setTimeout(r, 10));
        return AsyncStorage._data.get(key) || null;
    },
    setItem: async (key, value) => {
        // Simulate IO delay
        await new Promise(r => setTimeout(r, 10));
        AsyncStorage._data.set(key, value);
    }
};

// Initial State
const initialFavorites = [
    { url: 'book1', title: 'Book 1', latestKnownChapterUrl: 'ch1' }
];

await AsyncStorage.setItem('favorites', JSON.stringify(initialFavorites));

console.log('--- Vulnerable Pattern Demo ---');

// Reset
await AsyncStorage.setItem('favorites', JSON.stringify(initialFavorites));

// Vulnerable Task
const vulnerableTask = async () => {
    console.log('[Task] 1. Read favorites');
    const favsJson = await AsyncStorage.getItem('favorites');
    const favorites = JSON.parse(favsJson);
    let updatedFavorites = [...favorites];
    let hasNewData = false;

    console.log('[Task] 2. Start scraping (simulated delay)...');

    // Simulate processing each favorite
    for (const fav of favorites) {
        // Long operation
        await new Promise(r => setTimeout(r, 500));

        // Assume we found a new chapter
        const newChapterUrl = 'ch2'; // New chapter found
        if (fav.latestKnownChapterUrl !== newChapterUrl) {
            console.log(`[Task] Found new chapter for ${fav.title}`);
            const idx = updatedFavorites.findIndex(f => f.url === fav.url);
            if (idx !== -1) {
                updatedFavorites[idx] = { ...updatedFavorites[idx], latestKnownChapterUrl: newChapterUrl };
                hasNewData = true;
            }
        }
    }

    if (hasNewData) {
        console.log('[Task] 3. Saving updates...');
        await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        console.log('[Task] Saved.');
    }
};

// User Action (Simulated)
const userAction = async () => {
    // Wait a bit so task starts
    await new Promise(r => setTimeout(r, 100));
    console.log('[User] Adding a new favorite...');
    const current = JSON.parse(await AsyncStorage.getItem('favorites'));
    const newFav = { url: 'book2', title: 'Book 2 (Added by User)', latestKnownChapterUrl: 'ch1' };
    const updated = [...current, newFav];
    await AsyncStorage.setItem('favorites', JSON.stringify(updated));
    console.log('[User] Favorite added.');
};

// Run Concurrent
await Promise.all([vulnerableTask(), userAction()]);

// Check Result
const finalStateVulnerable = JSON.parse(await AsyncStorage.getItem('favorites'));
console.log('Final State (Vulnerable):', JSON.stringify(finalStateVulnerable, null, 2));

if (finalStateVulnerable.length === 1) {
    console.error('❌ FAILURE: User addition was lost!');
} else {
    console.log('✅ SUCCESS: User addition preserved (Unexpected).');
}


console.log('\n--- Safe Pattern Demo ---');

// Reset
await AsyncStorage.setItem('favorites', JSON.stringify(initialFavorites));

// Safe Task
const safeTask = async () => {
    console.log('[Task] 1. Read favorites');
    const favsJson = await AsyncStorage.getItem('favorites');
    if (!favsJson) return;
    const favorites = JSON.parse(favsJson);

    // Collect updates instead of modifying a local copy of full state
    const updates = new Map();

    console.log('[Task] 2. Start scraping (simulated delay)...');

    for (const fav of favorites) {
        await new Promise(r => setTimeout(r, 500));
        const newChapterUrl = 'ch2';
        if (fav.latestKnownChapterUrl !== newChapterUrl) {
            console.log(`[Task] Found new chapter for ${fav.title}`);
            updates.set(fav.url, newChapterUrl);
        }
    }

    if (updates.size > 0) {
        console.log('[Task] 3. Re-fetching fresh state...');
        // CRITICAL STEP: Re-fetch fresh state
        const freshFavsJson = await AsyncStorage.getItem('favorites');
        const freshFavorites = freshFavsJson ? JSON.parse(freshFavsJson) : [];

        let hasChanges = false;
        const finalFavorites = freshFavorites.map(f => {
            if (updates.has(f.url)) {
                // Apply update only if latestKnownChapterUrl is actually different
                hasChanges = true;
                return { ...f, latestKnownChapterUrl: updates.get(f.url) };
            }
            return f;
        });

        if (hasChanges) {
            console.log('[Task] 4. Saving merged updates...');
            await AsyncStorage.setItem('favorites', JSON.stringify(finalFavorites));
            console.log('[Task] Saved.');
        }
    }
};

// Run Concurrent
await Promise.all([safeTask(), userAction()]);

// Check Result
const finalStateSafe = JSON.parse(await AsyncStorage.getItem('favorites'));
console.log('Final State (Safe):', JSON.stringify(finalStateSafe, null, 2));

const book1 = finalStateSafe.find(f => f.url === 'book1');
const book2 = finalStateSafe.find(f => f.url === 'book2');

if (book1.latestKnownChapterUrl === 'ch2' && book2) {
    console.log('✅ SUCCESS: User addition preserved AND chapter updated!');
} else {
    console.error('❌ FAILURE: Something went wrong.');
}
