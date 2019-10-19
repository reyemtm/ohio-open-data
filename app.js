/****
 * FETCH GOOGLE SHEET DATA AS CSV AND PARSE WITH PAPAPARSE
 ****/

var joinKeys = [];

Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vTei5xbMLVaBD0PgMjv1CGryrtIIuPEDaAq9lu_jhG7VB38f-1zsWOzASqdyL3fuwGyDexaPd6950qB/pub?output=csv", {
  download: true,
  header: true,
  complete: function (results) {
    renderTable("table", results.data);
    results.data.map(function (key) {
      joinKeys[key.key] = key
    });
    initMap()
  }
});

function initMap() {

  var map = new mapboxgl.Map({
    container: 'map',
    hash: true,
    /*style: 'some mapbox style url*/
    /*below is a blank style*/
    style: {
      "version": 8,
      "name": "blank",
      "sources": {
        "openmaptiles": {
          "type": "vector",
          "url": ""
        }
      },
      "layers": [{
        "id": "background",
        "type": "background",
        "paint": {
          "background-color": "white"
        }
      }]
    },
    center: [-82.487, 40.232],
    zoom: 7.1,
    debug: 1
  });
  map.addControl(new mapboxgl.FullscreenControl());

  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  }));

  map.on('style.load', function () {

    map.addSource('counties', {
      'type': 'geojson',
      'data': {
        type: "FeatureCollection",
        features: []
      },
      'attribution': '<a href="https://www.getbounds.com" style="color:var(--color-primary)">getBounds | Malcolm Meyer</a>'
    });

    map.addSource('places', {
      'type': 'geojson',
      'data': {
        type: "FeatureCollection",
        features: []
      }
    });

    map.addLayer({
      'id': 'countiesFill',
      'type': 'fill',
      'source': 'counties',
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'fill-color': ['case', 
          ["!=", ["length", ['get', 'auditor_map_link']], 0], '#B2EBF2', 
          'whitesmoke'],
        'fill-outline-color': '#121212'
      }
    });

    map.addLayer({
      'id': 'countiesLine',
      'type': 'line',
      'source': 'counties',
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'line-color': "#212121",
        'line-width': 3
      }
    });
    map.addLayer({
      'id': 'placesFill',
      'type': 'fill',
      'source': 'places',
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'fill-color': ['case', 
        ["!=", ["length", ['get', 'auditor_map_link']], 0], '#FFEB3B', 
        'lightgray'],
        'fill-outline-color': '#212121',
        'fill-opacity': 0.9
      }
    });

    map.addLayer({
      'id': 'placesLine',
      'type': 'line',
      'source': 'places',
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'line-color': "#121212",
        'line-width': 1
      }
    });


    fetch("https://reyemtm.github.io/ohio-open-data/ohio.geojson")
      .then(res => {
        return res.json()
      })
      .then(json => {
        var jsonJoined = joinData(json, joinKeys)
        map.getSource("counties").setData(jsonJoined)
      });

    fetch("https://reyemtm.github.io/ohio-open-data/places.geojson")
      .then(res => {
        return res.json()
      })
      .then(json => {
        var jsonJoined = joinData(json, joinKeys)
        map.getSource("places").setData(jsonJoined)
      });

  });

  map.on("click", mapQuery)

  function mapQuery(e) {
    var point = e;
    var features = getFeatures(point);
    console.log(features)
    if (features.length) {
      // var props = joinKeys[features[0].properties.GEOID]
      var props = features[0].properties;
      var html = getPopupHtml(props);
      var url = "#";
      if ((features[0].properties.name).includes("County")) {
        url = "https://duckduckgo.com/?q=" + features[0].properties.name + "ohio+auditor"
      }
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<h3>${features[0].properties.name}</h3><a href='${url}' target='_blank'>Search for Auditor Site</a><br>${html}`)
        .addTo(map);
    }
  }

  function getFeatures(e) {
    var features = map.queryRenderedFeatures(e.point)
    return features
  }
}


function renderTable(id, object) {
  var div = document.getElementById(id);
  var table = document.createElement("table");
  table.classList.add("table")
  var headings = ["name", "gis_link", "auditor_map_link"];

  var string = "<thead>";
  for (var h in headings) {
    string += "<th>" + headings[h] + "</th>"
  }
  string += "</thead><tbody>";
  object.map(feature => {
    string += "<tr>"
    for (var p in feature) {
      if (headings.indexOf(p) > -1) {
        var item = (feature[p].includes("http")) ? `<a href='${feature[p]}'>${feature[p]}</>'` : feature[p]
        string += `<td>${item}</td>`
      }
    }
    string += "</tr>"
  })
  string += "</tbody>"

  table.innerHTML += string;
  div.appendChild(table);
  var newTable = document.querySelector(".table");
  console.log(newTable)
  // sorttable.makeSortable(newTable);
  var dataTable = new DataTable(newTable, {
    perPage: 15
  });

}

function mapFilter(map, filter) {

}

function getPopupHtml(properties) {
  var html = "";
  for (var p in properties) {
    var key = p.replace(/_/g, " ");
    // key = key.toLocaleUpperCase()
    var value = properties[p];
    if (properties[p].includes("http")) value = `<a href='${properties[p]}' target='_blank'>Link</a>`;
    console.log(properties[p])
    if (properties[p]) html += `<strong>${key}</strong>: ${value}<br>`
  }
  return html
}

function joinData(geojson, data) {
  geojson.features.map(f => {
    var key = (!f.properties.GEOID) ? 0 : f.properties.GEOID;
    if (key && data[key]) {
      f.properties = data[key]
    }
  })
  return geojson
}