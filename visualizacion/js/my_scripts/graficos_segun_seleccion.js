function grafico_linea(linea){
	$("#estado_peticion").html('<font style="color:green;font-weight:500px;"> [PROCESANDO...]</font><img src="images/loading.gif" height="42" width="42">');
	$("#module-right-content").html("");//ahora lo recargo todo!
	$("#linea_seleccionada").val(linea);
    $.getScript("js/my_scripts/passengers_hours.js");
    $("#btab_sub1").show();
}

