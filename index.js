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

    router.get('/test', {
        params: {
            age: rnio.params.forcedString
        },
        func: (params, client) => {
            //test
            return JSON.stringify(params);
        }
    });

    router.post('/test', (params) => JSON.stringify(params));

    router.ws('/join', {
        params: {
            room: rnio.params.forcedString,
            name: rnio.params.string
        },
        func: (params, client) => {
            client.props.room = params.room;
            client.props.name = params.name;
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
            rnio.subs(client.props.room).obj({type: 'chat', msg: `${client.props.name}: ${params.msg}`});
        }
    });

}, {
    port: 7070
}).bind();