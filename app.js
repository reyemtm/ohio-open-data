//https://kryogenix.org/code/browser/sorttable/
//https://spreadsheets.google.com/feeds/list/1B5aor-SB82VB38_OZ5rioygC_R0ExuIWWSvZyBAj_j4/od6/public/values?alt=json

var joinKeys = [];

// fetch("https://spreadsheets.google.com/feeds/list/1B5aor-SB82VB38_OZ5rioygC_R0ExuIWWSvZyBAj_j4/od6/public/values?alt=json")
// .then(res=>{
//   return res.json()
// })
// .then(data=> {
//   console.log(data.feed.entry)
// })
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

  
  Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vTei5xbMLVaBD0PgMjv1CGryrtIIuPEDaAq9lu_jhG7VB38f-1zsWOzASqdyL3fuwGyDexaPd6950qB/pub?output=csv", {
    download: true,
    header: true,
    complete: function(results) {
      console.log(results.data);
      renderTable("table", results.data);
      results.data.map(function(key) {
        joinKeys[key.KEY] = key
      });
      console.log(joinKeys)
      // map.setPaintProperty("counties", "circle-color", ["case", ["get", "GEOID"], ])
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
  
  // fetch("https://reyemtm.github.io/ohio-open-data/table.json")
  // .then(res => {
  //   return res.json()
  // })
  // .then(json => {
  //   renderTable("table", json)
  // });

});

map.on("click", mapQuery)

function mapQuery(e) {
  var point = e;
  var features = getFeatures(point);
  console.log(features)
  if (features.length) {
    var props = joinKeys[features[0].properties.GEOID];
    console.log(props)
    var url = "#";
    if ((features[0].properties.NAME).includes("County")) {
      url = "https://duckduckgo.com/?q=" + features[0].properties.NAME + "ohio+auditor"
    }
    var popup = new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(`<h3>${features[0].properties.NAME}</h3><a href='${url}' target='_blank'>Auditor</a>`)
    .addTo(map);
  }
}

function getFeatures(e) {
  var features = map.queryRenderedFeatures(e.point)
  return features
}

function renderTable(id, object) {
  var div = document.getElementById(id);
  var table = document.createElement("table");
  table.classList.add("sortable")
  var headings = ["NAME", "GISLINK", "AUDITORLINK"];

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
  var newTable = document.querySelector(".sortable");
  console.log(newTable)
  sorttable.makeSortable(newTable);
}

function mapFilter(map, filter) {

}
