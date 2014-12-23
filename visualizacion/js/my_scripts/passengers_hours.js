

var linea=$("#linea_seleccionada").val();
HeatMapData = {
   max: 0,
   data: []
}
heatmapLayer.setData(HeatMapData);

	/**** VARIABLES GLOBALES ******/
	var GLOBAL_datos_viajeros;
	
	var GLOBAL_volumenes_hora=new Array(168);//24h*7dias, primeros 24= horas lunes
	for(var i=0;i<168;i++){GLOBAL_volumenes_hora[i]=0;}
	var GLOBAL_matriz_meses_horas=new Array(12);
	for (var i = 0; i < 12; i++) {
		GLOBAL_matriz_meses_horas[i] =new Array(168);
		for(var j=0;j<168;j++){GLOBAL_matriz_meses_horas[i][j]=0;}
    }
	
	var GLOBAL_volumenes_mes_entresemana = [0,0,0,0,0,0,0,0,0,0,0,0];
	var GLOBAL_volumenes_mes_findesemana = [0,0,0,0,0,0,0,0,0,0,0,0];
	var GLOBAL_volumenes_mes_todoslosdias = [0,0,0,0,0,0,0,0,0,0,0,0];
	var GLOBAL_meses= ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
	var GLOBAL_etiqueta_mes="";
	var GLOBAL_mes_seleccionado=0;
	var GLOBAL_etiqueta_anyo="2014"
	/******************************/

var data_ajax = 'lin='+linea;// . '&var2='. ":)" ;
$.ajax({
	type: "GET",
	datatype: 'json',
	async: false,
	data: data_ajax,
      url: "GetDatosViajeros.php", 
      success: function(data) {
    	  GLOBAL_datos_viajeros=data;
      }
}).done(function() {
	$("#estado_peticion").append("<font style='color:green;font-weight:500px'> . [OK.CONSULTA_1]</font>");
})
.fail(function() {
	$("#estado_peticion").append("<font style='color:red;font-weight:500px'>[ERROR CONSULTA1 LINEA "+linea+"]</font>");
});

console.log("CALCULANDO LOS VIAJEROS EN MESES/SEMANA/HORAS...");
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


/* COMIENZO A ESCRIBIR */

$("#module-right-content").html("<h3 class='tit'>Volumen de pasajeros en linea "+linea+"</h3>");
/***********************************************************************************************/
/*                                       1 GRAFICO HORARIO                                     */
/***********************************************************************************************/
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
function getMax(array){return Math.max.apply(Math,array);}

var base_ts = 1283731200000;//para parsear a date_string 'semana exacta de inicio'
var week = 0;
var totals = {days:[], week:0};
var display_mode = 0, display_modes = [{label: 'pasajeros', prefix: ''}, {label: '', prefix: ''}, {label: '', prefix: ''}];
var week_data;

week_data = horario_data.slice(week*7*24,(week+1)*7*24);
totals = calculate_totals(week_data);

var g = d3.select("svg").append("g").attr("id", "chart");

ir = function(d, i) {return initial_rad+Math.floor(i/24)*rad_offset;}
or = function(d, i) {return initial_rad+rad_offset+Math.floor(i/24)*rad_offset;}
sa = function(d, i) {return (i*2*Math.PI)/24;}
ea = function(d, i) {return ((i+1)*2*Math.PI)/24;}

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

function render_hour_info(d, i) {
	var days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
	var day = Math.floor(i/24); //day index
	var h = i%24; //hour index
	var viaj = new Number(d);
	var dm = display_modes[display_mode];

	d3.select('#status g.first text.time').text(days[day]);
	d3.select('#status g.second text.time').text(convert_to_ampm(h)+' - '+convert_to_ampm(parseInt(h)+1));
	d3.select('#status g.third text.time').text('Projection');

	switch(display_mode) {
	  case 0:
	    d3.select('#status g.first text.value').text(viaj.toFixed(1));
	    d3.select('#status g.second text.value').text(viaj.toFixed(1));
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
	var etiqueta;
	if(GLOBAL_etiqueta_mes=="")etiqueta=GLOBAL_etiqueta_anyo;
	else etiqueta=GLOBAL_etiqueta_mes;
	d3.select('#status g.first text.time').text(etiqueta);
	d3.select('#status g.second text.time').text('');

	switch(display_mode) {
	  case 0:
	    d3.select('#status g.first text.value').text(dm.prefix+week_kwh.toFixed(1));
	    d3.select('#status g.second text.value').text('');
	    break;
	}
	d3.select('#status g.first text.units').text(dm.label);
	d3.select('#status g.second text.units').text('');
}

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

  // OPCIONES: Media entre semana, Media fin de semana, Volumen por meses(*por defecto), 
  $("#module-right-content").append("<div id='horarios_meses'><table><tr><td><select class='form-control' onchange='Reload()' id='metric'><option>Entre semana</option><option>Fin de semana</option><option selected>Todos los dias</option></select></td><td><div class='checkbox' style='margin:5px;'><label><input id='ordenar_chart2' type='checkbox'/>Ordenar</label></div></td></tr></table></div>");
  var ancho=550;
  var alto=82;

  var svg = d3.select('#horarios_meses').append('svg').attr('height', alto+50).attr('width', ancho+250);
  var g = svg.append('g').attr("transform", "translate(90, 20)");
  g.append('g').attr('class', 'x axis').attr('transform', 'translate(0, '+alto+')');
  g.append('g').attr('class', 'y axis');
  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
    	return "<div class='info2'>Volumen: " + d.valor + "</div>";
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
	        	GLOBAL_mes_seleccionado=d.month_index;
	        	CambiaColoresHorariosMes(d.month_index);
	        	GLOBAL_etiqueta_mes=d.month+" "+GLOBAL_etiqueta_anyo;
	        	d3.select('#status g.first text.time').text(GLOBAL_etiqueta_mes);//grafico de horarios
	        	d3.select('#barChartTitle').text(GLOBAL_etiqueta_mes);//grafico central, barchart
	        	
	        	//Inicia gráfico central:
	        	$("#info_vagones").html("<p class='info pos_info_vagones2'>Clicka una hora !</p><div id='pieChart'></div><div id='lineChart'></div><div id='barChart'></div>");
	        	$("#pieChart").html("");
	        	$("#barChart").html("");
	        	$("#lineChart").html("");
	        	dsPieChart();
	        	dsBarChart();
	        	dsLineChart();
	        	
	        	// Heatmap:
	        	var HeatMapData=CalculaHeatMap(d.month_index);
	        	//console.log(HeatMapData);
                heatmapLayer.setData(HeatMapData);

	        });
	    var xAxis = d3.svg.axis().scale(x).orient('bottom');
	    var yAxis = d3.svg.axis().scale(y).orient('left').tickFormat(d3.format('.0'));
	      d3.select('.x.axis').call(xAxis);
	      d3.select('.y.axis').call(yAxis);
	      d3.select('#ordenar_chart2').on('change', function() {
	      var sortByValor = function(a, b) { return b.valor - a.valor; };
	      var sortByMonth = function(a, b) { return d3.ascending(a.month_index, b.month_index); };
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

//CAPACIDAD POR VAGÓN: 130 pasajeros
$("#module-right-content").append("<div id='info_horarios'><div id='info_vagones'><p style='margin:10px;padding: 10px 20px; 10px 20px;' class='info'>Clicka un mes en el gráfico de barras.</p></div>");

/*################ FORMATOS ##################
-------------------------------------------*/
var formatAsInteger = d3.format(","),
fsec = d3.time.format("%S s"),
fmin = d3.time.format("%M m"),
fhou = d3.time.format("%H h"),
fwee = d3.time.format("%a"),
fdat = d3.time.format("%d d"),
fmon = d3.time.format("%b");

function media(arr){
	if(arr==null || arr==undefined) return 0;
	var sum=0;
	for (var i=0;i<arr.length;i++){
		sum+=arr[i];
	}
	return sum/arr.length;
}
/*############# PIE CHART ###################
-------------------------------------------*/

function dsPieChart(){
	/* CALCULO DATASET */
	var mes_data = GLOBAL_matriz_meses_horas[GLOBAL_mes_seleccionado];																																																																																																																																																																																																																																																																																																										
	var dia24h=new Array(24);
	for (var i = 0; i < 24; i++) {
		dia24h[i] =[];
    }

	for(var i=0;i<mes_data.length;i++){          //Suma y clasifico por horas
		var num_mod=i+24;
		if(i<=23){
			dia24h[i].push(mes_data[i]);//añado horas
		}else{ 
			dia24h[i%24].push(mes_data[i]);
		}
	}
	var suma_media_horas=0;
	for(var i=0;i<mes_data.length;i++){ // sumo medias
		suma_media_horas+=media(dia24h[i]);
	}
	var dataset = []
    for(var i=0;i<dia24h.length;i++) {  // saco porcentajes
    	if(dia24h[i]!=null || dia24h[i]!=undefined){
	    	var porcentaje=(media(dia24h[i])*100)/suma_media_horas;
	    	//console.log(i+"h = "+porcentaje+" %");
	        if(porcentaje>0){
		        dataset.push({ 
		            "category" : i+"h",
		            "measure" : porcentaje
		        });
	        }
    	}
    }
	/* FIN CALCULO DATASET */
	var width = 150,
	height = 150,
	outerRadius = Math.min(width, height) / 2,
	innerRadius = outerRadius * .999,   
	innerRadiusFinal = outerRadius * .5,
	innerRadiusFinal3 = outerRadius* .45,
	color = d3.scale.category20();

   var vis = d3.select("#pieChart")
	     .append("svg:svg")              
	     .data([dataset])                   
	     .attr("width", width)          
	     .attr("height", height)
	     .append("svg:g")               
	     .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

   var arc = d3.svg.arc()          
   .outerRadius(outerRadius).innerRadius(innerRadius);
   var arcFinal = d3.svg.arc().innerRadius(innerRadiusFinal).outerRadius(outerRadius);
   var arcFinal3 = d3.svg.arc().innerRadius(innerRadiusFinal3).outerRadius(outerRadius);
   var pie = d3.layout.pie().value(function(d) { return d.measure; });    

   var arcs = vis.selectAll("g.slice")     
        .data(pie)                          
        .enter()                         
        .append("svg:g")                
        .attr("class", "slice")   
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("click", up);

   arcs.append("svg:path")
      .attr("fill", function(d, i) { return color(i); } ) 
      .attr("d", arc)     
	  .append("svg:title")
	  .text(function(d) { return d.data.category + ": "+d.data.measure.toFixed(2)+"% viajeros"; });	
   d3.selectAll("g.slice").selectAll("path").transition()
	  .duration(750)
	  .delay(10)
	  .attr("d", arcFinal );
   arcs.filter(function(d) { return d.endAngle - d.startAngle > .2; })
	  .append("svg:text")
	  .attr("dy", ".35em")
	  .attr("text-anchor", "middle")
	  .attr("transform", function(d) { return "translate(" + arcFinal.centroid(d) + ")rotate(" + angle(d) + ")"; })
	      .text(function(d) { return d.data.category; });

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
		        .attr("d", arcFinal3);
	}
	function mouseout() {
		 d3.select(this).select("path").transition()
		  .duration(750)
		  .attr("d", arcFinal);
	}
	function up(d, i) {
		updateInfo(d.data.category, color(i));
		updateBarChart(d.data.category, color(i));
		updateLineChart(d.data.category, color(i));
	}
}

function updateInfo(hora, color){
	var viajeros_entresemana, viajeros_findesemana;
	for (x in datasetBarChart) {
		if(datasetBarChart[x].group==hora){
			if(datasetBarChart[x].category=='Entre semana'){
				viajeros_entresemana=datasetBarChart[x].measure;
			}
			if(datasetBarChart[x].category=='Fin de semana'){
				viajeros_findesemana=datasetBarChart[x].measure;
			}
		} 
	}
	var vagones_entresemana=Math.ceil(viajeros_entresemana/130);
	var vagones_findesemana=Math.ceil(viajeros_findesemana/130);

	$("#info_vagones p").html("Esta linea precisa a las "+hora+": <br> &nbsp&nbsp");
	$("#info_vagones p").append(" "+vagones_entresemana+" vagones entre semana <br> &nbsp&nbsp ");
	$("#info_vagones p").append(" "+vagones_findesemana+" vagones fin de semana<br> &nbsp&nbsp ");
	$("#info_vagones p").append(" [ 1 VAGON = 130 pasajeros ]");
	$("#info_vagones p").addClass("info_vagones");
	$("#info_vagones p").addClass("info_vagones");
	$("#info_vagones p").removeClass("pos_info_vagones2");
	$("#info_vagones p").addClass("pos_info_vagones");
}

/*############# BAR CHART ###################
-------------------------------------------*/

// CALCULO DATASET 
var mes_data = GLOBAL_matriz_meses_horas[GLOBAL_mes_seleccionado];																																																																																																																																																																																																																																																																																												
var dia24h_entresemana=new Array(24);
var dia24h_findesemana=new Array(24);
for (var i = 0; i < 24; i++) {
	dia24h_entresemana[i] =[];
	dia24h_findesemana[i] =[];
}
for(var i=0;i<mes_data.length;i++){ //Suma y clasifico por horas
	if(i<=23){
		dia24h_entresemana[i].push(mes_data[i]); //LUNES
	}else{ 
		if(i<=120)dia24h_entresemana[i%24].push(mes_data[i]);//menor de sabado
		else dia24h_findesemana[i%24].push(mes_data[i]);//fin de semana
	}
}
var datasetBarChart= [];
var suma_hora_entresemana=0;
var suma_hora_findesemana=0;
for(var i=0;i<dia24h_entresemana.length;i++) {  // calculo sumas por hora entre semana, mismo tam ambos arr
	  suma_hora_entresemana=0;
	  for(var j=0;j<dia24h_entresemana[i].length;j++){
		  suma_hora_entresemana+=dia24h_entresemana[i][j];
	  }
	  //console.log(" HORA "+i+" entre semana "+suma_hora_entresemana);
	  datasetBarChart.push({ 
	      "group" :   i+"h",
	      "category": "Entre semana",
	      "measure" : suma_hora_entresemana
	  });
	  // FIN DE SEMANA:
	  suma_hora_findesemana=0;
	  for(var j=0;j<dia24h_findesemana[i].length;j++){
		  suma_hora_findesemana+=dia24h_findesemana[i][j];
	  }
	  //console.log(" HORA "+i+" fin de semana "+suma_hora_findesemana);
	  datasetBarChart.push({ 
	      "group" :   i+"h",
	      "category": "Fin de semana",
	      "measure" : suma_hora_findesemana
	  });
}
//  FIN CALCULO DATASET 
var group = "7h";
function datasetBarChosen(group) {
	var ds = [];
	for (x in datasetBarChart) {
		if(datasetBarChart[x].group==group){
			ds.push(datasetBarChart[x]);
		} 
	}
	//console.log(ds);
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

	var svg = d3.select("#barChart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.attr("id","barChartPlot");
	
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
	plot.selectAll("text")
	.data(firstDatasetBarChart)
	.enter()
	.append("text")
	.text(function(d) {
		return formatAsInteger(d3.round(d.measure));
	})
	.attr("text-anchor", "middle")
	.attr("x", function(d, i) {
		return (i * (width / firstDatasetBarChart.length)) + ((width / firstDatasetBarChart.length - barPadding) / 2);
	})
	.attr("y", function(d) {
		return yScale(d.measure) + 14;
	})
	.attr("class", "yAxis");
	var xLabels = svg
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + (margin.top + height)  + ")");
	
	xLabels.selectAll("text.xAxis")
	.data(firstDatasetBarChart)
	.enter()
	.append("text")
	.text(function(d) { return d.category;})
	.attr("text-anchor", "middle")
	.attr("x", function(d, i) {
		return (i * (width / firstDatasetBarChart.length)) + ((width / firstDatasetBarChart.length - barPadding) / 2);
	})
	.attr("y", 15)
	.attr("class", "xAxis");	
	// Title
	svg.append("text")
	.attr("x", (10+ width + margin.left + margin.right)/2 )
	.attr("y", 12)
	.attr("class","ChartTitle")
	.attr("text-anchor", "middle")
	.text(GLOBAL_meses[GLOBAL_mes_seleccionado]+" A LAS "+group );
}

/* ** UPDATE CHART ** */
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
	plot.selectAll("text.yAxis") 
	.data(currentDatasetBarChart)
	.transition().duration(750)
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
	
	svg.selectAll("text.ChartTitle")
	.attr("x", (width + margin.left + margin.right)/2)
	.attr("y", 15)
	.attr("class","ChartTitle")
	.attr("text-anchor", "middle")
	.text(GLOBAL_meses[GLOBAL_mes_seleccionado]+" A LAS "+group );
}

/*
############# LINE CHART ##################
-------------------------------------------
*/
//CALCULO DATASET 
var mes_data = GLOBAL_matriz_meses_horas[GLOBAL_mes_seleccionado];																																																																																																																																																																																																																																																																																												

var datasetLineChart= [];
for(var i=0;i<mes_data.length;i++) {  // un registro por hora/dia, es decir, todo mes_data
	if(i<23){
		datasetLineChart.push({ 
	      "group" :   i+"h",
	      "category": day_labels[0],//Lunes
	      "measure" : mes_data[i]
	  });
    }else{
    	datasetLineChart.push({ 
	      "group" :   i%24+"h",
	      "category": day_labels[Math.floor(i/24)],//El día de la semana
	      "measure" : mes_data[i]
	  });
    }
}
//  FIN CALCULO DATASET 

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
	height = 100 - margin.top - margin.bottom;
	return {
		margin : margin, 
		width : width, 
		height : height
	};
}

function dsLineChart() {
	var firstDatasetLineChart = datasetLineChartChosen(group);  
	var suma=0;
	for (x in firstDatasetLineChart) {
		suma+=firstDatasetLineChart[x].measure;
	}
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
	    .x(function(d, i) { return xScale(i); })
	    .y(function(d) { return yScale(d.measure); });

	var svg = d3.select("#lineChart").append("svg")
	    .datum(firstDatasetLineChart)
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom + 5)
	    
	var plot = svg
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	    .attr("id", "lineChartPlot");

	var dsLength=firstDatasetLineChart.length;

	var svg2 = d3.select("#totalChart").append("svg")
	    .datum(firstDatasetLineChart)
	    .attr("width", "200px")
	    .attr("height", "200px")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	    .append("g").append("text")
	    .text(firstDatasetLineChart[dsLength-1].measure);

	plot.append("text")
	    .text(suma)
	    .attr("id","lineChartTitle2")
	    .attr("class", "ChartTitleBIG")
	    .attr("x",width/2)
	    .attr("y",height/2);
	    
	plot.append("path")
	    .attr("class", "line")
	    .attr("d", line)	
	    .attr("stroke", "lightgrey");

	plot.selectAll(".dot")
	    .data(firstDatasetLineChart)
	    .enter().append("circle")
	    .attr("class", "dot")
	    .attr("fill", function (d) { return d.measure==d3.min(firstDatasetLineChart, function(d) { return d.measure; }) ? "red" : (d.measure==d3.max(firstDatasetLineChart, function(d) { return d.measure; }) ? "green" : "white") } )
	    .attr("cx", line.x())
	    .attr("cy", line.y())
	    .attr("r", 3.5)
	    .attr("stroke", "lightgrey")
	    .append("title")
	    .text(function(d) { return d.category + ": " + formatAsInteger(d.measure)+" pasajeros"; });

	svg.append("text")
	    .text(" SEMANA "+GLOBAL_etiqueta_mes)
	    .attr("id","lineChartTitle1")	
	    .attr("class", "ChartTitle")
	    .attr("x",margin.left + ((width + margin.right)/2)-5)
	    .attr("y", 10);
	}

	/* ** UPDATE CHART ** */
	function updateLineChart(group, colorChosen) {
		var currentDatasetLineChart = datasetLineChartChosen(group); 
		var suma=0;
		for (x in currentDatasetLineChart) {
			suma+=currentDatasetLineChart[x].measure;
		}
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
		var dsLength=currentDatasetLineChart.length;
		plot.select("text")
		.text(suma);

		plot
		.select("path")
		.transition()
		.duration(750)	    
		.attr("class", "line")
		.attr("d", line)
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
	   .attr("stroke", colorChosen);
	   
	   path
	   .selectAll("title")
	   .text(function(d) { return d.category + ": " + formatAsInteger(d.measure)+" pasajeros"; });  

}

var estaciones=getEstaciones();
$("#estado_peticion").html("<font style='color:green;font-weight:500px'>[OK]</font>");
	
function CalculaHeatMap(mes_ind){
       	 /*HeatMapData = {
       		     max: 2,
       		     data: [{lat: 40.480137, lng:-3.666803, count:8},{lat: 40.476813, lng:-3.676371, count:2}]
       	 }*/
		var mes=parseInt(mes_ind)+1;//indice del array de meses, que en el dataset ene=1
		
		var HeatMapData, data=[];
		var lat,lng, count, max=0;
		for(i in GLOBAL_datos_viajeros){//saco suma
			count=0;
			//console.log("Es el mes "+GLOBAL_datos_viajeros[i].mes+" == "+mes+" ?");
			if(GLOBAL_datos_viajeros[i].mes==mes){
				count+=GLOBAL_datos_viajeros[i].suma
				for(j in estaciones){//saco coordenadas
					//console.log("Es el cod "+GLOBAL_datos_viajeros[i].cod_est+" == "+estaciones[j].id+" ?");
					if(GLOBAL_datos_viajeros[i].cod_est==estaciones[j].id){
						lat=estaciones[j].coord_x;
						lng=estaciones[j].coord_y;
						max++;
						break; 
					}
				}
				data.push({ 
				      "lat" :lat,
				      "lng": lng,
				      "count" : parseInt(count)
				});
			}
		}
		//console.log(data);
		HeatMapData={max:max,data:data};
		return HeatMapData;
}
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
      		$("#estado_peticion").append("<font style='color:red;font-weight:500px'>[ERROR.ESTACIONES]</font>");
      	});
       return estaciones;
}
	