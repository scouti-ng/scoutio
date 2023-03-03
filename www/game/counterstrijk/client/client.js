let dead = false;
let map = L.map('mapid').setView([52.18148, 5.94202], 20);
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: '7kasper/ckqanzt8m10em17qo8qo450c2',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiN2thc3BlciIsImEiOiJja3Fhbnh0azEwYnlwMnZxc2tzZzZkem9pIn0.6pJm3cUa4m6Mot9wy6GYSg'
}).addTo(map);


function reqLoc() {
    map.locate({setView: true, maxZoom: 16});

}

map.on('locationfound', function(e) {
    var radius = e.accuracy;

    L.circle(e.latlng, {
        radius,
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
    }).addTo(map);
});

map.on('locationerror', function(e) {
    alert(e.message);
});

// On connect subscribe to the room:
registerHandler('onOpen', () => {
    rpc('/game/counterstrijk/register', {token: getCookie('token')});
    setTimeout(() => reqLoc(), 2000);
});

//debug
registerHandler('onMessage', (data) => console.dir(data));

registerHandler('hoststatus', (data) => document.getElementById('hostoffline').style.display = (data == 'online' ? 'none': 'block'));

// Redirect to other page.
registerHandler('redirect', (data) => window.location.href = data);

registerHandler('gameInfo', (body) => {
    if (body.state == 'lobby') {
        
    }
    if (body.state == 'game') {
        
    }
});