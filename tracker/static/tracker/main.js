var map;

function addGeoJsonLayer(file, color) {
  var geojsonSource = new ol.source.Vector({
    url: file,
    format: new ol.format.GeoJSON()
  });

  var geojsonLayer = new ol.layer.Vector({
    title: 'Boundaries',
    source: geojsonSource,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'black',
        width: 1
      }),
      fill: new ol.style.Fill({
        color: color
      })
    })
  });

  map.addLayer(geojsonLayer);
}

function loadMap() {
  map = new ol.Map({
    target: 'map',
    view: new ol.View({
      center: ol.proj.fromLonLat([-102.341600, 23.568975]),
      enableRotation: false,
      minZoom: 3.5,
      zoom: 4.8,
    }),
    interactions: ol.interaction.defaults({
        dragAndDrop: false,
        keyboardPan: false,
        keyboardZoom: false,
        mouseWheelZoom: false,
        select: false
    }),
  });

  // Add boundaries layer
  addGeoJsonLayer('/static/tracker/america.geojson', '#26444A');
  addGeoJsonLayer('/static/tracker/mexstates.geojson', '#B20A4D');

  var selectPointerMove = new ol.interaction.Select({
    condition: ol.events.condition.pointerMove
  });
  //map.addInteraction(selectPointerMove);
}

document.getElementById('center-button').onclick = function() {
  map.getView().animate({
    center: ol.proj.fromLonLat([-102.341600, 23.568975]),
    duration: 1500
  });
}

loadMap();