const fs = require('fs');
const xss = require('xss');
/** @typedef {import("restnio").Client} Client */

function file(path) {
    return fs.readFileSync(path, 'utf8')
}

module.exports = {
    components: {
        header: file(__dirname + '/components/header.html'),
        footer: file(__dirname + '/components/footer.html')
    },
    pages: {
        index: file(__dirname + '/index.html'),
        games: file(__dirname + '/games.html')
    },
    game: {
        v1v100: {
            client: file(__dirname + '/game/1v100/client/client.html'),
            server: file(__dirname + '/game/1v100/server/server.html')
        }
    },
    /**
     * Make a page and replace all variabels.
     * @param {string} content 
     * @param {Client} client - Restnio client for smartness.
     * @param {*} variables
     */
    makePage(content, client = { token: {} }, variables = {}) { 
        // Extract extra variables from client.
        if (client.token.username) variables.username = client.token.username;
        if (client.token.room) variables.room = client.token.room;

        // Import extra scripts
        let xtraScripts = '';
        if (variables.scripts) {
            for (let scr of variables.scripts) {
                xtraScripts += `<script src="${scr}" defer>\n`;
            }
        }
        let xtraStyles = '';
        if (variables.styles) {
            for (let stl of variables.styles) {
                xtraStyles += `<link rel="stylesheet" href="${stl}">\n`;
            }
        }
        // Construct the page with some standard components
        let page = `
        <!DOCTYPE html>
        <!-- Door Kasper. Sorry dit is heel snel gebeund en niet zo netjess :F -->
        <html>
            <head>
                <script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
                ${xtraScripts}
                <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="icon" type="image/png" href="/favicon.png" sizes="32x32">
                <link rel="icon" type="image/png" href="/faviconlarge.png" sizes="192x192">
                <link rel="stylesheet" href="/style.css">
                ${xtraStyles}
                <meta property="og:title" content="Scouti.ng">
                <meta property="og:description" content="Fun games to use during both local and remote scouting activities!">
                <meta property="og:image" content="/faviconlarge.png">
                <title>scouti.ng</title>
            </head>
            <body>
                <div class="headbody">
                    ${this.components.header}
                    <div class="pagewrapper">
                        <div class="contentwrapper">
                            ${content}
                        </div>
                    </div>
                </div>
                ${variables.footer ? this.components.footer : ''}
            </body>
        </html>`;
        // Replace all known information
        for (const [k, v] of Object.entries(variables)) {
            page = page.replace(new RegExp(`\\$${k}\\$`, 'g'), xss(v));
            page = page.replace(new RegExp(`\\$${k}!([\\s\\S]*?)!${k}\\$`, 'gm'), '$1');
        }
        page = page.replace(/\$(\w+)!([\s\S]*?)!(\w+)\$/g, '');
        return page;
    }

};