/** @typedef {import("restnio").RouteBack} RouteBack */

const { params } = require("restnio");
const fs = require('fs');

const catpil = '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';

/** @type RouteBack */
module.exports = (router, rnio) => {

    let trees = {};
    let cams = {};
    let clients = 0;

    let treealias = {};
    // On startup load tree alias from file.
    if (fs.existsSync('treealias.json')) {
        treealias = JSON.parse(fs.readFileSync('treealias.json')).alias;
    }

    let treeTimers = {};

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

    // Server chart.js
    router.use('/chart.js', rnio.serve(__dirname + '/chart.js', {cache: true, noFilename: true}));

    // Serve scalehack file:
    router.use('/d3scalehack.js', rnio.serve(__dirname + '/d3scalehack.js', {cache: true, noFilename: true}));

    router.all('/', (params, client) => {
        if (params.pwd === 'KaterCiller') {
            return `<html>
                <head>
                    <title>EindeAdminPanel</title>
                    <script>const pwd = "${params.pwd}";</script>
                    <script src="https://d3js.org/d3-array.v2.min.js"></script>
                    <script src="https://d3js.org/d3-color.v2.min.js"></script>
                    <script src="https://d3js.org/d3-format.v2.min.js"></script>
                    <script src="https://d3js.org/d3-interpolate.v2.min.js"></script>
                    <script src="https://d3js.org/d3-time.v2.min.js"></script>
                    <script src="https://d3js.org/d3-time-format.v3.min.js"></script>
                    <script src="/epr/d3scalehack.js"></script>
                    <script src="https://d3js.org/d3-selection.v2.min.js"></script>
                    <script src="https://d3js.org/d3-axis.v2.min.js"></script>
                    <script src="/epr/chart.js"></script>
                    <script src="/epr/webclient.js" defer></script>
                    <style>
                        .treebar {
                            display: flex;
                            flex-direction: row;
                            width: 1300px;
                        }
                        #cams {
                            display: flex;
                            flex-direction: row;
                        }
                        .camsqr {
                            border: 1px solid black;
                        }
                        .shockbtn {
                            flex-grow: 1;
                        }
                        .highlight {
                            background-color: lightgrey;
                        }
                        body {
                            transition: 0.15s ease-in;
                        }
                    </style>
                </head>
                <body id="bigpage">
                    <h1>EindeAdminPanel</h1>
                    <h2>Proto 0.1.0 - khm</h2>
                    Client Connection: <em><span id="constatus">Offline</span></em> Clients Online: <em><span id="conline">0</span></em> File loaded: <em><span id="fileloaded">nothing</span></em>
                    <div id="cams"></div>
                    <div id="trees"></div>
                    <!-- <button onClick="meep()">Meep</button> -->
                    <div id="chart" style="width: 100%; height: 500px;"></div>
                    <div id="chartTop" style="width: 100%; height: 500px;"></div>
                    <div id="chartBot" style="width: 100%; height: 500px;"></div>
                    <button id="follow-btn">Follow Data</button><button id="autoranging">Turn Auto-Range OF</button><input type="file" id="graph-file" name="graph-file" accept="application/json"><button id="load-btn">Load</button><button id="playpause-btn" style="width: 100px">Play</button> Speed: <input type="number" id="speed" min="-100" max="100" value="1"> Stepsize: <input type="number" id="stepsize" min="-100" max="100" value="0.25"><button id="slowtoggle-btn">Show Slow</button><button id="legendtoggle-btn">Show Legend</button><button id="zero-btn">ZERO</button><br/>
                    OTA-UPDATE: <input type="file" id="ota-file" name="ota-file" accept="application/octet-stream">
                    <input type="number" id="version" name="version" placeholder="VERSION">
                    <button id="upload-btn">Upload</button>
                    <button id="flash-btn">FLASH!</button>
                    <button id="flashcam-btn">FLASH CAM!</button>
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
        clearInterval(treeTimers[client.props.code]);
        if (params.version) {
            client.props.version = params.version;
        } else {
            client.props.version = 0; // LEGACY SUPPORT.
        }
        let alias = params.code;
        if (params.code in treealias) {
            alias = treealias[params.code]
        // Ask clients to enter an alias for this tree (If not legacy ID)
        } else if (!params.code.includes('EPT')) {
            rnio.subs('eprclient').obj({
                type: 'promptalias',
                body: {
                    code: params.code
                }
            });
        }
        trees[params.code] = {
            code: params.code,
            alias,
            online: true
        };
        client.subscribe('epr');
        client.subscribe('eprtree');
        client.subscribe(`tree-${params.code}`);
        updateTrees();
        return {
            type: 'established',
            body: true
        };
    });

    router.ws('/icam', (params, client) => {
        if (params.pwd !== 'KaterCiller') throw [403, 'Wrong pwd!'];
        if (!params.code) throw [402, 'No code found!'];
        client.props.epr = true;
        client.props.type = 'cam';
        client.props.code = params.code;
        cams[params.code] = {
            code: params.code,
            online: true,
            pic: catpil
        };
        client.subscribe('epr');
        client.subscribe('eprcam');
        client.subscribe(`cam-${params.code}`);
        updateCams();
        return {
            type: 'established',
            body: true
        };
    });

    router.ws('/pic', (params, client) => {
        if (!client.props.epr) throw [403, 'No permission!'];
        cams[client.props.code] = {
            code: params.code,
            online: true,
            pic: params.pic
        };
        updateCams();// just broadcast everything lololol
    });

    router.ws('/cambat', (params, client) => {
        if (!client.props.epr) throw [403, 'No permission!'];
        if (cams[client.props.code]) {
            cams[client.props.code].level = params.level;
            updateCams();// just broadcast everything lololol
        }
    });

    router.ws('/givealias', (params, client) => {
        if (!client.props.epr) throw [403, 'No permission!'];
        trees[params.code].alias = params.alias;
        treealias[params.code] = params.alias;
        // save to disk also
        fs.writeFileSync('treealias.json', JSON.stringify({alias: treealias}));
        updateTrees();
    });

    // Report back from tree.
    router.ws('/togglestate', (params, client) => {
        if (!client.props.epr) throw [403, 'No permission!'];
        trees[client.props.code].online = true;
        rnio.subs(`eprclient`).obj({type: 'togglestate', body: {code: client.props.code, status: params.status, batvolt: params.batvolt}});
    });

    // Report back from cam
    router.ws('/toggledflash', (params, client) => {
        if (!client.props.epr) throw [403, 'No permission!'];
        cams[client.props.code].online = true;
        rnio.subs(`eprclient`).obj({type: 'toggledflash', body: {code: client.props.code, status: params.status}});
    });

    router.on('wsClose', (params, client) => {
        if (!client.props.epr || !client.props.type) return;
        switch(client.props.type) {
            case 'client':
                clients--;
                doClientNum();
            break;
            case 'tree':
                trees[client.props.code].online = false;
                clearInterval(treeTimers[client.props.code]);
                updateTrees();
            break;
            case 'cam':
                cams[client.props.code].online = false;
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
        rnio.subs(`tree-${params.code}`).obj({type: 'shock', body: params.pw});
    });

    // charge tree:
    router.ws('/treecharge', (params, client) => {
        if (!client.props.epr) throw [403, 'No permission!'];
        rnio.subs(`tree-${params.code}`).obj({type: 'charge'});
    });

    // Set interval to shock tree.
    router.ws('/shockbo', (params, client) => {
        if (!client.props.epr) throw [403, 'No permission!'];
        if (params.on && params.interval > 0) {
            trees[params.code].shockbo = params.interval;
            treeTimers[params.code] = setInterval(() => {
                rnio.subs(`tree-${params.code}`).obj({type: 'shock', body: params.pw});
            }, params.interval * 1000);
        } else {
            trees[params.code].shockbo = undefined;
            clearInterval(treeTimers[params.code]);
        }
        updateTrees();
    });

    // Set auto shock.
    router.ws('/autoshock', (params, client) => {
        if (!client.props.epr) throw [403, 'No permission!'];
        if (params.on && params.tcyc > 0) {
            trees[params.code].autoshocking = true;
            trees[params.code].truT = params.truT;
            trees[params.code].trlT = params.trlT;
            trees[params.code].truB = params.truB;
            trees[params.code].trlB = params.trlB;
            trees[params.code].tcyc = params.tcyc;
            rnio.subs(`tree-${params.code}`).obj({type: 'autoshock', body: params});
        } else {
            trees[params.code].autoshocking = undefined;
            rnio.subs(`tree-${params.code}`).obj({type: 'autoshock', body: params});
        }
        updateTrees();
    });

    // toggle led on camera:
    router.ws('/cameratoggle', (params, client) => {
        if (!client.props.epr) throw [403, 'No permission!'];
        rnio.subs(`cam-${params.code}`).obj({type: 'toggle', body: true});
    });

    router.ws('/treetouchreset', (params, client) => {
        if (!client.props.epr) throw [403, 'No permission!'];
        rnio.subs(`tree-${params.code}`).obj({type: 'touchreset', body: true});
    });

    // toggle camera on/off
    router.ws('/cameraon', (params, client) => {
        if (!client.props.epr) throw [403, 'No permission!'];
        rnio.subs(`cam-${params.code}`).obj({type: 'camon', body: true});
    });

    // off
    router.ws('/cameraoff', (params, client) => {
        if (!client.props.epr) throw [403, 'No permission!'];
        cams[params.code].pic = catpil;
        updateCams();
        rnio.subs(`cam-${params.code}`).obj({type: 'camoff', body: true});
    });

    router.ws('/touch', (params, client) => {
        rnio.subs('eprclient').obj({
            type: 'tupdate',
            body: params
        });
    });

    let otaVersion = 0;
    let otaSize = 0;
    let otaData;

    router.ws('/uploadota', (params, client) => {
        if (!client.props.epr) throw [403, 'No permission!'];
        otaVersion = params.version;
        otaSize = params.size;
        otaData = params.data;
    });

    router.ws('/doota', async(params, client) => {
        if (otaData) {
            rnio.subs('eprtree').obj({
                type: 'otastart',
                size: otaSize,
                version: otaVersion
            });
        }
        for (let i = 0; i < otaData.length; i++) {
            await timeout(50);
            rnio.subs('eprtree').obj({
                type: 'otapart',
                chunknum: otaData[i].chunknum,
                chunksize: otaData[i].chunksize,
                chunk: otaData[i].chunk
            });
        }
    });

    router.ws('/dootacam', async(params, client) => {
        if (otaData) {
            rnio.subs('eprcam').obj({
                type: 'otastart',
                size: otaSize,
                version: otaVersion
            });
        }
        for (let i = 0; i < otaData.length; i++) {
            await timeout(30); // More time for the camera to work this out.
            rnio.subs('eprcam').obj({
                type: 'otapart',
                chunknum: otaData[i].chunknum,
                chunksize: otaData[i].chunksize,
                chunk: otaData[i].chunk
            });
        }
    });
};

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}