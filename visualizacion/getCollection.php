<?php
define('__ROOT__', dirname(dirname(__FILE__)));
require_once('MongoDBconnect.php');
//para uso de ajax:
header("Content-type: application/json");
$post_table=$_POST['collection'];

$admitidas = array("info", "estaciones", "conexiones");
if(in_array($post_table,$admitidas)){
	$table = $db->selectCollection($post_table);
	$rows = $table->find();
	echo json_encode(iterator_to_array($rows),true);
}else{
	echo "sin acceso.";
}
?>