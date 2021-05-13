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
        callEvent('onClose', e.reason);
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        setTimeout(function() {
            connect();
        }, 1000);
    };
}

function registerHandler(event, handler) {
    let handlers = eventHandlers.get(event);
    if (!handlers) handlers = [];
    handlers.push(handler);
    eventHandlers.set(event, handlers);
}

function isIterable(obj) {
    return obj != null && typeof obj[Symbol.iterator] === 'function';
}

function callEvent(event, params) {
    let handlers = eventHandlers.get(event);
    if (!isIterable(handlers)) return;
    for (let handler of handlers) {
        handler(params);
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function rpc(path, params) {
    socket.send(JSON.stringify({path, params}));
}

registerHandler('onMessage', (data) => console.dir(data));
registerHandler('onOpen', () => {
    document.getElementById('constatus').innerHTML = 'Online';
    rpc('/epr/iclient', {pwd});
});
registerHandler('onClose', () => {
    document.getElementById('constatus').innerHTML = 'Offline';
});

// Client number thing
registerHandler('clientnum', (num) => document.getElementById('conline').innerHTML = num);

// Tree thing
registerHandler('trees', (trees) => {
    document.getElementById('trees').innerHTML = '';
    for (let treecode in trees) {
        let treebar = document.createElement('div');
        treebar.className = 'treebar';
        let treetext = document.createElement('p');
        treetext.innerText = `Tree ${treecode}: [${trees[treecode].online ? 'ONLINE': 'OFFLINE?'}]`;
        treebar.appendChild(treetext);
        let togglebtn = document.createElement('button');
        togglebtn.onclick = function() {
            toggleLed(treecode);
        };
        togglebtn.innerText = 'Toggle';
        treebar.appendChild(togglebtn);

        let shockbtn = document.createElement('button');
        shockbtn.onclick = function() {
            shockTree(treecode);
        };
        shockbtn.innerText = 'SHOCK';
        treebar.appendChild(shockbtn);

        document.getElementById('trees').appendChild(treebar);
    }

});


// Toggle led on tree
function toggleLed(code) {
    rpc('/epr/treetoggle', {code});
}

// Toggle led on tree
function shockTree(code) {
    rpc('/epr/treeshock', {code});
}


//OPEN THE SOCKET!
connect();