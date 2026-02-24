// scripts/race_condition_proof.mjs

// Mock AsyncStorage
const AsyncStorage = {
    _data: JSON.stringify([
        { title: 'Book 1', url: 'url1', latest: 'ch1' }
    ]),
    getItem: async (key) => {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 10));
        return AsyncStorage._data;
    },
    setItem: async (key, value) => {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 10));
        AsyncStorage._data = value;
        console.log(`AsyncStorage setItem(${key}):`, JSON.parse(value));
    }
};

// Simulate Background Task (FIXED)
async function runBackgroundTask() {
    console.log('--- Background Task Started ---');

    // 1. Load data
    const favsJson = await AsyncStorage.getItem('favorites');
    const favorites = JSON.parse(favsJson);

    // Simulating the Map for updates
    const updates = new Map();
    let hasNewData = false;

    console.log('Background Task loaded:', favorites.length, 'favorites');

    // 2. Simulate long processing (network requests)
    console.log('Background Task processing...');
    await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay

    // Update first favorite (simulate finding new chapter)
    if (favorites.length > 0) {
        updates.set(favorites[0].url, 'ch2');
        hasNewData = true;
    }

    // 3. Save updates if any (Fetch-Merge-Save)
    if (hasNewData) {
        console.log('Background Task saving (Fetch-Merge-Save)...');

        // RE-FETCH
        const currentFavsJson = await AsyncStorage.getItem('favorites');
        const currentFavorites = JSON.parse(currentFavsJson);

        // MERGE
        const updatedFavorites = currentFavorites.map(f => {
            if (updates.has(f.url)) {
                return { ...f, latest: updates.get(f.url) };
            }
            return f;
        });

        // SAVE
        await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    }
    console.log('--- Background Task Finished ---');
}

// Simulate User Action (Add Favorite)
async function runUserAction() {
    console.log('--- User Action Started ---');

    // Wait slightly so Background Task starts first
    await new Promise(resolve => setTimeout(resolve, 30));

    // 1. Load data
    const favsJson = await AsyncStorage.getItem('favorites');
    const favorites = JSON.parse(favsJson);

    // 2. Add new favorite
    favorites.push({ title: 'New Book', url: 'url2', latest: 'ch1' });
    console.log('User added favorite. Total:', favorites.length);

    // 3. Save
    await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
    console.log('--- User Action Finished ---');
}

// Run Simulation
async function main() {
    console.log('Initial State:', JSON.parse(AsyncStorage._data));

    // Run concurrently
    await Promise.all([
        runBackgroundTask(),
        runUserAction()
    ]);

    console.log('\nFinal State:', JSON.parse(AsyncStorage._data));

    const finalFavs = JSON.parse(AsyncStorage._data);
    const hasNewBook = finalFavs.some(f => f.title === 'New Book');
    const hasUpdatedChapter = finalFavs.some(f => f.url === 'url1' && f.latest === 'ch2');

    if (hasNewBook && hasUpdatedChapter) {
        console.log('\n[PASS] Fix Verified: "New Book" is present AND "Book 1" is updated!');
    } else {
        if (!hasNewBook) console.log('\n[FAIL] Race Condition: "New Book" was lost!');
        if (!hasUpdatedChapter) console.log('\n[FAIL] Logic Error: "Book 1" was not updated!');
    }
}

main();
