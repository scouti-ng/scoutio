const files = require('../../pagemaker');
const GameUtils = require('../GameUtils');
/** @typedef {import("restnio").RouteBack} RouteBack */

/** @type RouteBack */
module.exports = (router, rnio) => {

    // Expose resources
    router.use('/common.css', rnio.serve(__dirname + '/common.css',        {cache: true, noFilename: true}));
    router.use('/client.css', rnio.serve(__dirname + '/client/client.css', {cache: true, noFilename: true}));
    router.use('/server.css', rnio.serve(__dirname + '/server/server.css', {cache: true, noFilename: true}));

    // Make client / server pages
    router.get('/client', {
        func: (params, client) => {
            params.styles = ['/game/1vs100/common.css', '/game/1vs100/client.css'];
            params.scripts = ['/game.js'];
            return files.makePage(files.game.v1v100.client, client, params);
        }
    });

    router.get('/server', {
        func: (params, client) => {
            params.styles = ['/game/1vs100/common.css', '/game/1vs100/server.css'];
            params.scripts = ['/game.js'];
            // return client.token;
            return files.makePage(files.game.v1v100.server, client, params);
        }
    });


    // GAME STUFFS


    router.ws('/register', {
        params: {
            type: rnio.$p.enum('client', 'server'),
            code: {
                required: true,
                checks: [(value) => GameUtils.isRoom(value)]
            },
            username: {
                required: false,
                checks: [rnio.$p.checks.str.regex(/^[A-Z0-9-]{6}$/)]
            }
        },
        func: (params, client) => {
            // First check token and extract information from this.
            // Subscribe to all messages related to this room.
            client.subscribe(params.code);
            
        }
    });
};