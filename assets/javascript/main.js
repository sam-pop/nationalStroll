// Global variables
let landmarksArr = [];
const baseCoords = [38.889463, -77.035146];
const mymap = L.map("mapid").setView(baseCoords, 16);
// ---------------------------------------------------
// Bathroom custom icon
const bathroomIcon = L.icon({
  iconUrl: "./assets/images/bathroomRed.png",
  shadowUrl: "",
  iconSize: [30, 30], // size of the icon
  iconAnchor: [15, 30], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -20] // point from which the popup should open relative to the iconAnchor
});
// ---------------------------------------------------
// National mall polygon
const nationalMallPoly = L.polygon([
  [38.892239, -77.052317],
  [38.888548, -77.052666],
  [38.885876, -77.049817],
  [38.87995, -77.039915],
  [38.881821, -77.034272],
  [38.887526, -77.033639],
  [38.887579, -77.014342],
  [38.892089, -77.014761]
]);
// ---------------------------------------------------

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

// Use the current user location (using `leaflet-locatecontrol` control and locate method)
L.control
  .locate({
    position: "topleft",
    flyTo: true,
    keepCurrentZoomLevel: true,
    returnToPrevBounds: true,
    strings: {
      popup: "You are HERE!"
    },
    locateOptions: {
      watch: true,
      enableHighAccuracy: true
    },
    onLocationError: function(e) {
      alert(e.message);
    }
  })
  .addTo(mymap);

// Creating layer groups
const lgWest = L.layerGroup();
const lgEast = L.layerGroup();
const lgBathroom = L.layerGroup();

// Create the NM-West markers from the POI json file, bind their popups to the modals and add them to the map
const NMwestMarkers = L.geoJSON(NMwest, {
  onEachFeature: function(feature, layer) {
    landmarksArr.push(feature.properties.name);
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
const NMeastMarkers = L.geoJSON(NMeast, {
  onEachFeature: function(feature, layer) {
    landmarksArr.push(feature.properties.name);
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
const publicBathrooms = L.geoJSON(bathrooms, {
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
const overlays = {
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
  const apiURL =
    "https://en.wikipedia.org/w/api.php?format=json&action=query&pithumbsize=500&prop=extracts|pageimages&exintro=&explaintext=&titles=" +
    feature.properties.name;
  // GET resquest to the wikipedia API
  $.ajax({
    type: "GET",
    dataType: "jsonp",
    url: apiURL,
    // on API success
    success: function(data) {
      // mapping the relevent info in the returned jsonp file
      let page = data.query.pages;
      let key = Object.keys(page)[0];
      let summary = page[key].extract;
      let picSrc = "";
      if (page[key].thumbnail) picSrc = page[key].thumbnail.source;

      // replaces line breaks in the text with the <br> html tag
      summary = summary.replace(/(?:\r\n|\r|\n)/g, "<br /><br />");

      // creating our modal
      let modal = $("<div>")
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
    // on API error
    error: function() {
      console.log("API ERROR, Fetching failed.");
    }
  });
}

// Generate a list of all our landmarks on the page
function createLandmarkList() {
  // Remove duplicates
  uniqueLandmarksArr = landmarksArr.filter(function(item, pos, self) {
    return self.indexOf(item) == pos;
  });
  // Sort the new array
  uniqueLandmarksArr.sort();
  // Creates a list of the landmark names with links to the correlating wikipedia page
  let wikiUrl = "https://en.wikipedia.org/wiki/";
  let list = $("<ul>");
  for (poi of uniqueLandmarksArr) {
    list.append(
      $("<li>").html(
        "<a target='_blank' href='" + wikiUrl + poi + "'>" + poi + "</a>"
      )
    );
  }
  $("#POIs").html(list);
}

// ---------------------------------------------------
// Hide the landmark list section
$("#onBtnClick").hide();
// ---------------------------------------------------

// DOCUMENT READY
// ---------------------------------------------------
$(document).ready(function() {
  createLandmarkList();

  // Change the zoom level for smaller screens (zoom-out)
  if ($(window).width() < 667) mymap.setView(baseCoords, 15);

  // Init materialize modal & materialbox (with a delay to let the createModals function time to finish manipulating the DOM)
  setTimeout(function() {
    $(".modal").modal();
    $(".materialboxed").materialbox();
  }, 1500);

  setTimeout(function() {
    $("#poiBtn").removeClass("pulse");
  }, 4500);

  // Responsive functionality based on windows size
  if ($(window).width() < 667) {
    // Landmark list in only one column
    $("#POIs").removeClass("twoTextColumns");
    // Current conditions toast
    M.toast({
      classes: "alertToast",
      html:
        "<a href='https://www.nps.gov/nama/planyourvisit/conditions.htm' target='_blank'><i class='tiny material-icons'>notifications</i>&nbsp;Click here for current Alerts & Conditions </a>"
    });
  }

  // EventListener on the `landmarks list` button
  $("#poiBtn").on("click", function(e) {
    // Changes the button text onclick AND toggle the list display
    if ($("#poiBtn").text() != "HIDE LIST") {
      $("#poiBtn").html("HIDE LIST");
      $("#onBtnClick").show();
    } else {
      $("#poiBtn").text("Show landmarks list");
      $("#onBtnClick").hide();
    }
  });
});
// ---------------------------------------------------
// END OF document ready
