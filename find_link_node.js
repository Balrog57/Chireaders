const fs = require('fs');
const html = fs.readFileSync('debug_output.html', 'utf8');

// Regex to find link containing Super Gene
// Looking for <a href="...">...Super Gène...</a>
// Or just href="...super-gene..."

const match = html.match(/href="([^"]*super-gene[^"]*)"/i);
if (match) {
    console.log('Found URL:', match[1]);
} else {
    console.log('No URL found matching super-gene');
    // Dump all links
    const matches = html.match(/href="([^"]*)"/g);
    // console.log(matches ? matches.slice(0, 5) : 'No links');
}
