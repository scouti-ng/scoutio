let state = 'lobby';
let paused = false;
let ownName = null;
let ownTeam = '';

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

// On connect subscribe to the room:
registerHandler('onOpen', () => {
    rpc('/game/scorescout/register', {token: getCookie('token')});
});

registerHandler('takeOwner', (data) => {
    ownName = data;
});

//debug
registerHandler('onMessage', (data) => console.dir(data));

registerHandler('hoststatus', (data) => document.getElementById('hostoffline').style.display = (data == 'online' ? 'none': 'block'));

// Redirect to other page.
registerHandler('redirect', (data) => window.location.href = data);

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

    switch(body.state) {
        case 'lobby':
            document.getElementById('status').innerText = 'Wait until the game begins!';
            let waitingPlayers = document.getElementById('players');
            waitingPlayers.innerHTML = '';
            $("#players").sortable( "option", "disabled", true );
        break;
        case 'finding':
            document.getElementById('status').innerText = 'Find the players in your group!';
            $("#players").sortable( "option", "disabled", true );
        break;
        case 'gaming':
            document.getElementById('status').innerText = 'Game Away!';
            $("#players").sortable( "option", "disabled", true );
        break;
        case 'scoring':
            document.getElementById('status').innerText = 'All agree on the scoring order.';
            $("#players").sortable( "option", "disabled", false);
        break;
        default:
            document.getElementById('status').innerText = 'Idk whats ahappening';
        break;
    }
});

registerHandler('playerUpdate', (players) => {
    let teamname = document.getElementById('teamName');
    teamname.style.display = ((Object.keys(players).length > 0 && state !== 'lobby') ? 'flex' : 'none');
    let waitingPlayers = document.getElementById('players');
    waitingPlayers.innerHTML = '';
    waitingPlayers.style.display = ((Object.keys(players).length > 0 && state !== 'lobby') ? 'flex' : 'none');
    if (state === 'lobby') return;
    if (!ownName || !players[ownName]) return;
    ownTeam = players[ownName].team;
    teamname.innerHTML = ownTeam;
    for (let playerName in players) {
        let player = players[playerName];
        if (player.team !== ownTeam) continue;

        let waitingPlayer = document.createElement('div');
        waitingPlayer.classList.add('player');
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
        let hamburgerIcon = document.createElement('i');
        if (state == 'scoring') {
            hamburgerIcon.classList.add('fas');
            hamburgerIcon.classList.add('fa-bars');
        }
        waitingPlayer.appendChild(hamburgerIcon);
        waitingPlayer.onclick = function() {
            clickPlayer(playerName);
        }
        waitingPlayers.appendChild(waitingPlayer);
    }
});

document.onclick = answer;

function answer() {
    rpc('/game/scorescout/answer');
}

$(function () {
    $("#players").sortable({
        stop: function (event, ui) {
            let order = [];
            $("#players").children().each((index, elem) => {
                order.push($(elem).find('.waitingname').text().split(" ")[0]);
            });
            rpc('/game/scorescout/tellOrder', {order});
            // alert(JSON.stringify(order));
        }
    });
  });