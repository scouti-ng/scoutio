// On connect subscribe to the room:
registerHandler('onOpen', () => {
    rpc('/game/counterstrijk/register', {token: getCookie('token')});
});

//debug
registerHandler('onMessage', (data) => console.dir(data));

registerHandler('hoststatus', (data) => document.getElementById('hostoffline').style.display = (data == 'online' ? 'none': 'block'));

// Redirect to other page.
registerHandler('redirect', (data) => window.location.href = data);