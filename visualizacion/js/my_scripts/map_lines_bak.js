(function () {
$("#estado_peticion").html('<img src="images/loading.gif" alt="Smiley face" height="42" width="42">');
function getEstaciones(){
                var estaciones = null;
	            $.ajax({
	          		  type: "POST",
                      async: false,
                      cache: false,
	          		  datatype: 'json',
	          		  data:'collection=estaciones',
	          	      url: "getCollection.php",
	          	      success: function(data) {
	          	    	  estaciones=data;
	          	      }
	          	}).done(function() {
	          			$("#estado_peticion").html("<font style='color:green;font-weight:500px'>[OK]</font>");
	          	})
	          	.fail(function() {
	          		$("#estado_peticion").html("<font style='color:red;font-weight:500px'>[ERROR ESTACIONES]</font>");
	          	})
	          	.always(function() {
	          	   // alert( "complete" );
	          	});
               return estaciones;
}
function getConexiones(){
    var conexiones = null;
    $.ajax({
  		  type: "POST",
          async: false,
          cache: false,
  		  datatype: 'json',
  		  data:'collection=conexiones',
  	      url: "getCollection.php",
  	      success: function(data) {
  	    	  conexiones=data;
  	      }
  	}).done(function() {
  			$("#estado_peticion").html("<font style='color:green;font-weight:500px'>[OK]</font>");
  	})
  	.fail(function() {
  		$("#estado_peticion").html("<font style='color:red;font-weight:500px'>[ERROR ESTACIONES]</font>");
  	})
  	.always(function() {
  	   // alert( "complete" );
  	});
   return conexiones;
}

if(typeof GLOBAL_estaciones==='undefined' || typeof GLOBAL_conexiones=== 'undefined' ){
	console.log("Cargando estaciones y conexiones...");
	var GLOBAL_estaciones=getEstaciones();//console.log(GLOBAL_estaciones);
	var GLOBAL_conexiones=getConexiones();//console.log(GLOBAL_conexiones);
}

var extent, scale,classes = 9, scheme_id = "YlOrRd",reverse = false;
var scheme = colorbrewer[scheme_id][classes],container = L.DomUtil.get('map');
var map = L.map(container).setView([40.425000,-3.6675367], 11);
 L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
        attribution: 'Pedro Garcia-Valenciano León,<a href="http://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 17
}).addTo(map);
 
//var TODAS=new L.layerGroup([]);
var linea1=new L.layerGroup([]);
var linea2=new L.layerGroup([]);
var linea3=new L.layerGroup([]);
var linea4=new L.layerGroup([]);
var linea5=new L.layerGroup([]);
var linea6=new L.layerGroup([]);
var linea7=new L.layerGroup([]);
var linea8=new L.layerGroup([]);
var linea9=new L.layerGroup([]);
var linea10=new L.layerGroup([]);
var linea11=new L.layerGroup([]);
var linea12=new L.layerGroup([]);
//                                                     ESTACIONES:
for (var key in GLOBAL_estaciones) {
    var label=GLOBAL_estaciones[key].id+" - "+GLOBAL_estaciones[key].estacion;
	var linea=GLOBAL_estaciones[key].linea;
	var x=GLOBAL_estaciones[key].coord_x;
	var y=GLOBAL_estaciones[key].coord_y;
    var circle = L.circle([x,y],2, { 
        color: 'blue',
        fillColor: '#00f',
        fillOpacity: 0.9
	}); //.addTo(map);
    if(linea==1)linea1.addLayer(circle);
    else if(linea==2)linea2.addLayer(circle);
    else if(linea==3)linea3.addLayer(circle);
    else if(linea==4)linea4.addLayer(circle);
    else if(linea==5)linea5.addLayer(circle);
    else if(linea==6)linea6.addLayer(circle);
    else if(linea==7)linea7.addLayer(circle);
    else if(linea==8)linea8.addLayer(circle);
    else if(linea==9)linea9.addLayer(circle);
    else if(linea==10)linea10.addLayer(circle);
    else if(linea==11)linea11.addLayer(circle);
    else if(linea==12)linea12.addLayer(circle);
    //TODAS.addLayer(circle);
    circle.bindPopup(label);
}
function dibuja_linea(x1,y1,x2,y2, color, linea){
    var pointA = new L.LatLng(x1, y1);
    var pointB = new L.LatLng(x2, y2);
    var pointList = [pointA, pointB];

    var polyline = new L.Polyline(pointList, {
        color: color,
        weight: 2,
        opacity: 1,
        smoothFactor: 1
    });
    polyline.bindPopup("<div style='width:100px;height:50px;'>LINEA "+linea+"</div>");

    if(linea==1)linea1.addLayer(polyline);
    else if(linea==2)linea2.addLayer(polyline);
    else if(linea==3)linea3.addLayer(polyline);
    else if(linea==4)linea4.addLayer(polyline);
    else if(linea==5)linea5.addLayer(polyline);
    else if(linea==6)linea6.addLayer(polyline);
    else if(linea==7)linea7.addLayer(polyline);
    else if(linea==8)linea8.addLayer(polyline);
    else if(linea==9)linea9.addLayer(polyline);
    else if(linea==10)linea10.addLayer(polyline);
    else if(linea==11)linea11.addLayer(polyline);
    else if(linea==12)linea12.addLayer(polyline);
    //TODAS.addLayer(polyline);
}
//                                            CONEXIONES:
for (var k1 in GLOBAL_conexiones) {
	var cox1=0;
	var coy1=0;
	var cox2=0;
	var coy2=0;
	var color;
	var linea=0;
		        
	for (var key in GLOBAL_estaciones) {
		   if(GLOBAL_conexiones[k1].FIELD1==GLOBAL_estaciones[key].id){
		      console.log("Conexión a la estación "+GLOBAL_estaciones[key].estacion);
		      linea=GLOBAL_estaciones[key].linea;
		      if(GLOBAL_estaciones[key].linea==9)color='#A901DB';
		      else if(GLOBAL_estaciones[key].linea==7)color='orange';
		      else if(GLOBAL_estaciones[key].linea==2)color='red';
		      else if(GLOBAL_estaciones[key].linea==10)color='blue';
		      else if(GLOBAL_estaciones[key].linea==6)color='yellow';
		      else if(GLOBAL_estaciones[key].linea==12)color='green';
		      else if(GLOBAL_estaciones[key].linea==5)color='#00FF40';
		      else if(GLOBAL_estaciones[key].linea==8)color='brown';
		      else if(GLOBAL_estaciones[key].linea==11)color='orangered';
		      else if(GLOBAL_estaciones[key].linea==3)color='pink';
		      else if(GLOBAL_estaciones[key].linea==4)color='#7ff';
		      else if(GLOBAL_estaciones[key].linea==1)color='#f0f';
		      else color='blue';
		      cox1=GLOBAL_estaciones[key].coord_x;
		      coy1=GLOBAL_estaciones[key].coord_y;
		  }
		if(GLOBAL_conexiones[k1].FIELD2==GLOBAL_estaciones[key].id){
			  cox2=GLOBAL_estaciones[key].coord_x;
			  coy2=GLOBAL_estaciones[key].coord_y;
		 }
	}
	if(cox1!=0 && cox2!=0 && coy1!=0 && coy2!=0){
		dibuja_linea(cox1,coy1,cox2,coy2,color,linea);
	}
}
linea1.addTo(map);
linea2.addTo(map);
linea3.addTo(map);
linea4.addTo(map);
linea5.addTo(map);
linea6.addTo(map);
linea7.addTo(map);
linea8.addTo(map);
linea9.addTo(map);
linea10.addTo(map);
linea11.addTo(map);
linea12.addTo(map);
//TODAS.addTo(map);
/*
TODAS.eachLayer(function (layer) {
    map.removeLayer(layer);
});*/
var overlayMaps = {
    "<font style='color:#f0f;' onclick=\"javascript:grafico_linea(1);\">Linea1</font>": linea1,
    "<font style='color:red;' onclick=\"javascript:grafico_linea(2);\">Linea2</font>": linea2,
    "<font style='color:pink;' onclick=\"javascript:grafico_linea(3);\">Linea3</font>": linea3,
    "<font style='color:#7ff;' onclick=\"javascript:grafico_linea(4);\">Linea4</font>": linea4,
    "<font style='color:#00FF40;' onclick=\"javascript:grafico_linea(5);\">Linea5</font>": linea5,
    "<font style='color:yellow;' onclick=\"javascript:grafico_linea(6);\">Linea6</font>": linea6,
    "<font style='color:orange;' onclick=\"javascript:grafico_linea(7);\">Linea7</font>": linea7,
    "<font style='color:brown;' onclick=\"javascript:grafico_linea(8);\">Linea8</font>": linea8,
    "<font style='color:#A901DB;' onclick=\"javascript:grafico_linea(9);\">Linea9</font>": linea9,
    "<font style='color:blue;' onclick=\"javascript:grafico_linea(10);\">Linea10</font>": linea10,
    "<font style='color:orangered;' onclick=\"javascript:grafico_linea(11);\">Linea11</font>": linea11,
    "<font style='color:green;' onclick=\"javascript:grafico_linea(12);\">Linea12</font>": linea12
};
/*var overAll ={
    "<b style='color:black;'>TODAS</b>": TODAS
};*/
L.control.layers(overlayMaps).addTo(map);//, overAll).addTo(map);

})(d3);
