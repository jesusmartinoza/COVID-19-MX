var options = {
      series: [
        {
          name: "Marine Sprite",
          data: [44, 55, 41, 37, 22, 43, 21]
        },
        {
          name: "Striking Calf",
          data: [53, 32, 33, 52, 13, 43, 32]
        },
        {
          name: "Tank Picture",
          data: [12, 17, 11, 9, 15, 11, 20]
        },
        {
          name: "Bucket Slope",
          data: [9, 7, 5, 8, 6, 9, 4]
        },
        {
          name: "Reborn Kid",
          data: [25, 12, 19, 32, 25, 24, 10]
        }
      ],
      chart: {
        type: "bar",
        height: 350,
        stacked: true
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
      title: {
        text: "Fiction Books Sales"
      },
      xaxis: {
        categories: [2008, 2009, 2010, 2011, 2012, 2013, 2014],
        labels: {
          formatter: function(val) {
            return val + "K";
          }
        }
      },
      yaxis: {
        title: {
          text: undefined
        }
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return val + "K";
          }
        }
      },
      fill: {
        opacity: 1
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
        offsetX: 40
      }
    };

var chart = new ApexCharts(document.querySelector('#chart'), options);
chart.render();
// 
// var donutOptions = {
//       series: [44, 55, 13],
//       chart: {
//         type: "donut"
//       },
//       labels: ["Confirmados", "Sospechosos", "Recuperados"],
//       responsive: [
//         {
//           breakpoint: 480,
//           options: {
//             chart: {
//               width: 200
//             },
//             legend: {
//               position: "bottom"
//             }
//           }
//         }
//       ]
//     };
//
// var chart2 = new ApexCharts(document.querySelector('#chart2'), donutOptions);
// chart2.render();
// var chart3 = new ApexCharts(document.querySelector('#chart3'), donutOptions);
// chart3.render();

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
