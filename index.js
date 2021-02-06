/**
 * ======= Scouti.ng =======
 * Entrypoint of the backend.
 * ======= Scouti.ng =======
 */

// Imports
const RestNio = require('restnio');
new RestNio((router, rnio) => {

    let roomdatas = {};

    /**
     * roomdatas = {
     *      "roomcode": {
     *          pwd: "pwd"
     *      }
     * }
     */

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
        func: (params) => {
            let roomdata = roomdatas[params.roomcode];
            // Connecting as regular player
            if (!params.pwd) {
                if (params.roomcode.toUpperCase() === 'KOFFIE') throw [418, "I'm a teapot!"];
                if (!roomdata) throw [404, 'Kamer niet gevonden!'];
                return rnio.token.sign({
                    name: params.name,
                    roomcode: params.roomcode,
                    isAdmin: false,
                    permissions: [`player`]
                });
            // Connecting as admin.
            } else {
                // If a room does not exist yet: create with secret.
                if (!roomdata) {
                    roomdata = {
                        pwd: params.pwd
                    };
                    roomdatas[params.roomcode] = roomdata;
                // If the room is already here, try to join with secret.
                } else {
                    if (roomdata.pwd !== params.pwd) throw [403, 'Onjuist wachtwoord voor deze kamer!'];
                }
                return rnio.token.sign({
                    name: params.name,
                    roomcode: params.roomcode,
                    isAdmin: true,
                    permissions: [`player`, `admin`]
                });
            }
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
            session: rnio.params.string
        },
        func: async (params, client) => {
            let token = await rnio.token.verify(params.session);
            // Extract info from token & store on client.
            client.props.room = token.roomcode;
            client.props.name = token.name;
            client.props.isAdmin = token.isAdmin;
            // Grant token permissions to client.
            client.grantPerm(token.permissions);
            // Sub websocket to the roo,
            client.subscribe(token.roomcode);
            rnio.subs(token.roomcode).obj({
                type: 'roominfo',
                room: token.roomcode,
                players: Array.from(rnio.subs(token.roomcode)).map(client => client.props.name),
                leiding: Array.from(rnio.subs(token.roomcode)).filter(client => client.props.isAdmin).map(client => client.props.name)
            });
            return {
                type: 'joininfo',
                roomcode: token.roomcode,
                name: token.name,
                isAdmin: token.isAdmin
            };
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
    port: 7070,
    default: {
        httpProperties: {
            jsonResponse: true
        }
    }
}).bind();
