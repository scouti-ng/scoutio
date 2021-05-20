let state = 'lobby';

function clickPlayer(username) {
    rpc('/game/1vs100/clickUser', {username});
}

// On connect subscribe to the room:
registerHandler('onOpen', () => {
    rpc('/game/1vs100/register', {token: getCookie('token')});
});

//debug
registerHandler('onMessage', (data) => console.dir(data));

registerHandler('playerUpdate', (players) => {
    let waitingPlayers = document.getElementById('players');
    waitingPlayers.innerHTML = '';
    
    document.getElementById('waitingforplayers').style.display = (Object.keys(players).length > 0 ? 'none' : 'block');
    let doAnon = false;
    for (let playerName in players) {
        let player = players[playerName];
        let waitingPlayer = document.createElement('div');
        waitingPlayer.classList.add('waitingplayer');
        let playerIcon = document.createElement('i');
        playerIcon.classList.add('fas');
        playerIcon.classList.add(player.online ? (player.theone ? 'fa-user-graduate' : 'fa-user'): 'fa-user-slash');
        waitingPlayer.appendChild(playerIcon);
        let waitingName = document.createElement('div');
        waitingName.classList.add('waitingname');
        waitingName.innerText = playerName;
        waitingPlayer.appendChild(waitingName);
        waitingPlayer.onclick = function() {
            clickPlayer(playerName);
        }
        if(player.dead) {
            waitingPlayer.classList.add('DEAD');
        }
        waitingPlayers.appendChild(waitingPlayer);
        doAnon = true;
    }
    if (doAnon && state == 'lobby') {
        let waitingPlayer = document.createElement('div');
        waitingPlayer.classList.add('waitingplayer');
        waitingPlayer.classList.add('randomplayer');
        let playerIcon = document.createElement('i');
        playerIcon.classList.add('fas');
        playerIcon.classList.add('fa-user-secret');
        waitingPlayer.appendChild(playerIcon);
        let waitingName = document.createElement('div');
        waitingName.classList.add('waitingname');
        waitingName.innerText = 'Random';
        waitingPlayer.appendChild(waitingName);
        waitingPlayer.onclick = function() {
            clickPlayer('!!random!!');
        }
        waitingPlayers.appendChild(waitingPlayer);
    }
});

registerHandler('gameInfo', (body) => {
    state = body.state;
    if (body.state == 'lobby') {
        document.getElementById('status').innerText = 'Select the one to begin.';
        document.getElementById('nextBtn').disabled = true;
        document.getElementById('aBtn').disabled = true;
        document.getElementById('bBtn').disabled = true;
        document.getElementById('cBtn').disabled = true;
    }
    if (body.state == 'game') {
        document.getElementById('status').innerText = 'Click next to begin!';
        document.getElementById('nextBtn').disabled = false;
        document.getElementById('aBtn').disabled = true;
        document.getElementById('bBtn').disabled = true;
        document.getElementById('cBtn').disabled = true;
    }
    if (body.state == 'question') {
        document.getElementById('status').innerText = 'Click the correct answer.';
        document.getElementById('nextBtn').disabled = true;
        document.getElementById('aBtn').disabled = false;
        document.getElementById('bBtn').disabled = false;
        document.getElementById('cBtn').disabled = false;
    }
});

function next() {
    rpc('/game/1vs100/next', {});
}

function answer(option) {
    rpc('/game/1vs100/answerS', {option});
}

function reset() {
    rpc('/game/1vs100/reset', {});
}