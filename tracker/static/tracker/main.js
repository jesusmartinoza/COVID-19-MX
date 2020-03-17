var map;
var casesByState = {}

/**
 * Get data from backend
 */
fetch(window.location.href + 'api')
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    loadDonutChart([json.total_confirmed, json.total_suspected, json.total_healed]);

    /*
    * Process data in client side to avoid the server
    * to explode with a lot of queries running
    */
    for(var c of json.cases) {
      if(!(c.state_name in casesByState)) { // New object
        casesByState[c.state_name] = {
          'confirmed': 0,
          'suspected': 0,
          'healed': 0,
          'latitude': c.state_latitude,
          'longitude': c.state_longitude
        };
      }

      switch(c.status) {
        case 'confirmed': casesByState[c.state_name].confirmed++; break;
        case 'suspected': casesByState[c.state_name].suspected++; break;
        case 'healed': casesByState[c.state_name].healed++; break;
      }
    }

    // Load charts and map
    loadStatesChart();
    drawDataOnMap();
  });

/**
 * Chart - CASOS POR ESTADO
 */
function loadStatesChart() {
  var options = {
    theme: {
      mode: 'dark',
      palette: 'palette1'
    },
    colors: ['#FF4560', '#FFCD01'],
    series: [
      {
        name: "Confirmados",
        data: Object.values(casesByState).map(d => d.confirmed)
      },
      {
        name: "Sospechosos",
        data: Object.values(casesByState).map(d => d.suspected)
      },
    ],
    chart: {
      type: "bar",
      background: '#00232A',
      stacked: true,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true
      }
    },
    stroke: {
      width: 1,
      colors: ["#fff"]
    },
    xaxis: {
      categories: Object.keys(casesByState)
    },
    fill: {
      opacity: 1
    },
    legend: {
      position: "bottom",
      horizontalAlign: "left",
      offsetX: 40
    }
  };

  var chart = new ApexCharts(document.querySelector('#chart'), options);
  chart.render();
}

/**
 * Chart - TOTAL DEL PAIS
 */
function loadDonutChart(data) {
  var donutOptions = {
    series: data,
    theme: {
      mode: 'dark'
    },
    chart: {
      type: "donut",
      background: '#00232A',
      width: '100%',
    },
    colors: ['#FF4560', '#FFCD01', '#00E396'],
    labels: ["Confirmados", "Sospechosos", "Recuperados"],
    legend: {
      fontSize: '16px',
      position: 'bottom',
      horizontalAlign: 'center',
      floating: false,
    },
    responsive: [
      {
        breakpoint: 400,
        options: {
          legend: {
            show: false
          }
        }
      }
    ]
  };

  var chart2 = new ApexCharts(document.querySelector('#donut-chart'), donutOptions);
  chart2.render();
}

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
      //enableRotation: false,
      minZoom: 3.5,
      zoom: 4.8,
    }),
    interactions: ol.interaction.defaults({
        // dragAndDrop: false,
        // keyboardPan: false,
        // keyboardZoom: false,
        // mouseWheelZoom: false,
        // select: false,
        // onFocusOnly: true
    }),
  });

  // Add boundaries layer
  addGeoJsonLayer('/static/tracker/america.geojson', '#26444A');
  addGeoJsonLayer('/static/tracker/mexstates.geojson', '#366E8C');

  var selectPointerMove = new ol.interaction.Select({
    condition: ol.events.condition.pointerMove
  });

  // Button listener to center map
  document.getElementById('center-button').onclick = function() {
    map.getView().animate({
      center: ol.proj.fromLonLat([-102.341600, 23.568975]),
      duration: 1500,
      zoom: 4.8
    });
  }
}

/**
* Draw a circle in each state proportional to number of people infected
**/
function drawDataOnMap() {
  for(var state of Object.values(casesByState)) {
    var centerLongitudeLatitude = ol.proj.fromLonLat([state.longitude, state.latitude]);
    var radiusConfirmed = (5000 * state.confirmed) % 140000;
    var radiusSuspected = (5000 * state.suspected) % 140000;

    var layer1 = new ol.layer.Vector({
      source: new ol.source.Vector({
        projection: 'EPSG:4326',
        features: [new ol.Feature(new ol.geom.Circle(centerLongitudeLatitude, radiusSuspected))]
      }),
      style: [
        new ol.style.Style({
          fill: new ol.style.Fill({
            color: '#E06356BB'
          })
        })
      ]
    });

    var layer2 = new ol.layer.Vector({
      source: new ol.source.Vector({
        projection: 'EPSG:4326',
        features: [new ol.Feature(new ol.geom.Circle(centerLongitudeLatitude, radiusConfirmed))]
      }),
      style: [
        new ol.style.Style({
          fill: new ol.style.Fill({
            color: '#FF4560AA'
          })
        })
      ]
    });

    map.addLayer(layer1);
    map.addLayer(layer2);
  }
}

loadMap();