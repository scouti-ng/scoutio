const readline = require('readline');

async function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}


// Start Variables
let playernames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
let players = [];

function initialisePlayers(playernames) {
    for(let playername of playernames) {
        let fondness = {};
        for (let fondPlayer of playernames) {
            if (fondPlayer !== playername) {
                fondness[fondPlayer] = 0;
            }
        }
        players[playername] = {
            name: playername,
            fondness: fondness
        };
    }
}

function incrementFondness(needle, haystack) {
    for (let hay of haystack) {
        hay.fondness[needle.name]++;
        needle.fondness[hay.name]++;
    }
}

function totalFondness(needle, haystack) {
    let fondness = 0;
    for (let hay of haystack) {
        fondness += hay.fondness[needle.name];
    }
    return fondness;
}

async function distributeTeams(players, maxTeamSize) {
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
            incrementFondness(randomPlayer, teams[teamIndex]);
            teams[teamIndex].push(randomPlayer);
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
                    incrementFondness(randomPlayer, teams[teamIndex]);
                    teams[teamIndex].push(randomPlayer);
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

initialisePlayers(playernames);
// console.dir(players);

async function run() {
    // console.dir(Object.values(players));
    for (let i = 0; i < 1000; i++) {
        //console.dir(distributeTeams(players, 4));
        await distributeTeams(players, 4);
    }

    console.dir(players);
}

run();

