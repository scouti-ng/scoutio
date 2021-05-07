// Open socket connction for all use.
let socket = null;
let openHandler = () => {
    console.log('Connection established');
};
let eventHandlers = new Map();
function connect() {
    socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:${window.location.port}/`);
    socket.onopen = openHandler;
    socket.onmessage = function(e) {
        //TODO call eventhandlers.
        console.log('Message: ' , e.data);
    }
    socket.onclose = function(e) {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        setTimeout(function() {
            connect();
        }, 1000);
    };
}


//OPEN THE SOCKET!
connect();

function registerHandler(eventName, handler) {
    let handlers = eventHandlers.get(eventName);
    if (!handlers) handlers = [];
    handlers.push(handler);
    eventHandlers.set(eventName, handlers);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}