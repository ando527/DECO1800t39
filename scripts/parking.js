var parkingMap;
var parkingLocation;
var parkingName;
var parkingPrice;
var parkingDistance;
var markerLayer;

$( document ).ready(function() {
    
    parkingMap = L.map('parkingMap').setView([-27.47, 153.02 /* change to parkinglocation */], 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(parkingMap);

    markerLayer = L.layerGroup().addTo(map);
});
