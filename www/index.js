const files = require('./pagemaker');
/** @typedef {import("restnio").RouteBack} RouteBack */

/** @type RouteBack */
module.exports = (router, rnio) => {
    // Expose sources
    router.use(rnio.serve(__dirname + '/resources/', {cache: true}));

    // Index
    router.get('/', (params, client) => {
        params.footer = true;
        return files.makePage(files.pages.index, client, params);
    });

    // Joining
    router.get('/join', (params, client) => {
        // Sanitise input or redirect back:
        if (!params.username || !params.code) client.redirect('/?error=You must enter both name and code.');
        if (!/^\w{3,10}$/.test(params.username)) client.redirect('/?error=Invalid name! Should be 3-10 letters or numbers.');
        if (!/^[a-zA-Z0-9-]{3,10}$/.test(params.code)) client.redirect('/?error=Invalid code! Should be 3-10 letters or numbers.');

        return 'hi';
    });

    // Hosting
    router.get('/host', (params, client) => {
        // If no game is selected yet, show the game page.
        if (!params.game) {
            return files.makePage(files.pages.games, client, {footer: true});
        } else {
            switch (params.game) {
                case '1vs100':
                    // Do stuff
                break;
                default: 
                    return files.makePage(files.pages.games, client, {footer: true, error: 'That game does not exist!?'});
            }
        }
    });

    // Import the games
    router.use('/game/1v100', require('./game/1v100'));
};