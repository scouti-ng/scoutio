// On connect subscribe to the room:
registerHandler('onOpen', () => {
    rpc('/game/scorescout/register', {token: getCookie('token')});
});

//debug
registerHandler('onMessage', (data) => console.dir(data));

registerHandler('hoststatus', (data) => document.getElementById('hostoffline').style.display = (data == 'online' ? 'none': 'block'));

// Redirect to other page.
registerHandler('redirect', (data) => window.location.href = data);

registerHandler('gameInfo', (body) => {
    if (body.state == 'lobby') {
        document.getElementById('status').innerText = 'Waiting for the host...';
    }
    if (body.state == 'game') {
        document.getElementById('status').innerText = 'Tap quickly if you know the answer!';

    }
});

document.onclick = answer;

function answer() {
    rpc('/game/scorescout/answer');
}