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
        treebar.id = `tree-${treecode}`;
        let treetext = document.createElement('p');
        treetext.id = `treetxt-${treecode}`;
        treetext.innerText = `Tree ${treecode}: [${trees[treecode].online ? 'ONLINE': 'OFFLINE?'}]`;
        treebar.appendChild(treetext);
        let togglebtn = document.createElement('button');
        togglebtn.onclick = function() {
            toggleLed(treecode);
        };
        togglebtn.innerText = 'Toggle';
        treebar.appendChild(togglebtn);

        let touchrbtn = document.createElement('button');
        touchrbtn.onclick = function() {
            touchResetTree(treecode);
        };
        touchrbtn.innerText = `Touch Reset`;
        touchrbtn.classList.add('touchrbtn');
        treebar.appendChild(touchrbtn);

        let shockbtn = document.createElement('button');
        shockbtn.onclick = function() {
            shockTree(treecode);
        };
        shockbtn.innerText = `SHOCK ${treecode}`;
        shockbtn.classList.add('shockbtn');
        treebar.appendChild(shockbtn);

        document.getElementById('trees').appendChild(treebar);
    }

});

registerHandler('cams', (cams) => {
    document.getElementById('cams').innerHTML = '';
    for (let camcode in cams) {
        let camsqr = document.createElement('div');
        camsqr.className = 'camsqr';
        camsqr.id = `cam-${camcode}`;
        let camtext = document.createElement('p');
        camtext.innerText = `Cam ${camcode}: [${cams[camcode].online ? 'ONLINE': 'OFFLINE?'}]`;
        camsqr.appendChild(camtext);

        let togglebtn = document.createElement('button');
        togglebtn.onclick = function() {
            toggleCamLed(camcode);
        };
        togglebtn.innerText = 'Flash';
        camsqr.appendChild(togglebtn);

        let onbtn = document.createElement('button');
        onbtn.onclick = function() {
            camOn(camcode);
        };
        onbtn.innerText = 'Camera On';
        camsqr.appendChild(onbtn);

        let offbtn = document.createElement('button');
        offbtn.onclick = function() {
            camOff(camcode);
        };
        offbtn.innerText = 'Camera Off';
        camsqr.appendChild(offbtn);

        let br = document.createElement('br');
        camsqr.appendChild(br);

        let image = document.createElement('img');
        image.src = "data:image/jpeg;base64," + cams[camcode].pic;
        camsqr.appendChild(image);
        document.getElementById('cams').appendChild(camsqr);
    }

});

registerHandler('togglestate', (obj) => {
    document.getElementById(`tree-${obj.code}`).style.backgroundColor = obj.status ? 'lightblue' : 'white';
    document.getElementById(`treetxt-${obj.code}`).innerText = `Tree ${obj.code}: [Online][${obj.batvolt}]`;
});

registerHandler('toggledflash', (obj) => {
    document.getElementById(`cam-${obj.code}`).style.backgroundColor = obj.status ? 'lightblue' : 'white';
});


// Toggle led on tree
function toggleLed(code) {
    rpc('/epr/treetoggle', {code});
}

// Toggle led on cam
function toggleCamLed(code) {
    rpc('/epr/cameratoggle', {code});
}

// Toggle led on tree
function shockTree(code) {
    rpc('/epr/treeshock', {code});
}

function touchResetTree(code) {
    rpc('/epr/treetouchreset', {code});
}

function camOn(code) {
    rpc('/epr/cameraon', {code});
}

function camOff(code) {
    rpc('/epr/cameraoff', {code});
}

function meep() {
    rpc('/epr/touch', {level: Math.random() * 100});
}

// Touch graph :P
//TODO Tidy up
// var ctx = document.getElementById('myChart');
// var t = 0;
// var tdata = {
//     labels: [],
//     datasets: [{
//       label: 'Touchy',
//       data: [],
//       fill: false,
//       borderColor: 'rgb(75, 192, 192)',
//       tension: 0.1
//     }]
//   };;
// var myChart = new Chart(ctx, {
//     type: 'line',
//     data: tdata,
//     options: {
//         animation: false
//     }
// });

// function upGraph(value) {
//     tdata.datasets[0].data.push(value);
//     tdata.labels.push(t++);
//     myChart.update();
//     if (t > 100) {
//         tdata.datasets[0].data.shift();
//         tdata.labels.shift();
//     }
// }

// Touch graph new
const el = document.getElementById('chart');
const dataFast = [];
const dataSlow = [];
const chart = new TimeChart(el, {
    baseTime: 0,
    series: [
        {
            name: 'Fast',
            data: dataFast,
        },
        {
            name: 'Slow',
            data: dataSlow,
            lineWidth: 2,
            color: 'red',
        },
    ],
    xRange: { min: 0, max: 20 * 1000 },
    realTime: true,
    zoom: {
        x: {
            autoRange: true,
            minDomainExtent: 50,
        },
        y: {
            autoRange: true,
            minDomainExtent: 1,
        }
    },
});
document.getElementById('follow-btn').addEventListener('click', function () {
    chart.options.realTime = true;
});

function upGraph(obj) {
    dataFast.push({x: obj.time, y: obj.level});
    dataSlow.push({x: obj.time, y: obj.large});
    chart.update();
}

registerHandler('tupdate', (obj) => upGraph(obj));

//OPEN THE SOCKET!
connect();