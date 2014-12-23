
//   DATOS QUE NECESITO:
//
//             {linea}{estación}{anyo}{mes}{dia}{hora}{suma} 
//
//             NOTA: Sabiendo que el vagón tiene capacidad para 130 personas y la estación con máximo número de 
//             pasajeros para una determinada hora calcularé los vagones necesarios para esa hora en toda la linea.
//
//
//   LOS DATOS SE CALCULARÁN PARA MOSTRARSE EN LOS GRÁFICOS:
//
//                               1-Gráfico1: ARRAY: porcentaje por hora
//                               2-Gráfico2: FICH TSV: month<tab>average
//                               3-Gráfico3: ARRAY1: Porcentajes por horas:
//                                                	{category: "6h", measure: 0.30},
//                                               	{category: "7h", measure: 0.25},
//                                           ARRAY2: Suma por horas:
//                                                { group: "6h", category: "Entre semana", measure: 63850.4963 }, 
//                                                { group: "6h", category: "Fin de semana", measure: 78258.0845 }, 
//                                           ARRAY3: Suma por horas: Suma por horas y día.
//                                                { group: "6h", category: Lunes, measure: 81006.52 }, 
//                                                { group: "6h", category: Martes, measure: 70499.4 }, 
//                                                { group: "6h", category: Miercoles, measure: 96379 }, 
//                                                { group: "6h", category: Jueves, measure: 64931 }, 

	/**** VARIABLES GLOBALES ******/
	var GLOBAL_datos_viajeros;
	
	var GLOBAL_volumenes_hora=new Array(168);//24h*7dias
	for(var i=0;i<168;i++){GLOBAL_volumenes_hora[i]=0;}
	//GLOBAL_volumenes_hora[0]=1;//lunes a las 00:00
	//GLOBAL_volumenes_hora[11]=2;//lunes a las 11:00
	//GLOBAL_volumenes_hora[24]=3;//Martes a las 00:00
	var GLOBAL_matriz_meses_horas=new Array(12);
	for (var i = 0; i < 12; i++) {
		GLOBAL_matriz_meses_horas[i] =new Array(168);
		for(var j=0;j<168;j++){GLOBAL_matriz_meses_horas[i][j]=0;}
    }
	
	var GLOBAL_volumenes_mes_entresemana = [0,0,0,0,0,0,0,0,0,0,0,0];//VALOR POR MESES
	var GLOBAL_volumenes_mes_findesemana = [0,0,0,0,0,0,0,0,0,0,0,0];//VALOR POR MESES
	var GLOBAL_volumenes_mes_todoslosdias = [0,0,0,0,0,0,0,0,0,0,0,0];//VALOR POR MESES
	var GLOBAL_meses= ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
	var GLOBAL_etiqueta_mes="";
	var GLOBAL_etiqueta_anyo="2013"
	/******************************/

var linea=$("#linea_seleccionada").val();
var mes_seleccionado=1; //por defecto enero

/* CONSULTA DE EJEMPLO:*/
$("#estado_peticion").html('<img src="images/loading.gif" height="42" width="42">');
var data_ajax = 'lin='+linea;// . '&var2='. ":)" ;

$.ajax({
	type: "GET",
	datatype: 'json',
	async: false,
	data: data_ajax,
      url: "GetDatosViajeros.php", 
      success: function(data) {
    	  GLOBAL_datos_viajeros=data;
    	  /*if(GLOBAL_datos_viajeros.length>0){
    		    errors = { datos_viajeros: "Sin datos de respuesta. JSON." };
    		    Validator.showErrors(errors);
    	  }*/
      }
}).done(function() {
	$("#estado_peticion").append("<font style='color:green;font-weight:500px'> . [OK.CONSULTA_1]</font>");
})
.fail(function() {
	$("#estado_peticion").append("<font style='color:red;font-weight:500px'>[ERROR CONSULTA1 LINEA "+linea+"]</font>");
})
.always(function() {
    //alert( "complete" );
});

console.log("CARGANDO...");
if(GLOBAL_datos_viajeros!=undefined){
	if(Object.keys(GLOBAL_datos_viajeros).length>0){
		$.each(GLOBAL_datos_viajeros, function(key, item){
			var linea=item.linea;
			/* RELLENANDO LAS HORAS */
			var ind=((parseInt(item.dia_sem)-1)*24)+parseInt(item.hora);
			GLOBAL_volumenes_hora[ind]=parseInt(item.suma);
			GLOBAL_matriz_meses_horas[parseInt(item.mes)-1][ind]=parseInt(item.suma);
			/* RELLENANDO VOLUMEN POR MESES */
			if(parseInt(item.dia_sem)<=5){ //entre semana
				GLOBAL_volumenes_mes_entresemana[parseInt(item.mes)-1]=GLOBAL_volumenes_mes_entresemana[parseInt(item.mes)-1]+parseInt(item.suma);
			}else{ //fin de semana
				GLOBAL_volumenes_mes_findesemana[parseInt(item.mes)-1]=GLOBAL_volumenes_mes_findesemana[parseInt(item.mes)-1]+parseInt(item.suma);
			}
			GLOBAL_volumenes_mes_todoslosdias[parseInt(item.mes)-1]=GLOBAL_volumenes_mes_todoslosdias[parseInt(item.mes)-1]+parseInt(item.suma);
		});
	}else{
		alert("ERROR rescatando datos de la linea "+linea+" . Número de datos "+GLOBAL_datos_viajeros.length);
	}
}else{
	alert("DATOS indefinidos");
}
console.log("Cargados los datos de los viajeros.");

$("#estado_peticion").html('<img src="images/loading.gif" height="42" width="42">');
/***********************************************************************************************/
/*                                       1 GRAFICO HORARIO                                     */
/***********************************************************************************************/


console.log("Añado intensidad en horas.");
$("#module-right-content").append("<svg id='horarios_svg'><g id='status'><g class='first'><text class='time'></text><text class='value'></text><text class='units'></text></g><g class='second'><text class='time'></text><text class='value'></text><text class='units'></text></g><g class='third'><text class='time'></text><text class='value'></text><text class='units'></text></g></g></svg>");//<text class='week_step' id='downweek' > << </text><text class='week_step' id='upweek' > >> </text></svg>");
$("#module-right-content").append("<div><svg id='legend'></svg></div>");

var ancho=300;
var alto=300;
var initial_rad = 34+17;
var rad_offset = 8+4;
var label_rad = 35+17;
var pos=ancho/2;//center
var position_x=pos;
var position_y=pos;
var pos_days=pos;//position_label_days
var pos_hours=pos;

d3.select("#horarios_svg").attr("width", ancho+10);
d3.select("#horarios_svg").attr("height", alto+10);
d3.select("#horarios_svg .first .time").attr("x", pos);
d3.select("#horarios_svg .first .time").attr("y", pos-10);
d3.select("#horarios_svg .first .value").attr("x", pos);
d3.select("#horarios_svg .first .value").attr("y", pos+10);
d3.select("#horarios_svg .first .units").attr("x", pos);
d3.select("#horarios_svg .first .units").attr("y", pos+20);

d3.select("#horarios_svg .second .time").attr("x", pos);
d3.select("#horarios_svg .second .time").attr("y", pos);

d3.select("#horarios_svg .week_step").attr("x", 10);
d3.select("#horarios_svg .week_step").attr("y", 20);
d3.select("#horarios_svg #upweek").attr("x", ancho-40);
d3.select("#horarios_svg #upweek").attr("y", 20);


var horario_data=GLOBAL_volumenes_hora;

function getMin(array){return Math.min.apply(Math,array);}
function getMax(array){return Math.max.apply(Math,array);
}

console.log("VALORES EN HORARIO: "+horario_data.length);
var base_ts = 1283731200000;//para parsear a date_string 'semana exacta de inicio'
var week = 0;
var totals = {days:[], week:0};
var display_mode = 0, display_modes = [{label: 'viajeros', prefix: ''}, {label: '', prefix: ''}, {label: '', prefix: ''}];
var week_data;

week_data = horario_data.slice(week*7*24,(week+1)*7*24);
totals = calculate_totals(week_data);

var g = d3.select("svg").append("g").attr("id", "chart");

ir = function(d, i) {return initial_rad+Math.floor(i/24)*rad_offset;}
or = function(d, i) {return initial_rad+rad_offset+Math.floor(i/24)*rad_offset;}
sa = function(d, i) {return (i*2*Math.PI)/24;}
ea = function(d, i) {return ((i+1)*2*Math.PI)/24;}

//Draw the chart
var color = d3.scale.linear().domain([getMin(horario_data), getMax(horario_data)]).range(["white", "blue"]);
d3.select('#chart').selectAll('path').data(week_data)
	.enter().append('svg:path')
	.attr('d', d3.svg.arc().innerRadius(ir).outerRadius(or).startAngle(sa).endAngle(ea))
	.attr('transform', 'translate('+position_x+', '+position_y+')')
  	.attr('fill', color)
	.attr("stroke", "gray")
	.attr("stroke-width", "0.3px")
	.on('mouseover', render_hour_info)
	.on('mouseout', reset_hour_info);

//Labels
var day_labels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

for(var i=0; i<7; i++) {
	label = day_labels[i];
	label_angle = 4.73;
	d3.select("svg").append("def")
	  .append("path")
	  .attr("id", "day_path"+i)
	  .attr("d", "M"+pos_days+" "+pos_days+" m"+label_rad*Math.cos(label_angle)+" "+label_rad*Math.sin(label_angle)+" A"+label_rad+" "+label_rad+" 90 0 1 "+(pos_days+label_rad)+" "+pos_days);
	d3.select("svg").append("text")
	  .attr("class", "day label")
	  .append("textPath")
	  .attr("xlink:href", "#day_path"+i)
	  .text(label);
	label_rad += rad_offset;
}

d3.select("svg").append("def")
	.append("path")
	.attr("id", "time_path")
	.attr("d", "M"+pos_hours+" "+(pos_hours-label_rad)+" a"+label_rad+" "+label_rad+" 0 1 1 -1 0");
for(var i=0; i<24; i++) {
	label_angle = (i-6)*(2*Math.PI/24);
	large_arc = i<6 || i> 18? 0 : 1;
	d3.select("svg").append("text")
		.attr("class", "time label")
		.append("textPath")
		.attr("xlink:href", "#time_path")
		.attr("startOffset", i*100/24+"%")
		.text(convert_to_ampm(i));
}
reset_hour_info();


function CambiaColoresHorariosMes(mes){
	var mes_data;
	console.log("Seleccionamos MES "+mes);
	mes_data = GLOBAL_matriz_meses_horas[mes];
	d3.select('#chart').selectAll('path').data(mes_data).attr('fill', color);
	totals = calculate_totals(mes_data);
	reset_hour_info();
}

/*Define events
d3.selectAll("#status").on('click', function() {
	display_mode = (display_mode+1)%3;
	reset_hour_info();
});

d3.select('#upweek').on('click', function() {
	if(week>=25) return;
	week++;
	week_data = horario_data.slice(week*7*24,(week+1)*7*24);
	d3.select('#chart').selectAll('path').data(week_data).attr('fill', color);
	totals = calculate_totals(week_data);
	reset_hour_info();
})

d3.select('#downweek').on('click', function() {
	if(week<=0) return;
	week--;
	week_data = horario_data.slice(week*7*24,(week+1)*7*24);
	d3.select('#chart').selectAll('path').data(week_data).attr('fill', color);
	totals = calculate_totals(week_data);
	reset_hour_info();
})*/

function render_hour_info(d, i) {
	var days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
	var day = Math.floor(i/24); //day index
	var h = i%24; //hour index
	var viaj = new Number(d);
	//var day_Viaj = new Number(totals.days[day]);
	var dm = display_modes[display_mode];

	//Update times
	d3.select('#status g.first text.time').text(days[day]);
	d3.select('#status g.second text.time').text(convert_to_ampm(h)+' - '+convert_to_ampm(parseInt(h)+1));
	d3.select('#status g.third text.time').text('Projection');

	//Update value
	switch(display_mode) {
	  case 0:
	    d3.select('#status g.first text.value').text(viaj.toFixed(1));
	    d3.select('#status g.second text.value').text(viaj.toFixed(1));
	    //d3.select('#status g.third text.value').text(dm.prefix+(day_Viaj*365).toFixed(0));
	    break;
	}

	//Update units
	d3.select('#status g.first text.units').text(dm.label);
	d3.select('#status g.second text.units').text(dm.label);
	d3.select('#status g.third text.units').text(dm.label);
  }

function reset_hour_info() {
	var dm = display_modes[display_mode];
	week_kwh = new Number(totals.week);

	//d3.select('#status g.first text.time').text(ts_to_datestring(base_ts, 7*week) + ' - ' + ts_to_datestring(base_ts, 7*week+6));
	var etiqueta;
	if(GLOBAL_etiqueta_mes=="")etiqueta=GLOBAL_etiqueta_anyo;
	else etiqueta=GLOBAL_etiqueta_mes;
	d3.select('#status g.first text.time').text(etiqueta);
	d3.select('#status g.second text.time').text('');
	//d3.select('#status g.third text.time').text('Projection');

	switch(display_mode) {
	  case 0:
	    d3.select('#status g.first text.value').text(dm.prefix+week_kwh.toFixed(1));
	    d3.select('#status g.second text.value').text('');
	    //d3.select('#status g.third text.value').text(dm.prefix+(week_kwh*365/7).toFixed(0));
	    break;
	}

	d3.select('#status g.first text.units').text(dm.label);
	d3.select('#status g.second text.units').text('');
}
/*
function ts_to_datestring(ts, day_offset) {//Calcular la semana que está visualizando, no lo uso
	date = new Date(ts + day_offset * 3600 * 24 * 1000);
	return date.toDateString().slice(4, 10);
}*/

function calculate_totals(week_data) {
	var totals = {days:[0, 0, 0, 0, 0, 0, 0], week:0};
		for(var d=0; d<7; d++) {
			for(var h=0; h<24; h++)
				totals.days[d]+=week_data[d*24+h];
			totals.week += totals.days[d]
		}
	return totals;
}

function convert_to_ampm(h) {
	if(h=='0' || h=='24')
	  return '00:00';
	var suffix = 'am';
	if(h>11) suffix = 'pm';
	if(h>12)
	  return (h-12)+suffix;
	else
	  return h+suffix;
}


/***********************************************************************************************/
/*                               2 CAPACIDAD DE VIAJEROS EN MESES                              */
/***********************************************************************************************/

  console.log("Añado volumen en meses.");
  // OPCIONES: Media entre semana, Media fin de semana, Volumen por meses(*por defecto), 
  $("#module-right-content").append("<div id='horarios_meses'><table><tr><td><select class='form-control' onchange='Reload()' id='metric'><option>Entre semana</option><option>Fin de semana</option><option selected>Todos los dias</option></select></td><td><div class='checkbox' style='margin:5px;'><label><input id='ordenar_chart2' type='checkbox'/>Ordenar</label></div></td></tr></table></div>");
  var ancho=550;
  var alto=50;

  var svg = d3.select('#horarios_meses').append('svg').attr('height', alto+50).attr('width', ancho+50);
  var g = svg.append('g').attr("transform", "translate(40, 20)");
  g.append('g').attr('class', 'x axis').attr('transform', 'translate(0, '+alto+')');
  g.append('g').attr('class', 'y axis');
  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
    	return "<div style='background-color:#22a;color:white;padding:5px;font-size:11px;border: 2px solid;border-radius: 5px;'>Volumen: " + d.valor + "</div>";
    })
  svg.call(tip);
  
  var loadData = function(GLOBAL_volumenes_mes_entresemana, GLOBAL_volumenes_mes_findesemana, GLOBAL_volumenes_mes_todoslosdias,GLOBAL_meses) {
	  var metric = document.getElementById('metric').selectedOptions[0].text;
	  var data = [];
	  var valor, mes, max=0;

	  if(metric=="Entre semana"){
	    for(var i in GLOBAL_volumenes_mes_entresemana) {
	        valor = GLOBAL_volumenes_mes_entresemana[i];
	        mes = GLOBAL_meses[i];
	        if(max<valor)max=valor;
	        //console.log("(1)MES["+i+"]"+mes+" VALOR:"+valor);
	        data.push({ 
	            "valor" : valor,
	            "month" : mes,
	            "month_index": i
	        });
	    }
	  }else if(metric=="Fin de semana"){
	    for(var i in GLOBAL_volumenes_mes_findesemana) {
	        valor = GLOBAL_volumenes_mes_findesemana[i];
	        mes = GLOBAL_meses[i];
	        if(max<valor)max=valor;
	        //console.log("(2)MES["+i+"]"+mes+" VALOR:"+valor);
	        data.push({ 
	            "valor" : valor,
	            "month" : mes,
	            "month_index": i
	        });
	    }
	  }else if(metric=="Todos los dias"){
	    for(var i in GLOBAL_volumenes_mes_todoslosdias) {
	        valor = GLOBAL_volumenes_mes_todoslosdias[i];
	        mes = GLOBAL_meses[i];
	        if(max<valor)max=valor;
	        //console.log("(3)MES["+i+"]"+mes+" VALOR:"+valor);
	        data.push({ 
	            "valor" : valor,
	            "month" : mes,
	            "month_index": i
	        });
	    }
	  }else{
	    console.log("No existe la métrica '"+metric+"'");
	  }

	    var months = data.map(function(d) { return d.month })
	    var x = d3.scale.ordinal().rangeRoundBands([0, ancho], .1).domain(months);
	    var valores = data.map(function(d) { return d.valor });
	    var y = d3.scale.linear().range([alto, 0]).domain([0, d3.max(valores)]);
	    var rect = g.selectAll('.bar').data(data);
	    rect.enter().append('rect');
	    rect.exit().remove();
	    rect.attr('class', 'bar')
	        .attr('width', x.rangeBand())
	        .attr('height', function(d) { return alto - y(d.valor)})
	        .attr('x', function(d) { return x(d.month) })
	        .attr('y', function(d) { return y(d.valor) })
	        .on('mouseover', tip.show)
	        .on('mouseout', tip.hide)
	        .on("click", function(d) {  
	        	CambiaColoresHorariosMes(d.month_index);
	        	GLOBAL_etiqueta_mes=d.month+" "+GLOBAL_etiqueta_anyo;
	        	d3.select('#status g.first text.time').text(GLOBAL_etiqueta_mes);//grafico de horarios
	        	d3.select('#title_barchart').text(GLOBAL_etiqueta_mes);//grafico central, barchart
	        });
	    var xAxis = d3.svg.axis().scale(x).orient('bottom');
	    var yAxis = d3.svg.axis().scale(y).orient('left').tickFormat(d3.format('.0'));
	      d3.select('.x.axis').call(xAxis);
	      d3.select('.y.axis').call(yAxis);
	      d3.select('#ordenar_chart2').on('change', function() {
	      var sortByValor = function(a, b) { return b.valor - a.valor; };
	      var sortByMonth = function(a, b) { return d3.ascending(monthIndex(a.month), monthIndex(b.month)); };
	      var sortedMonths = data.sort(this.checked ? sortByValor : sortByMonth)
	                         .map(function(d) { return d.month; })
	                         x.domain(sortedMonths)
	      var transition = svg.transition().duration(750);
	      var delay = function(d, i) { return i * 50; };
	      transition.selectAll(".bar")
	          .delay(delay)
	          .attr("x", function(d) { return x(d.month); });
	      transition.select(".x.axis")
	          .call(xAxis)
	        .selectAll("g")
	          .delay(delay);
	    })
	  
	}
	function Reload(){
	  loadData(GLOBAL_volumenes_mes_entresemana, GLOBAL_volumenes_mes_findesemana, GLOBAL_volumenes_mes_todoslosdias, GLOBAL_meses);
	}
	Reload();

/***********************************************************************************************/
/*                               3 % POR DIA ENTRE SEMANA Y FINDE                              */
/***********************************************************************************************/

console.log("Añado info.");//CAPACIDAD POR VAGÓN: 130 pasajeros
$("#module-right-content").append("<div id='info_horarios'><div id='info_vagones'><p>Esta linea precisa a las 12h: <br>&nbsp&nbsp 8 vagones entre semana <br>&nbsp&nbsp 3 vagones fin de semana  </p></div> <div id='pieChart'></div><div id='barChart'></div><div id='lineChart'></div><div id='texto'></div></div>");

/*################ FORMATS ##################
-------------------------------------------*/

var formatAsPercentage = d3.format("%"),
formatAsPercentage1Dec = d3.format(".1%"),
formatAsInteger = d3.format(","),
fsec = d3.time.format("%S s"),
fmin = d3.time.format("%M m"),
fhou = d3.time.format("%H h"),
fwee = d3.time.format("%a"),
fdat = d3.time.format("%d d"),
fmon = d3.time.format("%b");

/*############# PIE CHART ###################
-------------------------------------------*/

function dsPieChart(){

	var dataset = [
	{category: "6h", measure: 0.30},
	{category: "7h", measure: 0.25},
	{category: "8h", measure: 0.15},
	{category: "9h", measure: 0.05},
	{category: "11h", measure: 0.18},
	{category: "12h", measure:0.04}
	];

	var 	width = 150,
	height = 150,
	outerRadius = Math.min(width, height) / 2,
	innerRadius = outerRadius * .999,   
   
	innerRadiusFinal = outerRadius * .5,
	innerRadiusFinal3 = outerRadius* .45,
	color = d3.scale.category20();

   var vis = d3.select("#pieChart")
	     .append("svg:svg")              //create the SVG element inside the <body>
	     .data([dataset])                   //associate our data with the document
	         .attr("width", width)           //set the width and height of our visualization (these will be attributes of the <svg> tag
	         	.attr("height", height)
	     .append("svg:g")                //make a group to hold our pie chart
	         .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")")    //move the center of the pie chart from 0, 0 to radius, radius
	         ;

   var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
   .outerRadius(outerRadius).innerRadius(innerRadius);
   
   // for animation
   var arcFinal = d3.svg.arc().innerRadius(innerRadiusFinal).outerRadius(outerRadius);
   var arcFinal3 = d3.svg.arc().innerRadius(innerRadiusFinal3).outerRadius(outerRadius);

   var pie = d3.layout.pie()           //this will create arc data for us given a list of values
        .value(function(d) { return d.measure; });    //we must tell it out to access the value of each element in our data array

   var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
        .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
            .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
               .attr("class", "slice")    //allow us to style things in the slices (like text)
               .on("mouseover", mouseover)
               .on("mouseout", mouseout)
               .on("click", up);

               arcs.append("svg:path")
               .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
               .attr("d", arc)     //this creates the actual SVG path using the associated data (pie) with the arc drawing function
	.append("svg:title") //mouseover title showing the figures
	.text(function(d) { return d.data.category + ": " + formatAsPercentage(d.data.measure); });	

	d3.selectAll("g.slice").selectAll("path").transition()
	.duration(750)
	.delay(10)
	.attr("d", arcFinal );

	  // Add a label to the larger arcs, translated to the arc centroid and rotated.
	  // source: http://bl.ocks.org/1305337#index.html
	  arcs.filter(function(d) { return d.endAngle - d.startAngle > .2; })
	  .append("svg:text")
	  .attr("dy", ".35em")
	  .attr("text-anchor", "middle")
	  .attr("transform", function(d) { return "translate(" + arcFinal.centroid(d) + ")rotate(" + angle(d) + ")"; })
	      //.text(function(d) { return formatAsPercentage(d.value); })
	      .text(function(d) { return d.data.category; });

	   // Computes the label angle of an arc, converting from radians to degrees.
	   function angle(d) {
	   	var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
	   	return a > 90 ? a - 180 : a;
	   }

// Pie chart title	
vis.append("svg:text")
.attr("dy", ".35em")
.attr("text-anchor", "middle")
.text(GLOBAL_etiqueta_mes)
.attr("class","title_center");    

function mouseover() {
	d3.select(this).select("path").transition()
	.duration(750)
	        /*.attr("stroke","red")
	        .attr("stroke-width", 1.5)*/
	        .attr("d", arcFinal3);
	    }

	    function mouseout() {
	    	d3.select(this).select("path").transition()
	    	.duration(750)
	        //.attr("stroke","blue")
	        //.attr("stroke-width", 1.5)
	        .attr("d", arcFinal);
	    }

	    function up(d, i) {
			//updateBarChart(dataset[i].category);
			updateBarChart(d.data.category, color(i));
			updateLineChart(d.data.category, color(i));
	    }
}

dsPieChart();

/*############# BAR CHART ###################
-------------------------------------------*/

var datasetBarChart = [
{ group: "All", category: "Entre semana", measure: 63850.4963 }, 
{ group: "All", category: "Fin de semana", measure: 78258.0845 }, 
{ group: "6h", category: "Entre semana", measure: 19441.5648 }, 
{ group: "6h", category: "Fin de semana", measure: 25922.0864 }, 
{ group: "7h", category: "Entre semana", measure: 22913.2728 }, 
{ group: "7h", category: "Fin de semana", measure: 7637.7576 }, 
{ group: "8h", category: "Entre semana", measure: 1041.5124 }, 
{ group: "8h", category: "Fin de semana", measure: 2430.1956 }, 
{ group: "9h", category: "Entre semana", measure: 7406.3104 }, 
{ group: "9h", category: "Fin de semana", measure: 2545.9192 }, 
{ group: "10h", category: "Entre semana", measure: 7637.7576 }, 
{ group: "10h", category: "Fin de semana", measure: 35411.4216 }, 
{ group: "11h", category: "Entre semana", measure: 3182.399 }, 
{ group: "11h", category: "Fin de semana", measure: 867.927 }, 
{ group: "12h", category: "Entre semana", measure: 2227.6793 }, 
{ group: "12h", category: "Fin de semana", measure: 3442.7771 }
];

// set initial group value
var group = "All";
function datasetBarChosen(group) {
	var ds = [];
	for (x in datasetBarChart) {
		if(datasetBarChart[x].group==group){
			ds.push(datasetBarChart[x]);
		} 
	}
	return ds;
}

function dsBarChartBasics() {
	var margin = {top: 30, right: 5, bottom: 20, left: 50},
	width = 200 - margin.left - margin.right,
	height = 150 - margin.top - margin.bottom,
	colorBar = d3.scale.category20(),
	barPadding = 1;
	return {
		margin : margin, 
		width : width, 
		height : height, 
		colorBar : colorBar, 
		barPadding : barPadding
	};
}

function dsBarChart() {
	var firstDatasetBarChart = datasetBarChosen(group);         	
	var basics = dsBarChartBasics();
	var margin = basics.margin,
	width = basics.width,
	height = basics.height,
	colorBar = basics.colorBar,
	barPadding = basics.barPadding;
	
	var xScale = d3.scale.linear()
	.domain([0, firstDatasetBarChart.length])
	.range([0, width]);
	
	var yScale = d3.scale.linear()
	.domain([0, d3.max(firstDatasetBarChart, function(d) { return d.measure; })])
   .range([height, 0]);

	//Create SVG element
	var svg = d3.select("#barChart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.attr("id","barChartPlot");
	
	/*Create SVG element
	var svg2 = d3.select("#texto")
	.append("svg")
	.attr("width",50)
	.attr("height", 50)
	.attr("transform", "translate(" + margin.left + "," + margin.bottom + ")")
	.enter()
	.append('text')
	.attr("id","texto")
	.text("hola");*/
	
	var plot = svg
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	plot.selectAll("rect")
	.data(firstDatasetBarChart)
	.enter()
	.append("rect")
	.attr("x", function(d, i) {
		return xScale(i);
	})
	.attr("width", width / firstDatasetBarChart.length - barPadding)   
	.attr("y", function(d) {
		return yScale(d.measure);
	})  
	.attr("height", function(d) {
		return height-yScale(d.measure);
	})
	.attr("fill", "lightgrey");
	

	// Add y labels to plot	
	plot.selectAll("text")
	.data(firstDatasetBarChart)
	.enter()
	.append("text")
	.text(function(d) {
		return formatAsInteger(d3.round(d.measure));
	})
	.attr("text-anchor", "middle")
	// Set x position to the left edge of each bar plus half the bar width
	.attr("x", function(d, i) {
		return (i * (width / firstDatasetBarChart.length)) + ((width / firstDatasetBarChart.length - barPadding) / 2);
	})
	.attr("y", function(d) {
		return yScale(d.measure) + 14;
	})
	.attr("class", "yAxis");
	
	// Add x labels to chart	
	
	var xLabels = svg
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + (margin.top + height)  + ")");
	
	xLabels.selectAll("text.xAxis")
	.data(firstDatasetBarChart)
	.enter()
	.append("text")
	.text(function(d) { return d.category;})
	.attr("text-anchor", "middle")
	// Set x position to the left edge of each bar plus half the bar width
	.attr("x", function(d, i) {
		return (i * (width / firstDatasetBarChart.length)) + ((width / firstDatasetBarChart.length - barPadding) / 2);
	})
	.attr("y", 15)
	.attr("class", "xAxis")
  //.attr("style", "font-size: 12; font-family: Helvetica, sans-serif")
  ;	

	// Title
	
	svg.append("text")
	.attr("id","title_barchart")
	.attr("x", (width + margin.left + (margin.right)/2)-40)
	.attr("y", 15)
	.attr("class","title")
	.attr("text-anchor", "middle")
	.text(GLOBAL_etiqueta_mes);
}

dsBarChart();
/* ** UPDATE CHART ** */
/* updates bar chart on request */

function updateBarChart(group, colorChosen) {
	
	var currentDatasetBarChart = datasetBarChosen(group);
	var basics = dsBarChartBasics();
	var margin = basics.margin,
	width = basics.width,
	height = basics.height,
	colorBar = basics.colorBar,
	barPadding = basics.barPadding;

	var 	xScale = d3.scale.linear()
	.domain([0, currentDatasetBarChart.length])
	.range([0, width]);

	var yScale = d3.scale.linear()
	.domain([0, d3.max(currentDatasetBarChart, function(d) { return d.measure; })])
	.range([height,0]);

	var svg = d3.select("#barChart svg");

	var plot = d3.select("#barChartPlot")
	.datum(currentDatasetBarChart);
	
	/* Note that here we only have to select the elements - no more appending! */
	plot.selectAll("rect")
	.data(currentDatasetBarChart)
	.transition()
	.duration(750)
	.attr("x", function(d, i) {
		return xScale(i);
	})
	.attr("width", width / currentDatasetBarChart.length - barPadding)   
	.attr("y", function(d) {
		return yScale(d.measure);
	})  
	.attr("height", function(d) {
		return height-yScale(d.measure);
	})
	.attr("fill", colorChosen);

plot.selectAll("text.yAxis") // target the text element(s) which has a yAxis class defined
.data(currentDatasetBarChart)
.transition()
.duration(750)
.attr("text-anchor", "middle")
.attr("x", function(d, i) {
	return (i * (width / currentDatasetBarChart.length)) + ((width / currentDatasetBarChart.length - barPadding) / 2);
})
.attr("y", function(d) {
	return yScale(d.measure) + 14;
})
.text(function(d) {
	return formatAsInteger(d3.round(d.measure));
})
.attr("class", "yAxis")	 ;


svg.selectAll("text.title") // target the text element(s) which has a title class defined
.attr("x", (width + margin.left + margin.right)/2)
.attr("y", 15)
.attr("class","title")
.attr("text-anchor", "middle")
.text("Pasajeros a las "+group );
}

/*
############# LINE CHART ##################
-------------------------------------------
*/
var datasetLineChart = [
{ group: "All", category: 2008, measure: 289309 }, 
{ group: "All", category: 2009, measure: 234998 }, 
{ group: "All", category: 2010, measure: 310900 }, 
{ group: "All", category: 2011, measure: 223900 }, 
{ group: "All", category: 2012, measure: 234500 },
{ group: "All", category: 2013, measure: 234500 },
{ group: "All", category: 2014, measure: 234500 },
{ group: "6h", category: 2008, measure: 81006.52 }, 
{ group: "6h", category: 2009, measure: 70499.4 }, 
{ group: "6h", category: 2010, measure: 96379 }, 
{ group: "6h", category: 2011, measure: 64931 }, 
{ group: "6h", category: 2012, measure: 70350 }, 
{ group: "6h", category: 2013, measure: 70350 }, 
{ group: "6h", category: 2014, measure: 70350 }, 
{ group: "7h", category: 2008, measure: 63647.98 }, 
{ group: "7h", category: 2009, measure: 61099.48 }, 
{ group: "7h", category: 2010, measure: 87052 }, 
{ group: "7h", category: 2011, measure: 58214 }, 
{ group: "7h", category: 2012, measure: 58625 }, 
{ group: "7h", category: 2013, measure: 58625 }, 
{ group: "7h", category: 2014, measure: 58625 }, 
{ group: "8h", category: 2008, measure: 23144.72 }, 
{ group: "8h", category: 2009, measure: 14099.88 }, 
{ group: "8h", category: 2010, measure: 15545 }, 
{ group: "8h", category: 2011, measure: 11195 }, 
{ group: "8h", category: 2012, measure: 11725 }, 
{ group: "8h", category: 2013, measure: 11725 },
{ group: "8h", category: 2014, measure: 11725 },
{ group: "9h", category: 2008, measure: 34717.08 }, 
{ group: "9h", category: 2009, measure: 30549.74 }, 
{ group: "9h", category: 2010, measure: 34199 }, 
{ group: "9h", category: 2011, measure: 33585 }, 
{ group: "9h", category: 2012, measure: 35175 }, 
{ group: "9h", category: 2013, measure: 35175 }, 
{ group: "9h", category: 2014, measure: 35175 }, 
{ group: "10h", category: 2008, measure: 69434.16 }, 
{ group: "10h", category: 2009, measure: 46999.6 }, 
{ group: "10h", category: 2010, measure: 62180 }, 
{ group: "10h", category: 2011, measure: 40302 }, 
{ group: "10h", category: 2012, measure: 42210 }, 
{ group: "10h", category: 2013, measure: 42210 },
{ group: "10h", category: 2014, measure: 42210 },
{ group: "11h", category: 2008, measure: 7232.725 }, 
{ group: "11h", category: 2009, measure: 4699.96 }, 
{ group: "11h", category: 2010, measure: 6218 }, 
{ group: "11h", category: 2011, measure: 8956 }, 
{ group: "11h", category: 2012, measure: 9380 },
{ group: "11h", category: 2013, measure: 9380 }, 
{ group: "11h", category: 2014, measure: 9380 }, 
{ group: "12h", category: 2008, measure: 10125.815 }, 
{ group: "12h", category: 2009, measure: 7049.94 }, 
{ group: "12h", category: 2010, measure: 9327 }, 
{ group: "12h", category: 2011, measure: 6717 }, 
{ group: "12h", category: 2012, measure: 7035 },
{ group: "12h", category: 2013, measure: 7035 },
{ group: "12h", category: 2014, measure: 7035 }
];

// set initial category value
var group = "All";

function datasetLineChartChosen(group) {
	var ds = [];
	for (x in datasetLineChart) {
		if(datasetLineChart[x].group==group){
			ds.push(datasetLineChart[x]);
		} 
	}
	return ds;
}

function dsLineChartBasics() {
	var margin = {top: 20, right: 10, bottom: 0, left: 50},
	width = 170 - margin.left - margin.right,
	height = 150 - margin.top - margin.bottom;
	return {
		margin : margin, 
		width : width, 
		height : height
	};
}


function dsLineChart() {
	var firstDatasetLineChart = datasetLineChartChosen(group);    
	var basics = dsLineChartBasics();
	var margin = basics.margin,
	width = basics.width,
	height = basics.height;

	var xScale = d3.scale.linear()
	.domain([0, firstDatasetLineChart.length-1])
	.range([0, width]);

	var yScale = d3.scale.linear()
	.domain([0, d3.max(firstDatasetLineChart, function(d) { return d.measure; })])
	.range([height, 0]);
	
	var line = d3.svg.line()
	    //.x(function(d) { return xScale(d.category); })
	    .x(function(d, i) { return xScale(i); })
	    .y(function(d) { return yScale(d.measure); });

	    var svg = d3.select("#lineChart").append("svg")
	    .datum(firstDatasetLineChart)
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    // create group and move it so that margins are respected (space for axis and title)
	    
	    var plot = svg
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	    .attr("id", "lineChartPlot");

	    /* descriptive titles as part of plot -- start */
	    var dsLength=firstDatasetLineChart.length;


	    var svg2 = d3.select("#totalChart").append("svg")
	    .datum(firstDatasetLineChart)
	    .attr("width", "200px")
	    .attr("height", "200px")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	    .append("g").append("text")
	    .text(firstDatasetLineChart[dsLength-1].measure);

	    plot.append("text")
	    .text(firstDatasetLineChart[dsLength-1].measure)
	    .attr("id","lineChartTitle2")
	    .attr("x",width/2)
	    .attr("y",height/2)	;
	    /* descriptive titles -- end */
	    
	    plot.append("path")
	    .attr("class", "line")
	    .attr("d", line)	
	    // add color
	    .attr("stroke", "lightgrey");

	    plot.selectAll(".dot")
	    .data(firstDatasetLineChart)
	    .enter().append("circle")
	    .attr("class", "dot")
	    //.attr("stroke", function (d) { return d.measure==datasetMeasureMin ? "red" : (d.measure==datasetMeasureMax ? "green" : "steelblue") } )
	    .attr("fill", function (d) { return d.measure==d3.min(firstDatasetLineChart, function(d) { return d.measure; }) ? "red" : (d.measure==d3.max(firstDatasetLineChart, function(d) { return d.measure; }) ? "green" : "white") } )
	    //.attr("stroke-width", function (d) { return d.measure==datasetMeasureMin || d.measure==datasetMeasureMax ? "3px" : "1.5px"} )
	    .attr("cx", line.x())
	    .attr("cy", line.y())
	    .attr("r", 3.5)
	    .attr("stroke", "lightgrey")
	    .append("title")
	    .text(function(d) { return d.category + ": " + formatAsInteger(d.measure); });

	    svg.append("text")
	    .text(" SEMANA "+GLOBAL_etiqueta_mes)
	    .attr("id","lineChartTitle1")	
	    .attr("x",margin.left + ((width + margin.right)/2)+10)
	    .attr("y", 10);

	}
	dsLineChart();


	/* ** UPDATE CHART ** */
	/* updates bar chart on request */
	function updateLineChart(group, colorChosen) {

		var currentDatasetLineChart = datasetLineChartChosen(group);   

		var basics = dsLineChartBasics();

		var margin = basics.margin,
		width = basics.width,
		height = basics.height;

		var xScale = d3.scale.linear()
		.domain([0, currentDatasetLineChart.length-1])
		.range([0, width]);

		var yScale = d3.scale.linear()
		.domain([0, d3.max(currentDatasetLineChart, function(d) { return d.measure; })])
		.range([height, 0]);

		var line = d3.svg.line()
		.x(function(d, i) { return xScale(i); })
		.y(function(d) { return yScale(d.measure); });

		var plot = d3.select("#lineChartPlot")
		.datum(currentDatasetLineChart);

		/* descriptive titles as part of plot -- start */
		var dsLength=currentDatasetLineChart.length;
		plot.select("text")
		.text(currentDatasetLineChart[dsLength-1].measure);
		/* descriptive titles -- end */

		plot
		.select("path")
		.transition()
		.duration(750)	    
		.attr("class", "line")
		.attr("d", line)	
	   // add color
	   .attr("stroke", colorChosen);
	   
	   var path = plot
	   .selectAll(".dot")
	   .data(currentDatasetLineChart)
	   .transition()
	   .duration(750)
	   .attr("class", "dot")
	   .attr("fill", function (d) { return d.measure==d3.min(currentDatasetLineChart, function(d) { return d.measure; }) ? "red" : (d.measure==d3.max(currentDatasetLineChart, function(d) { return d.measure; }) ? "green" : "white") } )
	   .attr("cx", line.x())
	   .attr("cy", line.y())
	   .attr("r", 3.5)
	   // add color
	   .attr("stroke", colorChosen);
	   
	   path
	   .selectAll("title")
	   .text(function(d) { return d.category + ": " + formatAsInteger(d.measure); });  

}
	
	
	
	
/*************************************************************************************	
	                            INFO TOOLTIP ONMOUSEOVER
**************************************************************************************
	
	var div = document.getElementById('info_vagones');
	var fadeSpeed = 25; // a value between 1 and 1000 where 1000 will take 10
	                    // seconds to fade in and out and 1 will take 0.01 sec.
	var tipMessage = "The content of the tooltip...";

	var showTip = function(){    
	    var tip = document.createElement("span");
	    tip.className = "tooltip";
	    tip.id = "tip";
	    tip.innerHTML = tipMessage;
	    div.appendChild(tip);
	    tip.style.opacity="0"; // to start with...
	    var intId = setInterval(function(){
	        newOpacity = parseFloat(tip.style.opacity)+0.1;
	        tip.style.opacity = newOpacity.toString();
	        if(tip.style.opacity == "1"){
	            clearInterval(intId);
	        }
	    }, fadeSpeed);
	};
	var hideTip = function(){
	    var tip = document.getElementById("tip");
	    var intId = setInterval(function(){
	        newOpacity = parseFloat(tip.style.opacity)-0.1;
	        tip.style.opacity = newOpacity.toString();
	        if(tip.style.opacity == "0"){
	            clearInterval(intId);
	            tip.remove();
	        }
	    }, fadeSpeed);
	    tip.remove();
	};

	a.addEventListener("mouseover", showTip, false);
	a.addEventListener("mouseout", hideTip, false);*/
	
	
	
	/****************
	      FIN
	****************/
	
	$("#estado_peticion").html("<font style='color:green;font-weight:500px'>[OK]</font>");