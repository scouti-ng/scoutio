/**
 * ======= Scouti.ng =======
 * Entrypoint of the backend.
 * ======= Scouti.ng =======
 */

// Imports
const RestNio = require('restnio');
new RestNio((router, rnio) => {
    router.use('**', rnio.cors({origin: '*'}));

    router.get('/', () => "Serve index... It works... :-)");

    router.ws('/join', {
        params: {
            room: rnio.params.forcedString
        },
        func: (params, client) => {
            client.props.room = params.room;
            client.subscribe(params.room);
            return `Subscribed to ${params.room}`;
        }
    });

    router.ws('/chat', {
        params: {
            msg: rnio.params.forcedString
        },
        func: (params, client) => {
            if (!client.props.room) throw [403, 'Client is not in a room!'];
            rnio.subs(client.props.room).obj({type: 'chat', msg: params.msg});
        }
    });

}, {
    port: 7070
}).bind();