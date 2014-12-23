<?php
    define('__ROOT__', dirname(dirname(__FILE__))); 
    require_once('MongoDBconnect.php');

    if(isset($_POST['lin'])){
    	$linea= strval($_POST['lin']);
    }else if(isset($_GET['lin'])){
    	$linea= strval($_GET['lin']);
    }else{
    	$linea= strval(7);
    }
    //$val2=$_POST['var2'];
    
    header("Content-type: application/json");
    $post_table="datos_viajeros";
    $est_linea = array("linea" => $linea);//(string para posibles injection)
    /*
    $admitidas = array("info","estaciones","conexiones","datos_viajeros");
    if(in_array($post_table,$admitidas)){
		$info = $db->selectCollection($post_table);
		$msgs = $info->find($est_linea);
		// EJEMPLO HORARIOS:  {linea}{estación}{anyo}{mes}{dia}{hora}{suma}		
		echo json_encode(iterator_to_array($msgs),true);//estaciones de una linea
		
		
	}else{
		echo "sin acceso";
	}*/
    $info = $db->selectCollection($post_table);
	$mes=array("mes" => "12");
	$info->remove($mes);
	
	
?>