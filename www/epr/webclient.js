var audioContext = AudioContext && new AudioContext();
function beep(amp, freq, ms){//amp:0..100, freq in Hz, ms
  if (!audioContext) return;
  var osc = audioContext.createOscillator();
  var gain = audioContext.createGain();
  osc.connect(gain);
  osc.value = freq;
  gain.connect(audioContext.destination);
  gain.gain.value = amp/100;
  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime+ms/1000);
}

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

let isAutoRanging = true;

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
        treetext.innerText = `Tree ${trees[treecode].alias}: [${trees[treecode].online ? 'ONLINE': 'OFLINE'}]`;
        treebar.appendChild(treetext);
        let togglebtn = document.createElement('button');
        togglebtn.onclick = function() {
            toggleLed(treecode);
        };
        togglebtn.innerText = 'Measure';
        treebar.appendChild(togglebtn);

        let touchrbtn = document.createElement('button');
        touchrbtn.onclick = function() {
            touchResetTree(treecode);
        };
        touchrbtn.innerText = `RelResets`;
        touchrbtn.classList.add('touchrbtn');
        treebar.appendChild(touchrbtn);

        let pulseWidthFld = document.createElement('input');
        pulseWidthFld.type = 'number';
        pulseWidthFld.value = 500;
        treebar.appendChild(pulseWidthFld);

        let shockbtn = document.createElement('button');
        shockbtn.onclick = function() {
            shockTree(treecode, pulseWidthFld.value);
        };
        shockbtn.innerText = `SINGLE SHOCK`;
        shockbtn.classList.add('shockbtn');
        treebar.appendChild(shockbtn);

        let chrgbtn = document.createElement('button');
        chrgbtn.onclick = function() {
            chargeTree(treecode);
        };
        chrgbtn.innerText = `ChargeMode`;
        chrgbtn.classList.add('chrgbtn');
        treebar.appendChild(chrgbtn);

        // thresholds
        let trUT = document.createElement('input');
        trUT.type = 'number';
        trUT.placeholder = 'trUT';
        if (trees[treecode].truT !== undefined && trees[treecode].truT > 0) {
            trUT.value = trees[treecode].truT;
        }
        treebar.appendChild(trUT);
        let trLT = document.createElement('input');
        trLT.type = 'number';
        trLT.placeholder = 'trLT';
        if (trees[treecode].trlT !== undefined && trees[treecode].trlT > 0) {
            trLT.value = trees[treecode].trlT;
        }
        treebar.appendChild(trLT);
        let trUB = document.createElement('input');
        trUB.type = 'number';
        trUB.placeholder = 'trUB';
        if (trees[treecode].truB !== undefined && trees[treecode].truB > 0) {
            trUB.value = trees[treecode].truB;
        }
        treebar.appendChild(trUB);
        let trLB = document.createElement('input');
        trLB.type = 'number';
        trLB.placeholder = 'trLB';
        if (trees[treecode].trlB !== undefined && trees[treecode].trlB > 0) {
            trLB.value = trees[treecode].trlB;
        }
        treebar.appendChild(trLB);
        let tCYC = document.createElement('input');
        tCYC.type = 'number';
        tCYC.placeholder = 'tCYC';
        if (trees[treecode].tcyc !== undefined && trees[treecode].tcyc > 0) {
            tCYC.value = trees[treecode].tcyc;
        }
        treebar.appendChild(tCYC);
        let autoBtn = document.createElement('button');
        autoBtn.onclick = function() {
            setAutoShock(treecode, !trees[treecode].autoshocking, trUT.value, trLT.value, trUB.value, trLB.value, tCYC.value, pulseWidthFld.value);
        };
        autoBtn.innerText = `AUTO SHOCKING ${trees[treecode].autoshocking ? 'OF' : 'ON'}`;
        autoBtn.classList.add('shockbtn');
        treebar.appendChild(autoBtn);


        let intervalFld = document.createElement('input');
        intervalFld.type = 'number';
        intervalFld.placeholder = 'SchockInterval (seconds)';
        if (trees[treecode].shockbo !== undefined && trees[treecode].shockbo > 0) {
            intervalFld.value = trees[treecode].shockbo;
        }
        treebar.appendChild(intervalFld);
//t
        let intervalbtn = document.createElement('button');
        intervalbtn.onclick = function() {
            setShockBo(treecode, intervalFld.value, !(trees[treecode].shockbo !== undefined && trees[treecode].shockbo > 0), pulseWidthFld.value);
        };
        intervalbtn.innerText = `TURN SHOCKING $${trees[treecode].alias} ${trees[treecode].shockbo ? 'OF' : 'ON'}`;
        intervalbtn.classList.add('shockbtn');
        treebar.appendChild(intervalbtn);

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
        camtext.innerText = `Cam ${camcode}: [${cams[camcode].online ? 'ONLINE': 'OFLINE'}] Bat: [${cams[camcode].level}]`;
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

registerHandler('promptalias', (obj) => {
    let alias = prompt(`Enter alias for ${obj.code}:`);
    if (alias) {
        rpc('/epr/givealias', {code: obj.code, alias});
    }
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
function shockTree(code, pw) {
    rpc('/epr/treeshock', {code, pw});
}

// Toggle tree charging
function chargeTree(code) {
    rpc('/epr/treecharge', {code});
}

// Toggle an set interval on shocking.
function setShockBo(code, interval, on, pw) {
    rpc('/epr/shockbo', {code, interval, on, pw});
}

// Toggle automagic shocking on or off.
function setAutoShock(code, on, truT, trlT, truB, trlB, tcyc, pw) {
    rpc('/epr/autoshock', {code, on, truT, trlT, truB, trlB, tcyc, pw});
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
const elTop = document.getElementById('chartTop');
const elBot = document.getElementById('chartBot');

const dataFast = [];
const dataSlow = [];
const dataFast2 = [];
const dataSlow2 = [];
const events = [];
const invis = [];
const chart = new TimeChart(el, {
    baseTime: 0,
    series: [
        {
            name: 'Fast',
            data: dataFast,
            color: 'orange'
        },
        {
            name: 'Slow',
            data: dataSlow,
            lineWidth: 2,
            color: 'red',
            visible: false
        },
        {
            name: 'Fast2',
            data: dataFast2,
            color: 'lightgreen'
        },
        {
            name: 'Slow2',
            data: dataSlow2,
            lineWidth: 2,
            color: 'green',
            visible: false
        },
        {
            name: 'invis',
            data: invis,
            lineWidth: 2,
            color: 'purple',
            visible: false
        }
    ],
    xRange: { min: 0, max: 20 * 1000 },
    xScaleType: d3.scaleUtc,
    realTime: false,
    zoom: {
        x: {
            autoRange: true,
            minDomainExtent: 50,
        },
        y: {
            autoRange: true,
            minDomainExtent: 1,
        },
        panMouseButtons: 4
    },
    plugins: {
        events: new TimeChart.plugins_extra.EventsPlugin(events),
    }
});

const chartTop = new TimeChart(elTop, {
    baseTime: 0,
    series: [
        {
            name: 'Fast',
            data: dataFast,
            color: 'orange'
        },
        {
            name: 'Slow',
            data: dataSlow,
            lineWidth: 2,
            color: 'red',
            visible: false
        }
    ],
    xRange: { min: 0, max: 20 * 1000 },
    xScaleType: d3.scaleUtc,
    realTime: false,
    zoom: {
        x: {
            autoRange: true,
            minDomainExtent: 50,
        },
        y: {
            autoRange: false,
            minDomainExtent: 1,
        },
        panMouseButtons: 4
    },
    plugins: {
        events: new TimeChart.plugins_extra.EventsPlugin(events),
    }
});
const chartBot = new TimeChart(elBot, {
    baseTime: 0,
    series: [
        {
            name: 'Fast',
            data: dataFast2,
            color: 'lightgreen'
        },
        {
            name: 'Slow',
            data: dataSlow2,
            lineWidth: 2,
            color: 'green',
            visible: false
        }
    ],
    xRange: { min: 0, max: 20 * 1000 },
    xScaleType: d3.scaleUtc,
    realTime: false,
    zoom: {
        x: {
            autoRange: true,
            minDomainExtent: 50,
        },
        y: {
            autoRange: false,
            minDomainExtent: 1,
        },
        panMouseButtons: 4
    },
    plugins: {
        events: new TimeChart.plugins_extra.EventsPlugin(events),
    }
});
// zerotime
let zeroTime = 0;

// reposition legend hack
let rrrr = document.querySelector("#chart").shadowRoot.querySelector("chart-legend");
rrrr.style.right = '';
rrrr.style.top = '';
rrrr.style.left = '50px';
rrrr.style.bottom = '25px';

// add redline thing hack
let redLine = document.createElement('div');
redLine.style.display = 'flex';
redLine.style.margin = 'auto';
redLine.style.width = '2px';
redLine.style.height = '100%';
redLine.style.zIndex = '90';
redLine.style.backgroundColor = 'red';
redLine.style.position = 'relative';
redLine.style.justifyContent = 'center';
redLine.style.alignItems = 'end';
// The time of the redline.
let redTimer = document.createElement('div');
redTimer.id = 'redTimer';
redTimer.style.height = '1.2em';
redTimer.style.padding = '0.2em';
redTimer.style.marginBottom = '0.5em';
redTimer.style.color = 'red';
redTimer.style.backgroundColor = 'black';
redTimer.style.fontFamily = 'monospace';
redLine.appendChild(redTimer);
document.querySelector("#chart").shadowRoot.querySelector("div").appendChild(redLine);
// Always keep this timer up to date:
function fixNumberZero(num) {
    if(num < 10) return '0'+num;
    else return ''+num;
}
function formatDate(n) {
    let sign = '+';
    if (n.getUTCHours() > 12){
        n.setUTCHours(23-n.getUTCHours()); 
        n.setUTCMinutes(59-n.getUTCMinutes()); 
        n.setUTCSeconds(59-n.getUTCSeconds()); 
        n.setUTCMilliseconds(999-n.getUTCMilliseconds());
        sign = '-';
    };
    return {date: n, sign};
}

chart.model.updated.on(() => {
    let md = formatDate(new Date(zeroTime + getChartMiddleTime()));
    redTimer.innerHTML = `${md.sign}${fixNumberZero(md.date.getUTCHours())}:${fixNumberZero(md.date.getUTCMinutes())}:${fixNumberZero(md.date.getUTCSeconds())}`;
});

chartTop.model.updated.on(() => {
    scalGraphOrSomething(chartTop, dataFast);
});
chartBot.model.updated.on(() => {
    scalGraphOrSomething(chartBot, dataFast2);
});

function updateGraphs() {
    chart.update();
    chartTop.update();
    chartBot.update();
}

let lastX;
let closeEventIndex = -1;
let draggingEvent = -1;


function findNearestEvent() {
    for(let ei = 0; ei < events.length; ei++) {
        let e = events[ei];
        if (e.x - 100 < lastX && lastX < e.x + 100) {
            closeEventIndex = ei;
            document.body.style.cursor = 'col-resize';
            return;
        }
    }
    if (draggingEvent == -1) document.body.style.cursor = 'auto';
    closeEventIndex = -1;
}

document.addEventListener('mousedown', function(event) {
    if (event.button == 0) draggingEvent = closeEventIndex;
    if (draggingEvent != -1) document.body.style.cursor = 'move';
});

document.addEventListener('mouseup', function(event) {
    if (event.button == 0 && draggingEvent != -1) {
        events[draggingEvent].x = lastX;
        updateGraphs();
        draggingEvent = -1;
        document.body.style.cursor = 'auto';
    }
});

// Ultimate beun. See the grpah text thingies.
function labelHack() {
    chart.nearestPoint.qpoints.forEach((value, key) => {
        lastX = value.x;
        findNearestEvent();
        
        document.querySelector("#chart").shadowRoot.querySelector("chart-legend").shadowRoot.querySelectorAll('.visible').forEach(label => {
            if (label.querySelector('label').innerText == key.name) {
                let valMeter = label.querySelector('.valuemeter');
                if (!valMeter) {
                    valMeter = document.createElement('div');
                    valMeter.classList.add('valuemeter');
                    label.appendChild(valMeter);
                    label.style.justifyContent = 'space-between';
                }
                valMeter.innerHTML = ` = ${value.y.toFixed(2)}`;
            }
        });
        document.querySelector("#chart").shadowRoot.querySelector("chart-legend").shadowRoot.querySelector("div:nth-child(2) > label")
    });
}
chart.nearestPoint.updated.on(labelHack);

function getChartMiddleTime() {
    let curDomain = chart.plugins.zoom.options.x.scale.domain();
    return (curDomain[1] - curDomain[0])/2 + curDomain[0];
}

document.getElementById('follow-btn').addEventListener('click', function () {
    chart.options.realTime = true;
    chartBot.options.realTime = true;
    chartTop.options.realTime = true;
});

setTimeout(() => {
    chart.options.realTime = true;
    chartBot.options.realTime = true;
    chartTop.options.realTime = true;
}, 500);

let playing = -1;
let maxValue = -1;
let minValue = 0;
let scaleFactor = 1;

function scrollChart() {
    let curDomain = chart.plugins.zoom.options.x.scale.domain();
    if (scaleFactor > 0 && curDomain[1] < maxValue || scaleFactor < 0 && curDomain[1] > minValue) {
        curDomain[0]+= scaleFactor*10;
        curDomain[1]+= scaleFactor*10;
        chart.plugins.zoom.options.x.scale.domain(curDomain);
        chart.update();
    }
    scalGraphOrSomething(chartTop, dataFast);
    chartTop.update();
    scalGraphOrSomething(chartBot, dataFast2);
    chartBot.update();
}

function scalGraphOrSomething(chaart, daata) {
    // if (!isAutoRanging) return;
    let curDomain = chaart.plugins.zoom.options.x.scale.domain();
    let avg = 0;
    let am = 0;
    let cum = 0;
    let min = Infinity;
    let max = -Infinity;
    for (let d of daata) {
        if (d.x > curDomain[0] && d.x < curDomain[1]) {
            am++;
            cum += d.y;
            if (d.y < min) min = d.y;
            if (d.y > max) max = d.y;
        }
    }
    avg = cum/am;
    chaart.plugins.zoom.options.y.scale.domain([min, max]);
    chaart.update();
}

function playPause() {
    if (playing == -1) {
        if (invis.length > 1) {
            maxValue = invis[invis.length-1].x; // little hack todo more proper.
            minValue = invis[0].x; // little hack todo more proper.
        } else {
            maxValue = dataFast[dataFast.length-1].x; // little hack todo more proper.
            minValue = dataFast[0].x; // little hack todo more proper.
        }
        playing = setInterval(scrollChart, 10);
        document.getElementById('playpause-btn').innerHTML = 'Pause';
    } else {
        clearInterval(playing);
        playing = -1;
        document.getElementById('playpause-btn').innerHTML = 'Play';
    }
}

document.getElementById('zero-btn').addEventListener('click', function() {
    zeroTime = -getChartMiddleTime();
    chart.options.baseTime = zeroTime;
    chartTop.options.baseTime = zeroTime;
    chartBot.options.baseTime = zeroTime;
    updateGraphs();
});

document.getElementById('playpause-btn').addEventListener('click', function () {
    playPause();
});

document.getElementById('speed').addEventListener('change', function() {
    scaleFactor = this.value;
});

let showSlow = false;
document.getElementById('slowtoggle-btn').addEventListener('click', function() {
    if (showSlow) {
        chart.options.series.forEach(data => {
            if (data.name.includes('Slow')) data.visible = false;
        });
        chartTop.options.series.forEach(data => {
            if (data.name.includes('Slow')) data.visible = false;
        });
        chartBot.options.series.forEach(data => {
            if (data.name.includes('Slow')) data.visible = false;
        });
        document.getElementById('slowtoggle-btn').innerHTML = 'Show Slow';
        showSlow = false;
        updateGraphs();
    } else {
        chart.options.series.forEach(data => {
            if (data.name.includes('Slow')) data.visible = true;
        });
        chartTop.options.series.forEach(data => {
            if (data.name.includes('Slow')) data.visible = true;
        });
        chartBot.options.series.forEach(data => {
            if (data.name.includes('Slow')) data.visible = true;
        });
        document.getElementById('slowtoggle-btn').innerHTML = 'Hide Slow';
        showSlow = true;
        updateGraphs();
    }
});

document.getElementById('legendtoggle-btn').addEventListener('click', function() {
    if (rrrr.style.visibility == 'hidden') {
        rrrr.style.visibility = 'visible';
        document.getElementById('legendtoggle-btn').innerHTML = 'Hide Legend';
    } else {
        rrrr.style.visibility = 'hidden';
        document.getElementById('legendtoggle-btn').innerHTML = 'Show Legend';
    }
});

// var test;
document.getElementById('upload-btn').addEventListener('click', function () {
    let file = document.getElementById("ota-file").files[0];
    if (file) {
        let reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = function (e) {
            let binaryString = e.target.result;
            alert('test');
            let size = file.size;
            let splitSize = size;
            let chunks = [];
            let i = 0;
            while(splitSize > 2000) { // hardcoded 2000 byte size chunks.
                chunks.push({
                    chunknum: i, 
                    chunksize: 2000,
                    chunk: btoa(binaryString.substring(i*2000, (i+1)*2000))
                });
                splitSize -= 2000;
                i++;
            }
            // Also the last part
            if (splitSize > 0) {
                chunks.push({
                    chunknum: i,
                    chunksize: splitSize,
                    chunk: btoa(binaryString.substring(i*2000, size))
                });
            }
            // let base64str = btoa(binaryString);
            let version = parseInt(document.getElementById('version').value);
            rpc('/epr/uploadota', {
                version, size, data: chunks
            }); 
        }
        reader.onerror = function (e) {
            alert("Read file error!");
        }
    }
});

document.getElementById('flash-btn').addEventListener('click', function () {
    rpc('/epr/doota');
});

document.getElementById('flashcam-btn').addEventListener('click', function () {
    rpc('/epr/dootacam');
});

let stoDatFast = 0;
let stoDatFastTime = 0;


function upGraph(obj) {
    // Remove spikes by comparing single point against threshold
    // based on the two points around it. So we calculate a sort of lef right average.
    lastRecvX = obj.time;
    if (dataFast.length > 1) {
        let back = dataFast[dataFast.length - 1].y;
        let middle = stoDatFast;
        let front = obj.level;
        let avg = (back + front) / 2;

        if (middle < front && middle < back && middle < (avg - 10)) {
            middle = avg;
        }
        dataFast.push({x: stoDatFastTime, y: middle});
        stoDatFast = obj.level;
        stoDatFastTime = obj.time;
    } else {
        dataFast.push({x: obj.time, y: obj.level});
        stoDatFast = obj.level;
        stoDatFastTime = obj.time;
    }

    // dataFast.push({x: obj.time, y: obj.level});
    dataSlow.push( {x: obj.time, y: obj.large});
    dataFast2.push({x: obj.time, y: obj.level2});
    dataSlow2.push({x: obj.time, y: obj.large2});
    scalGraphOrSomething(chartTop, dataFast);
    scalGraphOrSomething(chartBot, dataFast2);
    updateGraphs();
}

function saveFile() {
    let m = new Date();
    let hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURIComponent(JSON.stringify({
        version: 1.1, dataFast, dataSlow, dataFast2, dataSlow2, events
    }));
    hiddenElement.target = '_blank';
    hiddenElement.download = `Data-${m.getFullYear()}_${m.getMonth()}_${m.getDate()}-${m.getHours()}_${m.getMinutes()}_${m.getSeconds()}.json`;
    hiddenElement.click();
}

const bigpage = document.getElementById('bigpage');
function highlight(e) {
    bigpage.classList.add('highlight')
}
function unhighlight(e) {
    bigpage.classList.remove('highlight')
}
let lastRecvX = 0;
// prompt event on right click.
bigpage.addEventListener('contextmenu', function (e) {
    if (lastX) {
        e.preventDefault();
        if (closeEventIndex == -1) {
            let name = prompt('Enter event name');
            if (name) {
                events.push({x: lastRecvX, name: name});
                // events.push({x: lastX, name: `start[${name}]`});
                // events.push({x: lastX + 1000, name: `end[${name}]`});
            }
            updateGraphs();
        } else {
            if (window.confirm(`Rename event ${events[closeEventIndex].name}?`)) {
                let newName = prompt('Enter name:');
                if (newName) {
                    let oldName = events[closeEventIndex].name;
                    if (oldName.includes('start')) events[closeEventIndex].name = `start[${newName}]`;
                    else if (oldName.includes('end')) events[closeEventIndex].name = `end[${newName}]`;
                    else events[closeEventIndex].name = newName;
                    updateGraphs();
                }
            } else if (window.confirm(`Delete event ${events[closeEventIndex].name}?`)){
                events.splice(closeEventIndex, 1);
                updateGraphs();
            }
        }

    }
});
;['dragenter', 'dragover'].forEach(eventName => {
    bigpage.addEventListener(eventName, highlight, false)
})
;['dragleave', 'drop'].forEach(eventName => {
    bigpage.addEventListener(eventName, unhighlight, false)
})


function sanitiseX(arr, newArr) {
    let sanOffset = 0;
    let largestNow = -1;
    for (let entry of newArr) {
        let x = entry.x + sanOffset;
        if (x > largestNow) largestNow = x;
        else {
            sanOffset = -x + 2 + largestNow;
            x = x + sanOffset;
            largestNow = x;
        }
        entry.x = x;
        arr.push(entry);
    }
}

// On file load, replace contents of the screen.
function loadGraphFile(file) {
    document.getElementById('fileloaded').innerHTML = file.name;
    let fr = new FileReader();
    fr.onload=function() {
        let obj = JSON.parse(fr.result);
        // Release stress on callstack:
        sanitiseX(dataSlow, obj.dataSlow);
        sanitiseX(dataSlow2, obj.dataSlow2);
        sanitiseX(dataFast, obj.dataFast);
        sanitiseX(dataFast2, obj.dataFast2);
        sanitiseX(events, obj.events);
        // Now we do a really interesting hack.
        // We add an invisisble line in the graph so we can go halfway past the start and end.
        // This way the red line in the middle of the graph will make more sense and can be synced with the video later on.
        if (dataFast.length > 1) {
            let startTime = dataFast[0].x
            let endTime = dataFast[dataFast.length-1].x;
            let timeLength = endTime - startTime;
            invis.push({x: startTime - timeLength / 2, y: 0});
            invis.push({x: endTime + timeLength / 2, y: 0});
        }
        updateGraphs();
    }
    fr.readAsText(file);
}
// Helper function for loading on drop event.
function loadFile(e) {
    e.preventDefault();
    loadGraphFile(e.dataTransfer.files[0]);
}
// Load the code when file is dropped on screen.
bigpage.addEventListener('drop', loadFile, false);
window.addEventListener('dragover', function(e){e.preventDefault()}, false);

// Little hack to do same as above but with a clickable folder thing becuase ehh idk weird browser stuff.
document.getElementById('load-btn').addEventListener('click', function () {
    let file = document.getElementById("graph-file").files[0];
    if (file) {
        loadGraphFile(file);
    }
});

ab = document.getElementById('autoranging');
ab.addEventListener('click', function () {
    if (isAutoRanging) {
        ab.innerHTML = 'Turn Auto-Range ON';
        isAutoRanging = false;
    } else {
        ab.innerHTML = 'Turn Auto-Range OF';
        isAutoRanging = true;
        scalGraphOrSomething(chartTop, dataFast);
        chartTop.update();
        scalGraphOrSomething(chartBot, dataFast2);
        chartBot.update();
    }
});

// on ctrl+s
var isCtrl = false;
document.onkeyup=function(e){
    if (e.keyCode == 17) isCtrl = false;
    if (e.keyCode == 83 && isCtrl) saveFile();
    if (e.keyCode == 37) {
        scaleFactor -= parseFloat(document.getElementById('stepsize').value);
        document.getElementById('speed').value = scaleFactor;
    }
    if (e.keyCode == 39) {
        scaleFactor += parseFloat(document.getElementById('stepsize').value);
        document.getElementById('speed').value = scaleFactor;
    }
    if (e.keyCode == 32) {
        playPause();
    }
}
document.onkeydown=function(e){
    if(e.keyCode == 17) isCtrl = true;
    if(e.keyCode == 83 && isCtrl == true) return false;
}

registerHandler('tupdate', (obj) => upGraph(obj));

registerHandler('doingShock', (obj) => {
    beep(100, 200, obj.pw + 2200);
    events.push({x: obj.time, name: `start[SHOCK]`});
    events.push({x: obj.time + obj.pw + 2200, name: `end[SHOCK]`});
    chart.update();
});

//OPEN THE SOCKET!
connect();