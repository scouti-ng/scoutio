const files = require('../../pagemaker');
const GameUtils = require('../GameUtils');
/** @typedef {import("restnio").RouteBack} RouteBack */

/** @type RouteBack */
module.exports = (router, rnio) => {

    // Expose resources
    router.use('/common.css', rnio.serve(__dirname + '/common.css'       , {cache: true, noFilename: true}));
    router.use('/client.css', rnio.serve(__dirname + '/client/client.css', {cache: true, noFilename: true}));
    router.use('/client.js' , rnio.serve(__dirname + '/client/client.js' , {cache: true, noFilename: true}));
    router.use('/server.css', rnio.serve(__dirname + '/server/server.css', {cache: true, noFilename: true}));
    router.use('/server.js' , rnio.serve(__dirname + '/server/server.js' , {cache: true, noFilename: true}));


    // Make client / server pages
    router.get('/client', {
        func: (params, client) => {
            params.styles = ['/game/1vs100/common.css', '/game/1vs100/client.css'];
            params.scripts = ['/game.js', '/game/1vs100/client.js'];
            return files.makePage(files.game.v1v100.client, client, params);
        }
    });

    router.get('/server', {
        func: (params, client) => {
            params.styles = ['/game/1vs100/common.css', '/game/1vs100/server.css'];
            params.scripts = ['/game.js', '/game/1vs100/server.js'];
            // return client.token;
            return files.makePage(files.game.v1v100.server, client, params);
        }
    });


    // GAME STUFFS
    function broadcastPlayers(room) {
        rnio.subs(room).obj({
            type: 'playerUpdate',
            body: GameUtils.getRoom(room).players 
        });
    }

    router.ws('/register', {
        params: {
            token: rnio.$p.string
        },
        func: async(params, client) => {
            // First check token and extract information from this.
            await client.grantPermWithToken(params.token);
            // Check if the room is still there.
            if (!GameUtils.isRoom(client.token.room)) throw [404, 'Room not found!'];
            // Subscribe to all messages related to this room.
            client.subscribe(client.token.room);
            
            // If a client registers, add it to the 1vs100 players and broadcast the joining.
            if (client.token.type == 'client') {
                let roomInfo = GameUtils.getRoom(client.token.room);
                // Insert playerdata:
                roomInfo.players[client.token.username] = {
                    username: client.token.username
                };
                broadcastPlayers(client.token.room);
            }
            return GameUtils.getRoom(client.token.room);
        }
    });


};