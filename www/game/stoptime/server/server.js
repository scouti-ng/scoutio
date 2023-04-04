let state = 'lobby';

function clickPlayer(username) {
    rpc('/game/stoptime/clickUser', {username});
}

// On connect subscribe to the room:
registerHandler('onOpen', () => {
    rpc('/game/stoptime/register', {token: getCookie('token')});
});

//debug
registerHandler('onMessage', (data) => console.dir(data));

registerHandler('playerUpdate', (players) => {
    let waitingPlayers = document.getElementById('players');
    waitingPlayers.innerHTML = '';
    
    document.getElementById('waitingforplayers').style.display = (Object.keys(players).length > 0 ? 'none' : 'block');
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
        waitingPlayers.appendChild(waitingPlayer);
    }
});

registerHandler('gameInfo', (body) => {
    state = body.state;
    if (body.state == 'lobby') {
        document.getElementById('status').innerText = 'Click next to begin!';
        document.getElementById('nextBtn').disabled = false;
    }
    if (body.state == 'game') {
        document.getElementById('status').innerText = 'Waiting for player to answer.';
        document.getElementById('nextBtn').disabled = true;
    }
    if (body.lastPlayer) {
        alert(body.lastPlayer);
    }
});

function next() {
    rpc('/game/stoptime/next', {});
}

function answer(option) {
    rpc('/game/stoptime/answerS', {option});
}

function reset() {
    rpc('/game/stoptime/reset', {});
}