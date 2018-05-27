// Global Variables
var baseCoords = [38.889488, -77.035285];
var mymap = L.map('mapid').setView(baseCoords, 16);

//mapbox.streets-satellite <- maybe use
L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2FtLXBvcCIsImEiOiJjamhucjhhNXgwNTE0MzZwYWQxenprNG5kIn0.9c-GiLb45NYrZeAiy3TZ6w', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    minZoom: 14,
    id: 'mapbox.outdoors',
    accessToken: 'pk.eyJ1Ijoic2FtLXBvcCIsImEiOiJjamhucjhhNXgwNTE0MzZwYWQxenprNG5kIn0.9c-GiLb45NYrZeAiy3TZ6w'
}).addTo(mymap);



var marker = L.marker(baseCoords);
var polygon = L.polygon([
    [38.892239, -77.052317],
    [38.888548, -77.052666],
    [38.885876, -77.049817],
    [38.87995, -77.039915],
    [38.881821, -77.034272],
    [38.887526, -77.033639],
    [38.887579, -77.014342],
    [38.892089, -77.014761]
]);

// add to map
marker.addTo(mymap);
polygon.addTo(mymap);

// binding objects to popups
marker.bindPopup("Start here").openPopup();
polygon.bindPopup("<b>The National Mall<b>");

var popup = L.popup();

function onMapClick(e) {
    popup.setLatLng(e.latlng).setContent("You clicked the map at " + e.latlng.toString()).openOn(mymap);
}

mymap.on('click', onMapClick);

// show my current location
// var myLoc = mymap.locate({
//     setView: true,
//     maxZoom: 16
// });

// functions that can be called when my location is found and on error
function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(mymap)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(mymap);
}

function onLocationError(e) {
    alert(e.message);
}
mymap.on('locationfound', onLocationFound);
mymap.on('locationerror', onLocationError);


// var myIcon = L.icon({
//     iconUrl: './assets/images/wmIcon.png',
//     iconSize: [38, 95],
//     iconAnchor: [22, 94],
//     popupAnchor: [-3, -76],
//     shadowUrl: 'my-icon-shadow.png',
//     shadowSize: [68, 95],
//     shadowAnchor: [22, 94]
// });
// L.marker(baseCoords, {
//     icon: myIcon
// }).addTo(mymap);