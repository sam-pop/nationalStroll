// Variables
var baseCoords = [38.888912, -77.039485];
var mymap = L.map('mapid').setView(baseCoords, 16);

// National mall polygon
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

// Add the NM polygon to the map
// nationalMallPoly.addTo(mymap); //FIXME: save for later

// Creating the base tile Layer and adding it to the map
L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2FtLXBvcCIsImEiOiJjamhucjhhNXgwNTE0MzZwYWQxenprNG5kIn0.9c-GiLb45NYrZeAiy3TZ6w', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    minZoom: 15,
    id: 'mapbox.outdoors',
    accessToken: 'pk.eyJ1Ijoic2FtLXBvcCIsImEiOiJjamhucjhhNXgwNTE0MzZwYWQxenprNG5kIn0.9c-GiLb45NYrZeAiy3TZ6w'
}).addTo(mymap);

// Create the NM-West markers from the POI json file, bind their popups to the modals and add them to the map
var NMwestMarkers = L.geoJSON(NMwest, {
    onEachFeature: function (feature, layer) {
        createModals(feature);
        layer.bindPopup(feature.properties.name + "<br>" + "<a class='waves-effect waves-light modal-trigger' href='#" + feature.properties.modalID + "'><b>~ Click for more info ~</b></a>");
    }
}).addTo(mymap);

// Current location custom icon
// var currentLocIcon = L.icon({
//     iconUrl: './assets/images/map-marker-person.png',
//     iconSize: [38, 42],
//     iconAnchor: [20, 36],
//     popupAnchor: [-3, -76],
//     shadowUrl: '',
//     shadowSize: [68, 95],
//     shadowAnchor: [22, 94]
// });

// Show my current location //FIXME: save for later
// var myLoc = mymap.locate({
//     setView: true,
//     maxZoom: 16,
//     // watch: true,
//     enableHighAccuracy: true
// });

// // Current location success function
// function onLocationFound(e) {
//     // mymap.removeLayer(currentMarker); //FIXME: save for later

//     var radius = e.accuracy / 2;
//     var currentMarker = L.marker(e.latlng, {
//         icon: currentLocIcon
//     });
//     currentMarker.addTo(mymap)
//         .bindPopup("You are within " + radius + " meters from this point").openPopup();
//     L.circle(e.latlng, radius).addTo(mymap);
// }
// // Current location error function
// function onLocationError(e) {
//     alert(e.message);
// }

// mymap.on('locationfound', onLocationFound);
// mymap.on('locationerror', onLocationError);

// Creating the modal (DOM) and fetching summary from Wikipedia API
function createModals(feature) {
    var apiURL = "https://en.wikipedia.org/w/api.php?format=json&action=query&pithumbsize=500&prop=extracts|pageimages&exintro=&explaintext=&titles=" + feature.properties.name;
    $.ajax({
        type: "GET",
        dataType: "jsonp",
        url: apiURL,
        success: function (data) { // on API success
            var page = data.query.pages;
            var key = Object.keys(page)[0];
            var summary = page[key].extract;
            var picSrc = '';
            if (page[key].thumbnail)
                picSrc = page[key].thumbnail.source;

            summary = summary.replace(/(?:\r\n|\r|\n)/g, '<br /><br />'); //replaces line breaks in the text with html line break

            var modal = $('<div>').addClass('modal').attr('id', feature.properties.modalID).append(
                [$('<div>').addClass('modal-content').append([$('<div>').addClass('closeBtn').append($('<a>').addClass('modal-close').attr('href', '#!').append($('<i>').addClass('material-icons').text('close'))),
                        $('<h4>').text(feature.properties.name), $('<img>').attr({
                            'src': picSrc,
                            'class': 'modalPic materialboxed',
                            'width': '300'
                        }), $('<p>').html(summary)
                    ])
                    // , $('<div>').addClass('modal-footer').append($('<p>').text(''))
                ]);

            $('#modals').append(modal);
        },
        error: function () { // on API error
            alert("FAIL!");
        }
    });
}

// DOCUMENT READY 
$(document).ready(function () {
    // init materialize modal (with a delay to let the createModals function time to finish manipulating the DOM)
    setTimeout(function () {
        $('.modal').modal();
        $('.materialboxed').materialbox();
    }, 1000);

}); // END OF document ready