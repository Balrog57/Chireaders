
const axios = require('axios');
const cheerio = require('react-native-cheerio');

const BASE_URL = 'https://chireads.com';

async function run() {
    try {
        console.log('Fetching ' + BASE_URL);
        const response = await axios.get(BASE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const html = response.data;
        console.log('Downloaded HTML length:', html.length);
        const $ = cheerio.load(html);

        // Analyze Headers
        console.log('\n--- Section Headers ---');
        $('h2, h3, h4, .titre-section, .section-title').each((i, elem) => {
            const text = $(elem).text().trim().replace(/\s+/g, ' ');
            if (text) console.log(`[${elem.tagName}] [${$(elem).attr('class')}] "${text}"`);
        });

        // 1. En Vedette (Already known: .recommended-list li)
        console.log('\n--- En Vedette (.recommended-list li) ---');
        console.log('Count:', $('.recommended-list li').length);

        // 2. Dernières mises à jour (Already known: .dernieres-tabel table tr)
        console.log('\n--- Dernières mises à jour (.dernieres-tabel table tr) ---');
        console.log('Count:', $('.dernieres-tabel table tr').length);

        // 3. Nouvelle Parution
        // Look for "Nouvelle parution" text
        console.log('\n--- Searching for "Nouvelle parution" ---');
        $('div, section').each((i, elem) => {
            const txt = $(elem).prev().text().trim();
            if (txt.includes('Nouvelle') || txt.includes('Parution')) {
                console.log(`Found header near div: ${txt}`);
                console.log(`Div class: ${$(elem).attr('class')}`);
                // Try to list children
                console.log(`Children count: ${$(elem).children().length}`);
                if ($(elem).find('li').length > 0) console.log(`LI children: ${$(elem).find('li').length}`);
            }
        });

        // 4. Populaire Search
        console.log('\n--- Searching for "Populaire" ---');
        // Look for text in headers/divs
        $('div, h1, h2, h3, h4, h5, span').each((i, elem) => {
            const text = $(elem).text().trim();
            if (text.includes('Populaire') && text.length < 50) {
                console.log(`Found "Populaire" in <${elem.tagName}> class="${$(elem).attr('class')}"`);
                // Check next sibling
                const next = $(elem).next();
                console.log(`  Next sibling: <${next[0]?.tagName}> class="${next.attr('class')}"`);
                if (next.find('li').length > 0) console.log(`  Items in next: ${next.find('li').length}`);

                // Check parent's next sibling (common in widgets)
                const parentNext = $(elem).parent().next();
                if (parentNext.length) {
                    console.log(`  Parent Next: <${parentNext[0]?.tagName}> class="${parentNext.attr('class')}"`);
                }
            }
        });

        // 5. Recommandé Search
        console.log('\n--- Searching for "Recommandé" ---');
        // There is a class "recommended" mentioned in logs. Let's see it.
        $('.recommended').each((i, elem) => {
            console.log(`Found .recommended div. Children: ${$(elem).children().length}`);
            // Check for list items
            const listItems = $(elem).find('li');
            console.log(`  LI count: ${listItems.length}`);
            if (listItems.length > 0) {
                console.log(`  Sample: ${listItems.first().text().trim().substring(0, 50)}...`);
            }
        });


    } catch (e) {
        console.error('Error:', e.message);
    }
}

run();
