var map;
var casesByState = {};
var casesByAge ={};

// Remove extra params
var url = window.location.href;
var to = url.lastIndexOf('/');
to = to == -1 ? url.length : to + 1;
url = url.substring(0, to);

/**
 * Get data from backend
 */
fetch(url + 'api')
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

    // Fill casesByAge object
    casesByAge.confirmed = json.confirmed_by_age;
    casesByAge.healed = json.healed_by_age
    casesByAge.suspected = json.suspected_by_age

    // Load charts and map
    loadStatesChart();
    loadAgesChart();
    drawClusters();
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
      width: '100%',
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
      colors: ["#00313B"]
    },
    xaxis: {
      categories: Object.keys(casesByState)
    },
    legend: {
      position: "bottom",
      horizontalAlign: "left",
      offsetX: 40
    },
    responsive: [{
      breakpoint: 540,
      options: {
        chart: {
          height: 700
        }
      }
    }],
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

/**
 * Draw countries and boundaries using GeoJSON
 */
function addGeoJsonLayer(file, color, selectable = false) {
  var geojsonSource = new ol.source.Vector({
    url: file,
    format: new ol.format.GeoJSON()
  });

  var geojsonLayer = new ol.layer.Vector({
    title: 'Boundaries',
    source: geojsonSource,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#00232A',
        width: 1.2
      }),
      fill: new ol.style.Fill({
        color: color
      })
    })
  });

  geojsonLayer.set('selectable', selectable);
  map.addLayer(geojsonLayer);
}

/**
 * Load OpenLayers map instance
 */
function loadMap() {
  map = new ol.Map({
    target: 'map',
    view: new ol.View({
      center: ol.proj.fromLonLat([-102.341600, 23.568975]),
      enableRotation: false,
      minZoom: 3.5,
      zoom: 4.8,
    })
  });

  // Add boundaries layer
  addGeoJsonLayer('/static/tracker/america.geojson', '#26444A');
  addGeoJsonLayer('/static/tracker/mexstates.geojson', '#366E8C');

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
* Draw a circle in each zone proportional to number of people infected
**/
function drawClusters() {
  var features = [];

  for(var state of Object.values(casesByState)) {
    for(var i = 0; i < state.confirmed; i++) {
      var point = new ol.proj.fromLonLat([state.longitude, state.latitude]);
      features.push(new ol.Feature(new ol.geom.Point(point)));
    }
  }

  var source = new ol.source.Vector({
    features: features
  });

  var clusterSource = new ol.source.Cluster({
    distance: 20,
    source: source
  });

  var styleCache = {};
  var clusters = new ol.layer.Vector({
    source: clusterSource,
    style: function(feature) {
      var size = feature.get('features').length;
      var style = styleCache[size];
      if (!style) {
        style = new ol.style.Style({
          image: new ol.style.Circle({
            radius: Math.min(8 + size, 30),
            fill: new ol.style.Fill({
              color: '#FF4560AA'
            })
          }),
          text: new ol.style.Text({
            text: size.toString(),
            scale: 1.3,
            fill: new ol.style.Fill({
              color: '#fff'
            })
          })
        });
        styleCache[size] = style;
      }
      return style;
    }
  });

  map.addLayer(clusters);
}

function loadAgesChart() {
  console.log(casesByAge);

  var options = {
    theme: {
      mode: 'dark',
      palette: 'palette1'
    },
    colors: ['#FF4560', '#FFCD01', '#00E396'],
    series: [
      {
        name: 'Confirmados',
        data: Object.values(casesByAge.confirmed)
      },
      {
        name: 'Sospechosos',
        data: Object.values(casesByAge.suspected)
      },
      {
        name: 'Recuperados',
        data: Object.values(casesByAge.healed)
      }
    ],
    chart: {
      background: '#00232A',
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: Object.keys(casesByAge.confirmed),
      title: {
        text: 'Rango de edad (años)'
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'left',
      offsetX: 40
    },
    fill: {
      opacity: 1
    }
  };

  var chart = new ApexCharts(document.querySelector('#by-age-chart'), options);
  chart.render();
}

loadMap();