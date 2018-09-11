// Variables
var baseCoords = [38.889463, -77.035146];
var mymap = L.map("mapid").setView(baseCoords, 16);

// Bathroom custom icon
var bathroomIcon = L.icon({
  iconUrl: "./assets/images/bathroomRed.png",
  shadowUrl: "",
  iconSize: [30, 30], // size of the icon
  iconAnchor: [15, 30], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -20] // point from which the popup should open relative to the iconAnchor
});
// Current location custom icon
var currentLocIcon = L.icon({
  iconUrl: "./assets/images/map-marker-person.png",
  iconSize: [38, 42],
  iconAnchor: [20, 36],
  popupAnchor: [0, -40],
  shadowUrl: "",
  shadowSize: [68, 95],
  shadowAnchor: [22, 94]
});

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
// nationalMallPoly.addTo(mymap);

// Creating the base tile Layer and adding it to the map
L.tileLayer(
  "https://api.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2FtLXBvcCIsImEiOiJjamhucjhhNXgwNTE0MzZwYWQxenprNG5kIn0.9c-GiLb45NYrZeAiy3TZ6w",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    minZoom: 14,
    id: "mapbox.outdoors",
    accessToken:
      "pk.eyJ1Ijoic2FtLXBvcCIsImEiOiJjamhucjhhNXgwNTE0MzZwYWQxenprNG5kIn0.9c-GiLb45NYrZeAiy3TZ6w"
  }
).addTo(mymap);

// Creating layer groups
var lgWest = L.layerGroup();
var lgEast = L.layerGroup();
var lgBathroom = L.layerGroup();

// Create the NM-West markers from the POI json file, bind their popups to the modals and add them to the map
var NMwestMarkers = L.geoJSON(NMwest, {
  onEachFeature: function(feature, layer) {
    layer.addTo(lgWest);
    createModals(feature);
    layer.bindPopup(
      feature.properties.name +
        "<br>" +
        "<a class='waves-effect waves-light modal-trigger' href='#" +
        feature.properties.modalID +
        "'><b>Click here for more info</b></a>"
    );
  }
});

// Create the NM-East markers from the POI json file, bind their popups to the modals and add them to the map
var NMeastMarkers = L.geoJSON(NMeast, {
  onEachFeature: function(feature, layer) {
    layer.addTo(lgEast);
    createModals(feature);
    layer.bindPopup(
      feature.properties.name +
        "<br>" +
        "<a class='waves-effect waves-light modal-trigger' href='#" +
        feature.properties.modalID +
        "'><b>Click here for more info</b></a>"
    );
  }
});

// Create the Public Bathrooms markers from the POI json file & bind their popups
var publicBathrooms = L.geoJSON(bathrooms, {
  onEachFeature: function(feature, layer) {
    layer.addTo(lgBathroom);
    layer.bindPopup("<b>Public Restroom</b><br/>" + feature.properties.name);
  },
  pointToLayer: function(geoJsonPoint, latlng) {
    return L.marker(latlng, {
      icon: bathroomIcon
    });
  }
});

// Createing the Overlay controls
var overlays = {
  West: lgWest,
  East: lgEast,
  Restrooms: lgBathroom
};

//  Creating the control layer (collapsed on smaller screens)
if ($(window).width() < 667) {
  L.control
    .layers(null, overlays, {
      collapsed: true
    })
    .addTo(mymap);
} else {
  L.control
    .layers(null, overlays, {
      collapsed: false
    })
    .addTo(mymap);
}

// Adding the default map layers
lgWest.addTo(mymap);
lgEast.addTo(mymap);

// Creating the modal (DOM) and fetching summary from Wikipedia API
function createModals(feature) {
  var apiURL =
    "https://en.wikipedia.org/w/api.php?format=json&action=query&pithumbsize=500&prop=extracts|pageimages&exintro=&explaintext=&titles=" +
    feature.properties.name;
  $.ajax({
    type: "GET",
    dataType: "jsonp",
    url: apiURL,
    success: function(data) {
      // on API success

      // accessing the relevent info
      var page = data.query.pages;
      var key = Object.keys(page)[0];
      var summary = page[key].extract;
      var picSrc = "";
      if (page[key].thumbnail) picSrc = page[key].thumbnail.source;

      summary = summary.replace(/(?:\r\n|\r|\n)/g, "<br /><br />"); //replaces line breaks in the text with html line break

      var modal = $("<div>")
        .addClass("modal")
        .attr("id", feature.properties.modalID)
        .append([
          $("<div>")
            .addClass("modal-content")
            .append([
              $("<div>")
                .addClass("closeBtn")
                .append(
                  $("<a>")
                    .addClass("modal-close")
                    .attr("href", "#!")
                    .append(
                      $("<i>")
                        .addClass("material-icons")
                        .text("close")
                    )
                ),
              $("<h4>").text(feature.properties.name),
              $("<img>").attr({
                src: picSrc,
                class: "modalPic materialboxed",
                "data-caption": feature.properties.name,
                width: "300"
              }),
              $("<p>").html(summary),
              $("<p>")
                .css({
                  "font-size": "0.8em",
                  "font-style": "italic"
                })
                .html(
                  "Source: <a href='https://en.wikipedia.org/wiki/" +
                    feature.properties.name +
                    "' target='_blank'>Wikipedia.org</a>"
                )
            ])
        ]);

      $("#modals").append(modal);
    },
    error: function() {
      // on API error
      console.log("API ERROR, Fetching failed.");
    }
  });
}

// DOCUMENT READY
$(document).ready(function() {
  // Change the zoom level for smaller screens (zoom-out)
  if ($(window).width() < 667) mymap.setView(baseCoords, 15);

  // Init materialize modal & materialbox (with a delay to let the createModals function time to finish manipulating the DOM)
  setTimeout(function() {
    $(".modal").modal();
    $(".materialboxed").materialbox();
  }, 1500);

  setTimeout(function() {
    $("#locBtn").removeClass("pulse");
  }, 4500);

  // Current conditions toast
  M.toast({
    classes: "alertToast",
    html:
      "<a href='https://www.nps.gov/nama/planyourvisit/conditions.htm' target='_blank'><i class='tiny material-icons'>notifications</i>&nbsp;Click here for current Alerts & Conditions </a>"
  });
}); // END OF document ready

// Use the user current location
function runCurrentLoc() {
  // Show my current location
  var myLoc = mymap.locate({
    setView: false,
    // maxZoom: 16,
    watch: true,
    enableHighAccuracy: true
  });
  function removeLocMarker() {
    if (currentMarker) mymap.removeLayer(currentMarker);
  }

  // Current location success function
  function onLocationFound(e) {
    removeLocMarker;
    var radius = e.accuracy / 2;
    var currentMarker = L.marker(e.latlng, {
      icon: currentLocIcon
    });
    setTimeout(function() {
      currentMarker
        .addTo(mymap)
        .bindPopup("You are here!")
        .openPopup();
    }, 500);

    //   L.circle(e.latlng, radius).addTo(mymap);
  }

  // Current location error function
  function onLocationError(e) {
    alert(e.message);
  }

  mymap.on("locationfound", onLocationFound);
  mymap.on("locationerror", onLocationError);
}
