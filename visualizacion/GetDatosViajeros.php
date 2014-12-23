<?php
define('__ROOT__', dirname(dirname(__FILE__)));
require_once('MongoDBconnect.php');
header("Content-type: application/json");

if(isset($_POST['lin'])){
	$linea= strval($_POST['lin']);
	if(isset($_POST['mes']))$mes=$_POST['mes'];
	if(isset($_POST['anyo']))$mes=$_POST['anyo'];
}else if(isset($_GET['lin'])){
	$linea= strval($_GET['lin']);
	if(isset($_GET['mes']))$mes=$_GET['mes'];
	if(isset($_GET['anyo']))$mes=$_GET['anyo'];
}

$est_linea = array("linea" => $linea);
if(isset($linea) && isset($mes))
	$est_linea = array("linea" => $linea, "mes"=> $mes);
if(isset($linea) && isset($mes) && isset($anyo))
	$est_linea = array("linea" => $linea, "mes"=> $mes, "anyo"=> $anyo);

//echo 'Viajeros...'."<br>";
$info = $db->selectCollection("datos_viajeros");
$msgs = $info->find($est_linea);
echo json_encode(iterator_to_array($msgs),true);
?>