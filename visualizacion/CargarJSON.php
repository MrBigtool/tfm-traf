<?php
define('__ROOT__', dirname(dirname(__FILE__)));
require_once('MongoDBconnect.php');

$nom_collection="datos_viajeros";
$collection = $db->createCollection($nom_collection);


$string = file_get_contents("---.json");
$json_a=json_decode($string);
echo "Cargando DATOS ...<br>";
$count=0;
foreach($json_a as $row){

	if($row->hora=="1" || $row->hora=="2" || $row->hora=="3" || $row->hora=="4" || $row->hora=="5" || $row->hora=="6"){
		$count++;
	}else{
		echo " -- ".$row->cod_est."  ".$row->dia_sem." ".$row->hora." = ".$row->suma;
		$elem = array(
				'linea' => "".$row->linea,
				'cod_est' => "".$row->cod_est,
				'dia_sem' => "".$row->dia_sem,
				'mes'=> "".$row->mes,
				'anyo'=> "".$row->anyo,
				'hora' => "".$row->hora,
				'suma' => "".$row->suma
		);
		$collection->insert( $elem );
		echo "<br>";
	}
}

?>