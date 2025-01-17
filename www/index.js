const GameUtils = require('./game/GameUtils');
const files = require('./pagemaker');
/** @typedef {import("restnio").RouteBack} RouteBack */

/** @type RouteBack */
module.exports = (router, rnio) => {

    // REEAL RAPID DEV HERE GOING TO TAKE OVER THIS PRIVATE REPO FOR A MINUTE
    router.use('/epr', require('./epr/'), true);

    // REEEALL RAPID DEV HERE FOR OVERVLIEGEN LOLOLOL
    router.use('/overvliegen', require('./overvliegen/'), true);

    // Expose sources
    router.use(rnio.serve(__dirname + '/resources/', {cache: true}));
    // Expose fontawesome:
    router.use('/fontawesome.min.css', rnio.serve('./node_modules/@fortawesome/fontawesome-free/css/all.min.css', {cache: true, noFilename: true}))
    router.use('/webfonts', rnio.serve('./node_modules/@fortawesome/fontawesome-free/webfonts/', {cache: true}))

    router.use(rnio.cors());

    // Index
    router.get('/', (params, client) => {
        params.footer = true;
        return files.makePage(files.pages.index, client, params);
    });

    // Joining
    router.get('/join', async (params, client) => {
        // Sanitise input or redirect back:
        if (!params.username || !params.code) client.redirect('/?error=You must enter both name and code.');
        if (!/^\w{3,10}$/.test(params.username)) client.redirect(`/?u=${params.username}&c=${params.code}&error=Invalid name! Should be 3-10 letters or numbers.`);
        params.code = params.code.toUpperCase();
        if (!/^[A-Z0-9-]{6}$/.test(params.code)) client.redirect(`/?u=${params.username}&c=${params.code}&error=Invalid code! Should be 6 letters or numbers or '-'.`);
        let roomInfo = GameUtils.getRoom(params.code);
        if (!roomInfo) client.redirect(`/?u=${params.username}&c=${params.code}&error=A room with that code does not exist.`);
        // Generate client token with name and code.
        client.cookie('token', await rnio.token.sign({
            type: 'client',
            game: roomInfo.game,
            room: roomInfo.code,
            username: params.username,
            permissions: [`room.${roomInfo.code}.client`,  `game.${roomInfo.game}.client`]
        }));
        // Redirect to the actual game page.
        client.redirect(`/game/${roomInfo.game}/client`);
    });

    // Hosting
    router.get('/host', async (params, client) => {
        // If no game is selected yet, show the game page.
        if (!params.game) {
            return files.makePage(files.pages.games, client, {footer: true});
        } else {
            switch (params.game) {
                case '1vs100':
                case 'stoptime':
                case 'counterstrijk':
                case 'scorescout':
                    let prefCode = params.scintilla ? 'TESLA3' : null;
                    if (params.kasper) prefCode = 'KASPER';
                    let roomInfo = GameUtils.newRoom(params.game, prefCode);
                    client.cookie('token', await rnio.token.sign({
                        type: 'server',
                        game: roomInfo.game,
                        room: roomInfo.code,
                        permissions: [`room.${roomInfo.code}.server`,  `game.${roomInfo.game}.server`]
                    }));
                    client.redirect(`/game/${roomInfo.game}/server`);
                break;
                default: 
                    return files.makePage(files.pages.games, client, {footer: true, error: 'That game does not exist!?'});
            }
        }
    });

    // Import the games
    router.use('/game/1vs100', require('./game/1v100/'));
    router.use('/game/counterstrijk', require('./game/counterstrijk/'));
    router.use('/game/stoptime', require('./game/stoptime/'));
    router.use('/game/scorescout', require('./game/scorescout/'));
};