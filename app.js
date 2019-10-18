//https://kryogenix.org/code/browser/sorttable/
var logger = document.getElementById("console")

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

  map.addLayer({
    'id': 'countiesFill',
    'type': 'fill',
    'source': 'counties',
    'layout': {
      'visibility': 'visible'
    },
    'paint': {
      'fill-color': 'transparent',
      'fill-outline-color': 'white',
      'fill-opacity': 0.9
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

  fetch("https://reyemtm.github.io/ohio-open-data/ohio.geojson")
  .then(res => {
    return res.json()
  })
  .then(json => {
    map.getSource("counties").setData(json);
    renderTable("table", json.features)
  })

});

map.on("click", mapQuery)

function mapQuery() {
  console.log(map.queryRenderedFeatures(this.point))
}

function renderTable(id, object) {
  var div = document.getElementById(id);
  var table = document.createElement("table");
  table.classList.add("sortable")
  var headings = [];

  object.map(feature => {
    for (var p in feature.properties) {
      if (headings.indexOf(p) < 0) headings.push(p)
    }
  });
  console.log(headings);
  logger.innerHTML += headings;
  var string = "<thead>";
  for (var h in headings) {
    string += "<th>" + headings[h] + "</th>"
  }
  string += "</thead><tbody>";
  object.map(feature => {
    string += "<tr>"
    for (var p in feature.properties) {
      string += `<td>${feature.properties[p]}</td>`
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
