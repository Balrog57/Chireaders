import ChiReadsScraper from './src/services/ChiReadsScraper.js';

async function test() {
    console.log('--- TEST HOME ---');
    const home = await ChiReadsScraper.getHome();
    console.log('Featured:', home.featured.length);
    console.log('Popular:', home.popular.length);
    if (home.featured.length > 0) console.log('Sample Featured:', home.featured[0]);

    if (home.featured.length > 0) {
        console.log('\n--- TEST DETAIL ---');
        const url = home.featured[0].url; // Utiliser un vrai lien récupéré
        if (url) {
            // Correction URL si relative (le scraper extrait href brut)
            // Mon scraper a mis l'URL complète si href l'est, sinon faut concaténer.
            // Sur chireads, href semble complet.
            console.log('Fetching details for:', url);
            const details = await ChiReadsScraper.getNovelDetails(url);
            console.log('Title:', details?.title);
            console.log('Chapters:', details?.chapters?.length);

            if (details && details.chapters.length > 0) {
                console.log('\n--- TEST CHAPTER ---');
                const chapUrl = details.chapters[0].url;
                console.log('Fetching chapter:', chapUrl);
                const chapter = await ChiReadsScraper.getChapterContent(chapUrl);
                console.log('Chapter Title:', chapter?.title);
                console.log('Content Length:', chapter?.content?.length);
            }
        }
    }
}

test();
