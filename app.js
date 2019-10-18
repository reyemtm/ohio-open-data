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
  center: [-95.52, 39.94],
  zoom: 4,
  debug: 1
});
map.addControl(new mapboxgl.NavigationControl());
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

  fetch("./ohio.geojson")
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
  
  var headings = [];

  object.map(feature => {
    for (var p in feature.properties) {
      if (p.indexOf(headings) < 0) headings.push(p)
    }
  })
  table.innerHTML += '<tr>'
  for (var h in headings) {
    console.log(h)
    table.innerHTML += `<th>${h}</th>`
  }
  table.innerHTML += '</tr>'
  div.appendChild(table)
}

function mapFilter(map, filter) {

}