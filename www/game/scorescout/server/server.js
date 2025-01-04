let state = 'lobby';
let paused = false;

let timeH = 0;
let timeM = 0;
let timeS = 0;
let timerId = -1;

function updateTime(timeStr) {
    let timeArr = timeStr.split(':');
    timeH = parseInt(timeArr[0]);
    timeM = parseInt(timeArr[1]);
    timeS = parseInt(timeArr[2]);
    document.getElementById('time').innerHTML = `${outNum(timeH)}:${outNum(timeM)}:${outNum(timeS)}`;
    if (state !== 'lobby' && !paused) {
        if (timerId == -1) {
            timerId = setInterval(doTimer, 1000);
        } 
    }
}

function outNum(n) {
    return n < 10 ? '0' + n : n;
}

function doTimer() {
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
        clearInterval(timerId);
        timerId = -1;
    }
    document.getElementById('time').innerHTML = `${outNum(timeH)}:${outNum(timeM)}:${outNum(timeS)}`;
}

function saveSettings() {
    rpc('/game/scorescout/saveSettings', {
        findingtime: document.getElementById('infidingtime').value,
        ingametime: document.getElementById('ingametime').value,
        scoringtime: document.getElementById('inscoringtime').value,
        maxteamsize: document.getElementById('inmaxteamsize').value
    });
}

function clickPlayer(username) {
    const kick = confirm(`Do you want to kick ${username}?`);
    if (kick) {
        rpc('/game/scorescout/clickUser', {username, kick: true});
    } else {
        const changeScore = confirm(`Change score of ${username}?`);
        if (changeScore) {
            const newScore = parseInt(prompt(`Enter new score for ${username}:`));
            rpc('/game/scorescout/clickUser', {username, newScore});
        }
    }
}

// On connect subscribe to the room:
registerHandler('onOpen', () => {
    rpc('/game/scorescout/register', {token: getCookie('token')});
});

// On disconnect make thingy red:
registerHandler('onClose', () => {
    document.getElementById('roomcode').style.borderColor = 'var(--cred)';
});

//debug
registerHandler('onMessage', (data) => console.dir(data));

registerHandler('redirect', (data) => window.location.href = data);

registerHandler('playerUpdate', (players) => {
    let waitingPlayers = document.getElementById('players');
    waitingPlayers.innerHTML = '';
    
    document.getElementById('waitingforplayers').style.display = (Object.keys(players).length > 0 ? 'none' : 'block');
    waitingPlayers.style.display = (Object.keys(players).length > 0 ? 'flex' : 'none');

    for (let playerName in players) {
        let player = players[playerName];
        // Create div for team if not already there yet.
        let teamDiv = document.getElementById(player.team);
        if (!teamDiv) {
            teamDiv = document.createElement('div');
            teamDiv.setAttribute('id', player.team);
            teamDiv.classList.add('team');
            let teamName = document.createElement('div');
            teamName.classList.add('teamname');
            teamName.innerText = player.team;
            teamDiv.appendChild(teamName);
            let newTeamPlayerDiv = document.createElement('div');
            newTeamPlayerDiv.classList.add('teamplayers');
            teamDiv.appendChild(newTeamPlayerDiv);
            waitingPlayers.appendChild(teamDiv);
        }
        let teamPlayers = teamDiv.lastChild;


        let waitingPlayer = document.createElement('div');
        waitingPlayer.classList.add('waitingplayer');
        let playerIcon = document.createElement('i');
        playerIcon.classList.add('fas');
        playerIcon.classList.add(player.online ? (player.theone ? 'fa-user-graduate' : 'fa-user'): 'fa-user-slash');
        waitingPlayer.appendChild(playerIcon);
        let waitingName = document.createElement('div');
        waitingName.classList.add('waitingname');
        waitingName.innerText = `${playerName} [${player.score}]`;
        waitingPlayer.appendChild(waitingName);
        if(player.dead) {
            waitingPlayer.classList.add('DEAD');
        }
        waitingPlayer.onclick = function() {
            clickPlayer(playerName);
        }
        teamPlayers.appendChild(waitingPlayer);
    }
});

registerHandler('gameInfo', (body) => {
    state = body.state;
    paused = body.paused;

    if (body.time) updateTime(body.time);

    if (state === 'lobby' || paused) {
        clearInterval(timerId);
        timerId = -1;
    } else {
        if (timerId == -1) {
            timerId = setInterval(doTimer, 1000);
        }        
    }

    // We are online :-)
    document.getElementById('roomcode').style.borderColor = 'var(--cprimary)';

    if (paused) {
        document.getElementById('pauseBtn').innerHTML = 'Continue';
    } else {
        document.getElementById('pauseBtn').innerHTML = 'Pause';
    }

    if (body.findingtime) document.getElementById('infidingtime').value  = body.findingtime;
    if (body.ingametime)  document.getElementById('ingametime').value    = body.ingametime;
    if (body.scoringtime) document.getElementById('inscoringtime').value = body.scoringtime;
    if (body.maxteamsize) document.getElementById('inmaxteamsize').value = body.maxteamsize;

    switch(body.state) {
        case 'finding':
            document.getElementById('status').innerText = 'Players finding their teams...';
            document.getElementById('pauseBtn').disabled = false;
            document.getElementById('stopBtn').innerHTML = 'Stop';
            document.getElementById('nextBtn').innerHTML = 'Skip';
        break;
        case 'gaming':
            document.getElementById('status').innerText = 'Gaming in progress...';
            document.getElementById('pauseBtn').disabled = false;
            document.getElementById('stopBtn').innerHTML = 'Stop';
            document.getElementById('nextBtn').innerHTML = 'Force Finish';
        break;
        case 'scoring':
            document.getElementById('status').innerText = 'Players scoring each other...';
            document.getElementById('pauseBtn').disabled = false;
            document.getElementById('stopBtn').innerHTML = 'Stop';
            document.getElementById('nextBtn').innerHTML = 'Skip Collecting Scores';
        break;
        case 'lobby':
        default:
            document.getElementById('status').innerText = 'Click start to devide teams!';
            document.getElementById('pauseBtn').disabled = true;
            document.getElementById('stopBtn').innerHTML = 'Reset Scores';
            document.getElementById('nextBtn').innerHTML = 'Start';
            // Stop timer if not already done.
            clearInterval(timerId);
            timerId = -1;
        break;
    }

});

function next() {
    rpc('/game/scorescout/next', {});
}

function pause() {
    rpc('/game/scorescout/pause', {continue: paused});
}

function stop() {
    if (state === 'lobby') {
        const sure = confirm('Are you sure you wish to reset all scores?');
        if (sure) rpc('/game/scorescout/resetScores', {});
    } else {
        const sure = confirm('Are you sure you wish to pre-emptively stop the game?');
        if (sure) rpc('/game/scorescout/stop', {});
    }
}

function answer(option) {
    rpc('/game/scorescout/answerS', {option});
}

function reset() {
    timeC = 0;
    timeS = 0;
    timeM = 0;
    document.getElementById('time').innerHTML = `${outNum(timeM)}:${outNum(timeS)}:${outNum(timeC)}`;
    rpc('/game/scorescout/reset', {});
}