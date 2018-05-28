// Global Variables
var baseCoords = [38.889488, -77.035285];
var mymap = L.map('mapid').setView(baseCoords, 16);
var nationalMallPoly = L.polygon([
    [38.892239, -77.052317],
    [38.888548, -77.052666],
    [38.885876, -77.049817],
    [38.87995, -77.039915],
    [38.881821, -77.034272],
    [38.887526, -77.033639],
    [38.887579, -77.014342],
    [38.892089, -77.014761]
]);

var NMwestMarkers = L.geoJSON(NMwest, {
    onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.name);
    }
}).addTo(mymap);

var currentLocIcon = L.icon({
    iconUrl: './assets/images/map-marker-person.png',
    iconSize: [38, 42],
    iconAnchor: [20, 36],
    popupAnchor: [-3, -76],
    shadowUrl: '',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
});


L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2FtLXBvcCIsImEiOiJjamhucjhhNXgwNTE0MzZwYWQxenprNG5kIn0.9c-GiLb45NYrZeAiy3TZ6w', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    minZoom: 14,
    id: 'mapbox.outdoors',
    accessToken: 'pk.eyJ1Ijoic2FtLXBvcCIsImEiOiJjamhucjhhNXgwNTE0MzZwYWQxenprNG5kIn0.9c-GiLb45NYrZeAiy3TZ6w'
}).addTo(mymap);


// add to map the NM polygon
// nationalMallPoly.addTo(mymap); //FIXME: save for later

var popup = L.popup();

function onMapClick(e) {
    // popup.setLatLng(e.latlng).setContent("You clicked the map at " + e.latlng.toString()).openOn(mymap);
    // console.log(e.layer._leaflet_id);
    NMwestMarkers.removeLayer(e.layer._leaflet_id);
}


// show my current location //FIXME: save for later
// var myLoc = mymap.locate({
//     setView: true,
//     maxZoom: 16,
//     // watch: true,
//     enableHighAccuracy: true
// });

// current location success / error functions
function onLocationFound(e) {
    // mymap.removeLayer(currentMarker); //FIXME: save for later

    var radius = e.accuracy / 2;
    var currentMarker = L.marker(e.latlng, {
        icon: currentLocIcon
    });
    currentMarker.addTo(mymap)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();
    L.circle(e.latlng, radius).addTo(mymap);
}

function onLocationError(e) {
    alert(e.message);
}

mymap.on('locationfound', onLocationFound);
mymap.on('locationerror', onLocationError);

$(document).ready(function () {
    // displays the West markers


    NMwestMarkers.on('click', onMapClick);
});