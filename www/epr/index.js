/** @typedef {import("restnio").RouteBack} RouteBack */

const { params } = require("restnio");

/** @type RouteBack */
module.exports = (router, rnio) => {

    let trees = {};
    let cams = {};
    let clients = 0;

    function doClientNum() {
        rnio.subs('eprclient').obj({
            type: 'clientnum',
            body: clients
        });
    }

    function updateTrees() {
        rnio.subs('eprclient').obj({
            type: 'trees',
            body: trees
        });
    }

    function updateCams() {
        rnio.subs('eprclient').obj({
            type: 'cams',
            body: cams
        });
    }

    // Serve client file:
    router.use('/webclient.js', rnio.serve(__dirname + '/webclient.js', { cache: true, noFilename: true}));

    router.all('/', (params, client) => {
        if (params.pwd === 'KaterCiller') {
            return `<html>
                <head>
                    <title>EindeAdminPanel</title>
                    <script>const pwd = "${params.pwd}";</script>
                    <script src="/epr/webclient.js" defer></script>
                    <style>
                        .treebar {
                            display: flex;
                            flex-direction: row;
                        }
                    </style>
                </head>
                <body>
                    <h1>EindeAdminPanel</h1>
                    <h2>Proto 0.0.1 - khm</h2>
                    Client Connection: <em><span id="constatus">Offline</span></em> Clients Online: <em><span id="conline">0</span></em>
                    <div id="cams"></div>
                    <div id="trees"></div>
                </body>
            
            </html>`;
        } else {
            return `<html>
                ${params.pwd ? '<span style="color: red">Wrong password!</span>': ''}
                <form action="/epr/" method="post">
                    <input type="password" id="pwd" name="pwd" placeholder="Password"><br>
                    <input type="submit" value="Login">
                </form>
            </html>`
        }
    });

    router.ws('/iclient', (params, client) => {
        if (params.pwd !== 'KaterCiller') throw [403, 'Wrong pwd!'];
        client.props.epr = true;
        client.props.type = 'client';
        clients++;
        client.subscribe('epr');
        client.subscribe('eprclient');
        doClientNum();
        updateCams();
        updateTrees();
    });

    // register tree
    router.ws('/itree', (params, client) => {
        if (params.pwd !== 'KaterCiller') throw [403, 'Wrong pwd!'];
        if (!params.code) throw [402, 'No code found!'];
        client.props.epr = true;
        client.props.type = 'tree';
        client.props.code = params.code;
        trees[params.code] = {
            code: params.code,
            online: true
        };
        client.subscribe('epr');
        client.subscribe(`tree-${params.code}`);
        updateTrees();
    });

    router.ws('/icam', (params, client) => {
        if (params.pwd !== 'KaterCiller') throw [403, 'Wrong pwd!'];
        if (!params.code) throw [402, 'No code found!'];
        client.props.epr = true;
        client.props.type = 'cam';
        client.props.code = params.code;
        cams[params.code] = {
            code: params.code,
            online: true
        };
        client.subscribe('epr');
        client.subscribe(`cam-${params.code}`);
        updateCams();
    });

    router.on('wsClose', (params, client) => {
        if (!client.props.epr || !client.props.type) return;
        switch(client.props.type) {
            case 'client':
                clients--;
                doClientNum();
            break;
            case 'tree':
                delete trees[client.props.code];
                updateTrees();
            break;
            case 'cam':
                delete cams[client.props.code];
                updateCams();
            break;
        }
    });


    // toggle led on tree:
    router.ws('/treetoggle', (params, client) => {
        if (!client.props.epr) throw [403, 'No permission!'];
        rnio.subs(`tree-${params.code}`).obj({type: 'toggle', body: true});
    });

    // shock tree:
    router.ws('/treeshock', (params, client) => {
        if (!client.props.epr) throw [403, 'No permission!'];
        rnio.subs(`tree-${params.code}`).obj({type: 'shock', body: true});
    });
};