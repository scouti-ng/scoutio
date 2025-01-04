const files = require('../../pagemaker');
const GameUtils = require('../GameUtils');
/** @typedef {import("restnio").RouteBack} RouteBack */


// Default setttings
const DEF_FINDING_TIME = "00:00:45";
const DEF_INGAME_TIME  = "00:08:30";
const DEF_SCORING_TIME = "00:00:45";
const DEF_MAX_PLAYERS  = 4;
const DEF_TEAM = 'Unteamed';

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
            params.styles = ['/game/scorescout/common.css', '/game/scorescout/client.css'];
            params.scripts = ['/game.js', '/touchpunch.min.js', '/game/scorescout/client.js'];
            return files.makePage(files.game.scorescout.client, client, params);
        }
    });

    router.get('/server', {
        func: (params, client) => {
            params.styles = ['/game/scorescout/common.css', '/game/scorescout/server.css'];
            params.scripts = ['/game.js', '/game/scorescout/server.js'];
            // return client.token;
            return files.makePage(files.game.scorescout.server, client, params);
        }
    });


    // GAME STUFFS
    function broadcastPlayers(room) {
        rnio.subs(room).obj({
            type: 'playerUpdate',
            body: GameUtils.getRoom(room).players 
        });
    }

    function broadcastGameInfo(room) {
        rnio.subs(room).obj({
            type: 'gameInfo',
            body: GameUtils.getRoom(room)
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
            
            // If a client registers, add it to the scorescout players and broadcast the joining.
            let roomInfo = GameUtils.getRoom(client.token.room);
            if (client.token.type == 'client') {
                client.subscribe(`${client.token.room}-client`);
                client.subscribe(`${client.token.room}-client-${client.token.username}`);
                // Insert playerdata if not already there.
                let playerInfo = roomInfo.players[client.token.username];
                if (!playerInfo) {
                    playerInfo = {
                        score: 0,
                        fondness: {},
                        team: DEF_TEAM
                    };
                }
                playerInfo.username = client.token.username;
                playerInfo.online = true;
                roomInfo.players[client.token.username] = playerInfo;
                client.obj({type: 'takeOwner', body: client.token.username}); // TODO less painful workaround.
                setTimeout(() => broadcastPlayers(client.token.room), 20);
            } else if (client.token.type == 'server') {
                roomInfo.serverOnline = true;
                if (!roomInfo.state) roomInfo.state = 'lobby';
                if (!roomInfo.findingtime) roomInfo.findingtime = DEF_FINDING_TIME;
                if (!roomInfo.ingametime)  roomInfo.ingametime  = DEF_INGAME_TIME;
                if (!roomInfo.scoringtime) roomInfo.scoringtime = DEF_SCORING_TIME;
                if (!roomInfo.maxteamsize) roomInfo.maxteamsize = DEF_MAX_PLAYERS;
                if (!roomInfo.serverTimerId) roomInfo.serverTimerId = -1;
                if (!roomInfo.paused) roomInfo.paused = true;
                rnio.subs(`${client.token.room}`).obj({
                    type: 'hoststatus',
                    body: 'online'
                });
                broadcastPlayers(client.token.room);
            }
            return {type: 'gameInfo', body: roomInfo};
        }
    });

    router.on('wsClose', (params, client) => {
        if (!client.token.room || client.token.game != 'scorescout') return;
        let roomInfo = GameUtils.getRoom(client.token.room);
        if (client.token.type == 'client') {
            let playerInfo = roomInfo.players[client.token.username];
            if (!playerInfo) return;
            if (roomInfo.state == 'lobby') {
                delete roomInfo.players[client.token.username];
            } else {
                playerInfo.online = false;
            }
            broadcastPlayers(client.token.room);
        } else if (client.token.type == 'server') {
            roomInfo.serverOnline = false;
            // Broadcast 1 minute warning
            rnio.subs(`${client.token.room}-client`).obj({
                type: 'hoststatus',
                body: 'offline',
            });
            // After 1 minute if the host hasn't returned; break up the room.
            setTimeout(() => {
                if (GameUtils.getRoom(client.token.room).serverOnline == false) {
                    rnio.subs(client.token.room).obj({
                        type: 'redirect',
                        body: '/?error=Host disconnected!'
                    });
                    GameUtils.deleteRoom(client.token.room);
                }
            }, 60000);
        }
    });

    router.ws('/saveSettings', (params, client) => {
        if (!client.token.room || client.token.game != 'scorescout') throw [403, 'Not in game?!'];
        let roomInfo = GameUtils.getRoom(client.token.room);
        if (params.findingtime) roomInfo.findingtime = params.findingtime;
        if (params.ingametime) roomInfo.ingametime = params.ingametime;
        if (params.scoringtime) roomInfo.scoringtime = params.scoringtime;
        if (params.maxteamsize) roomInfo.maxteamsize = params.maxteamsize;
        return roomInfo;
    });

    function outNum(n) {
        return n < 10 ? '0' + n : n;
    }

    function doTimer(roomcode) {
        let roomInfo = GameUtils.getRoom(roomcode);
        if (!roomInfo.time) return;
        let timeArr = roomInfo.time.split(":");
        let timeH = parseInt(timeArr[0]);
        let timeM = parseInt(timeArr[1]);
        let timeS = parseInt(timeArr[2]);
        timeS--;
        if (timeS < 0) {
            timeM--;
            timeS = 59;
        }
        if (timeM < 0) {
            timeH--;
            timeM = 59;
        }
        if (timeH < 0) {
            timeH = 0;
            timeM = 0;
            timeS = 0;
            roomInfo.time = `${outNum(timeH)}:${outNum(timeM)}:${outNum(timeS)}`;
            doNext(roomcode);
            return;
        }
        roomInfo.time = `${outNum(timeH)}:${outNum(timeM)}:${outNum(timeS)}`;
    }

    router.ws('/pause', (params, client) => {
        if (!client.token.room || client.token.game != 'scorescout') throw [403, 'Not in game?!'];
        let roomInfo = GameUtils.getRoom(client.token.room);
        if (params.continue) {
            roomInfo.paused = false;
            broadcastGameInfo(client.token.room);
            if (roomInfo.serverTimerId == -1) {
                let roomCode = roomInfo.code;
                roomInfo.serverTimerId = setInterval(function() { doTimer(roomCode) }, 1000);
            }
        } else {
            roomInfo.paused = true;
            clearInterval(roomInfo.serverTimerId);
            roomInfo.serverTimerId = -1;
        }
        broadcastGameInfo(client.token.room);
    });

    router.ws('/stop', (params, client) => {
        if (!client.token.room || client.token.game != 'scorescout') throw [403, 'Not in game?!'];
        let roomInfo = GameUtils.getRoom(client.token.room);
        roomInfo.state = 'lobby';
        roomInfo.time = "00:00:00";
        clearInterval(roomInfo.serverTimerId);
        roomInfo.serverTimerId = -1;

        // Remove all teams:
        let players = roomInfo.players;
        for (let playerName in players) {
            let player = players[playerName];
            player.team = DEF_TEAM;
        }
        broadcastPlayers(client.token.room);
        broadcastGameInfo(client.token.room);
    });

    router.ws('/clickUser', (params, client) => {
        if (!client.token.room || client.token.game != 'scorescout') throw [403, 'Not in game?!'];
        let roomInfo = GameUtils.getRoom(client.token.room);
        if (params.kick) {
            rnio.subs(`${client.token.room}-client-${params.username}`).obj({
                type: 'redirect',
                body: '/?error=Kicked from room!'
            });
            delete roomInfo.players[params.username];
            broadcastPlayers(client.token.room);
            // TODO Actually kick the websocket? Hack proving etc. Revoke token.
        } else if (params.newScore !== undefined) {
            roomInfo.players[params.username].score = params.newScore;
            broadcastPlayers(client.token.room);
        }
    });

    // Reset from server just resets the game.
    router.ws('/resetScores', (params, client) => {
        if (!client.token.room || client.token.game != 'scorescout') throw [403, 'Not in game?!'];
        let roomInfo = GameUtils.getRoom(client.token.room);
        let players = roomInfo.players;
        for (let playerName in players) {
            let player = players[playerName];
            player.score = 0;
        }
        broadcastGameInfo(client.token.room);
        broadcastPlayers(client.token.room);
    });

    router.ws('/tellOrder', (params, client) => {
        if (!client.token.room || client.token.game != 'scorescout') throw [403, 'Not in game?!'];
        let roomInfo = GameUtils.getRoom(client.token.room);
        let player = roomInfo.players[client.token.username];
        player.order = params.order;
    });

    
    function incrementFondness(roomcode, needle, haystack) {
        for (let hay of haystack) {
            let roomInfo = GameUtils.getRoom(roomcode);
            roomInfo.players[needle.username].fondness[hay.username]++;
            roomInfo.players[hay.username].fondness[needle.username]++;

            hay.fondness[needle.username]++;
            needle.fondness[hay.username]++;
        }
    }

    function totalFondness(needle, haystack) {
        let fondness = 0;
        for (let hay of haystack) {
            fondness += hay.fondness[needle.name];
        }
        return fondness;
    }

    function distributeTeams(roomcode, players, maxTeamSize) {
        // console.log('Distributing players:');
        // console.dir(players);
        let teams = [];
        let teamIndex = 0;
        
        let pickplayers = [...Object.values(players)];
        let maxTeams = Math.ceil(pickplayers.length / maxTeamSize);
        // Initialise empty teams
        for (let i = 0; i < maxTeams; i++) {
            teams[i] = new Array();
        }

        // Fix player fondness
        for(let player of pickplayers) {
            for (let fondPlayer of pickplayers) {
                if (fondPlayer.username !== player.username) {
                    if (player.fondness[fondPlayer.username] === undefined) {
                        let roomInfo = GameUtils.getRoom(roomcode);
                        roomInfo.players[player.username].fondness[fondPlayer.username] = 0;
                        player.fondness[fondPlayer.username] = 0;
                    }
                }
            }
        }
        // throw[500, JSON.stringify(players)];/
    
        // For the last players:
        let lastPlayerLargestTeamFondness = 0;
        let lastPlayerLargestTeamIndex = 0;
        let lastPlayerSearchingIndex = 0;
    
        while (pickplayers.length > 0) {
            // console.log(`Picking player for team ${teamIndex}...`);
            // if (pickplayers.length > maxTeams) {
    
            // }
            // Initialise candidates
            let largestFoundFondness = 0;
            let largestFondessIndeces = [];
            // Aggregrate all players of all other teams.
            let otherTeamsPlayers = [];
            for (let i = 0; i < maxTeams; i++) {
                if (i !== teamIndex) otherTeamsPlayers.push(...teams[i]);
            }
            // console.log(`Players in other teams:`);
            // console.dir(otherTeamsPlayers);
    
            // console.log('Cycling through all possible players:');
            // console.dir(pickplayers);
            for (let i = 0; i < pickplayers.length; i++) {
                // A player has more 'fondness' towards players it already played against.
                // We want to minimalise total fondness fairly so we chose the player
                // that has the most fondness towards all other groups.
                let fondness = totalFondness(pickplayers[i], otherTeamsPlayers);
                if (fondness > largestFoundFondness) {
                    largestFoundFondness = fondness;
                    largestFondessIndeces.splice(0, largestFondessIndeces.length);
                }
                if (fondness === largestFoundFondness) {
                    largestFondessIndeces.push(i);
                }
            }
            // console.log(`Players with the largest fondness (${largestFoundFondness}): `);
            // console.dir(largestFondessIndeces);
            // console.log('Selecting random player from that list:');
            let randomIndex = Math.floor(Math.random() * largestFondessIndeces.length);
            let randomPlayer = pickplayers[largestFondessIndeces[randomIndex]];
            // console.dir(randomPlayer);
    
            if (pickplayers.length >= players.length % maxTeams) {
                // console.log('Updating fondness of whole team.');
                // console.log(`Putting ${randomPlayer} into team ${teamIndex}.`);
                incrementFondness(roomcode, randomPlayer, teams[teamIndex]);
                teams[teamIndex].push(randomPlayer);
                randomPlayer.team = `TEAM${teamIndex}`;
                pickplayers.splice(largestFondessIndeces[randomIndex], 1);
            } else {
                // console.log('This is one of the last players...');
                if (lastPlayerSearchingIndex < maxTeams) {
                    // console.log(`Checking if team ${teamIndex} has best place at ${largestFoundFondness}`);
                    if (largestFoundFondness > lastPlayerLargestTeamFondness) {
                        lastPlayerLargestTeamFondness = largestFoundFondness;
                        lastPlayerLargestTeamIndex = teamIndex;
                        // console.log('As for now it does.')
                    }
                    lastPlayerSearchingIndex++;
                } else {
                    if (lastPlayerLargestTeamIndex === teamIndex) {
                        // console.log('This is the team!!!!');
                        incrementFondness(roomcode, randomPlayer, teams[teamIndex]);
                        teams[teamIndex].push(randomPlayer);
                        randomPlayer.team = `TEAM${teamIndex}`;
                        pickplayers.splice(largestFondessIndeces[randomIndex], 1);
                        lastPlayerLargestTeamFondness = 0;
                        lastPlayerLargestTeamIndex = 0;
                        lastPlayerSearchingIndex = 0;
                    } else {
                        // console.log('Skipping this team.');
                    }
                }
    
            }
    
            // console.log('Current team make:');
            // console.dir(teams[teamIndex]);
            // const t = await askQuestion('Continue?');
            // console.log(t);
    
            teamIndex++;
            if (teamIndex >= maxTeams) teamIndex = 0;
        }
        return teams;
    }

    function doNext(roomcode) {
        let roomInfo = GameUtils.getRoom(roomcode);
        let players = roomInfo.players;
        switch(roomInfo.state) {
            case 'lobby':
            case 'scoring':

                let teams = [];
                for (let playerName in players) {
                    let player = players[playerName];
                    if (!teams.includes(player.team) && player.online && player.order) {
                        teams.push(player.team);
                        if (player.order.length > 0) {players[player.order[0]].score += 3};
                        if (player.order.length > 1) {players[player.order[1]].score += 2};
                        if (player.order.length > 2) {players[player.order[2]].score += 1};
                    }
                                        
                    // TODO real team devision
                    // player.team = `TEST${Math.round(Math.random() * 3)}`;
                }
                distributeTeams(roomcode, players, roomInfo.maxteamsize);
                // Sort players based on score.
                // players.sort((a, b) => a.score - b.score);
                roomInfo.state = 'finding';
                roomInfo.time = roomInfo.findingtime;
            break;
            case 'finding':
                roomInfo.state = 'gaming';
                roomInfo.time = roomInfo.ingametime;
            break;
            case 'gaming':
                roomInfo.state = 'scoring';
                roomInfo.time = roomInfo.scoringtime;
            break;
            default:
                // Error? Refert to lobby
                roomInfo.state = 'lobby';
                roomInfo.time = "00:00:00";

            break;
        }
        broadcastGameInfo(roomcode);
        broadcastPlayers(roomcode);
    }

    // Next from server starts the timer thing.
    router.ws('/next', (params, client) => {
        if (!client.token.room || client.token.game != 'scorescout') throw [403, 'Not in game?!'];
        doNext(client.token.room);
    });


};