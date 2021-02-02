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

    router.post('/requestAccess', {
        params: {
            name: {
                type: 'string',
                required: true,
                checks: [rnio.params.$c.str.regex(/^\w{2,}$/)]
            },
            roomcode: {
                type: 'string',
                required: true,
                checks: [rnio.params.$c.str.regex(/^\w{5,}$/)]
            },
            pwd: {
                type: 'string',
                required: false,
                ignoreEmptyString: true,
                checks: [rnio.params.$c.str.regex(/^\w{2,}$/)]
            }
        },
        func: (params, client) => {
            client.redirect(`https://scouti.ng/weerwolven.html?name=${params.name}$roomcode=${params.roomcode}&leiding=${params.pwd ? 'on': 'off'}`)
            // return params;
        }
    });
    
    router.on('wsClose', {
        func: (params, client) => {
            if(client.props.room) {
                rnio.subs(client.props.room).obj({
                    type: 'roominfo',
                    room: client.props.room,
                    players: Array.from(rnio.subs(client.props.room)).map(client => client.props.name),
                    leiding: Array.from(rnio.subs(client.props.room)).filter(client => client.props.isAdmin).map(client => client.props.name)
                });
            }
        }
    });

    router.ws('/join', {
        params: {
            room: rnio.params.forcedString,
            name: rnio.params.string,
            isAdmin: rnio.params.boolean
        },
        func: (params, client) => {
            client.props.room = params.room;
            client.props.name = params.name;
            client.props.isAdmin = params.isAdmin;
            client.subscribe(params.room);
            rnio.subs(params.room).obj({
                type: 'roominfo',
                room: params.room,
                players: Array.from(rnio.subs(params.room)).map(client => client.props.name),
                leiding: Array.from(rnio.subs(params.room)).filter(client => client.props.isAdmin).map(client => client.props.name)
            });
        }
    });

    router.ws('/chat', {
        params: {
            msg: rnio.params.forcedString
        },
        func: (params, client) => {
            if (!client.props.room) throw [403, 'Client is not in a room!'];
            rnio.subs(client.props.room).obj({
                type: 'chat',
                from: `${client.props.name}`,
                msg: `${params.msg}`
            });
        }
    });
    
    router.ws('/vote', {
        params: {
            for: rnio.params.string
        },
        func: (params, client) => {
            if(!client.props.room) throw [403, 'Client is not in a room!'];
            rnio.subs(client.props.room).obj({type: 'vote', for: params.for});
        }
    });

}, {
    port: 7070
}).bind();
