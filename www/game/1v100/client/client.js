let dead = false;

// On connect subscribe to the room:
registerHandler('onOpen', () => {
    rpc('/game/1vs100/register', {token: getCookie('token')});
});

//debug
registerHandler('onMessage', (data) => console.dir(data));

registerHandler('hoststatus', (data) => document.getElementById('hostoffline').style.display = (data == 'online' ? 'none': 'block'));

// Redirect to other page.
registerHandler('redirect', (data) => window.location.href = data);

registerHandler('gameInfo', (body) => {
    if (body.state == 'lobby') {
        dead = false;
        document.getElementById('status').innerText = 'In lobby waiting for host...';
        document.getElementById('aBtn').disabled = true;
        document.getElementById('bBtn').disabled = true;
        document.getElementById('cBtn').disabled = true;
    }
    if (body.state == 'game') {
        document.getElementById('status').innerText = 'Waiting for question...';
        document.getElementById('aBtn').disabled = true;
        document.getElementById('bBtn').disabled = true;
        document.getElementById('cBtn').disabled = true;
    }
    if (body.state == 'question' && dead == false) {
        document.getElementById('status').innerText = 'Enter your answer now!';
        document.getElementById('aBtn').disabled = false;
        document.getElementById('bBtn').disabled = false;
        document.getElementById('cBtn').disabled = false;

    }
});

registerHandler('dead', () => {
    dead = true;
    document.getElementById('status').innerText = 'Game over! Sorry :(';
    document.getElementById('aBtn').disabled = true;
    document.getElementById('bBtn').disabled = true;
    document.getElementById('cBtn').disabled = true;
    document.getElementById('aBtn').classList.remove('selected');
    document.getElementById('bBtn').classList.remove('selected');
    document.getElementById('cBtn').classList.remove('selected');
});

function answer(option) {
    rpc('/game/1vs100/answer', {option});
    switch(option) {
        case "A": 
            document.getElementById('aBtn').classList.add('selected');
            document.getElementById('bBtn').classList.remove('selected');
            document.getElementById('cBtn').classList.remove('selected');
        break;
        case "B":
            document.getElementById('bBtn').classList.add('selected');
            document.getElementById('aBtn').classList.remove('selected');
            document.getElementById('cBtn').classList.remove('selected');
        break;
        case "C":
            document.getElementById('cBtn').classList.add('selected');
            document.getElementById('bBtn').classList.remove('selected');
            document.getElementById('aBtn').classList.remove('selected');
        break;
    }
}