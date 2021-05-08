// On connect subscribe to the room:
registerHandler('onOpen', () => {
    rpc('/game/1vs100/register', {token: getCookie('token')});
});

//debug
registerHandler('onMessage', (data) => console.dir(data));