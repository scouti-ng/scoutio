// Open socket connction for all use.
let socket = null;
let eventHandlers = new Map();
function connect() {
    socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:${window.location.port}/`);
    socket.onopen = function() {
        callEvent('onOpen', {});
    };
    socket.onmessage = function(e) {
        let data = JSON.parse(e.data);
        // Always call onMessage:
        callEvent('onMessage', data);
        // Handle errors:
        if (data.error) {
            callEvent('onError', {code: data.code, error: data.error});
        } else {
            // Otherwise just call the event with the body.
            callEvent(data.type, data.body);
        }
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

function registerHandler(event, handler) {
    let handlers = eventHandlers.get(eventName);
    if (!handlers) handlers = [];
    handlers.push(handler);
    eventHandlers.set(event, handlers);
}

function callEvent(event, params) {
    for (let handler of eventHandlers.get(event)) {
        handler(params);
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}