//https://kryogenix.org/code/browser/sorttable/
//https://spreadsheets.google.com/feeds/list/1B5aor-SB82VB38_OZ5rioygC_R0ExuIWWSvZyBAj_j4/od6/public/values?alt=json
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
        "background-color": "whitesmoke"
      }
    }]
  },
  center: [-82.487, 40.232],
  zoom: 6.88,
  debug: 1
});
// map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl());

map.on('style.load', function() {
  
  map.addSource('counties', {
    'type': 'geojson',
    'data': {
      type: "FeatureCollection",
      features: []
    }
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
      'fill-color': 'white',
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
      'line-color': "#121212",
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
      'fill-color': 'whitesmoke',
      'fill-outline-color': 'white',
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
    map.getSource("counties").setData(json);
  });
  
  fetch("https://reyemtm.github.io/ohio-open-data/places.geojson")
  .then(res => {
    return res.json()
  })
  .then(json => {
    map.getSource("places").setData(json);
  });
  
  fetch("https://reyemtm.github.io/ohio-open-data/table.json")
  .then(res => {
    return res.json()
  })
  .then(json => {
    console.log(json);
    renderTable("table", json)
  });

});

map.on("click", mapQuery)

function mapQuery() {
  var features = getFeatures(this);
  console.log(features)
  if (features.length) {
    var popup = new mapboxgl.Popup()
    .setLngLat(this.point.lngLat)
    .setHTML(`<h1>${features[0].properties.NAME}</h1>`)
    .addTo(map);
  }
}

function getFeatures() {
  var features = map.queryRenderedFeatures(this.point)
  return features
}

function renderTable(id, object) {
  var div = document.getElementById(id);
  var table = document.createElement("table");
  table.classList.add("sortable")
  var headings = ["NAME", "GISLINK"];

  // object.map(feature => {
  //   for (var p in feature) {
  //     if (headings.indexOf(p) < 0) headings.push(p)
  //   }
  // });
  // console.log(headings);
  var string = "<thead>";
  for (var h in headings) {
    string += "<th>" + headings[h] + "</th>"
  }
  string += "</thead><tbody>";
  object.map(feature => {
    string += "<tr>"
    for (var p in feature) {
      if (headings.indexOf(p) > -1) {
        string += `<td>${feature[p]}</td>`
      }
    }
    string += "</tr>"
  })
  string += "</tbody>"

  table.innerHTML += string;
  div.appendChild(table);
  var newTable = document.querySelector(".sortable");
  console.log(newTable)
  sorttable.makeSortable(newTable);
}

function mapFilter(map, filter) {

}
