 var baseLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
	attribution: 'Pedro Garcia-Valenciano León,<a href="http://www.openstreetmap.org/">OpenStreetMap</a>',
	maxZoom: 18
	}
);
var cfg = {
	"radius": 0.012,
	"maxOpacity": .6, 
	"scaleRadius": true, // autoescala zoom map
	"useLocalExtrema": true,
		latField: 'lat',//default "lat"
		lngField: 'lng',//default "lng"
		valueField: 'count'//default "value"
};
var heatmapLayer = new HeatmapOverlay(cfg);

var map = new L.Map('map-canvas', {
		center: new L.LatLng(40.425000,-3.6675367),
		zoom: 11,
		layers: [baseLayer, heatmapLayer]
});


