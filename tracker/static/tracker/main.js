var map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM({
        "url" : "http://{a-c}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png"
      })
    })
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-102.341600, 23.568975]),
    zoom: 4.8
  })
});

// Add a boundaries layer
var geojsonSource = new ol.source.Vector({
  url: '/static/tracker/mexstates.geojson',
  format: new ol.format.GeoJSON()
});

var a = Math.floor(Math.random() * 255);

var geojsonLayer = new ol.layer.Vector({
  title: 'Boundaries',
  source: geojsonSource,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'black',
      width: 1
    }),
    fill: new ol.style.Fill({
      color: "#FF005CAA"
    })
  })
});

map.addLayer(geojsonLayer);

var selectPointerMove = new ol.interaction.Select({
  condition: ol.events.condition.pointerMove
});
map.addInteraction(selectPointerMove);