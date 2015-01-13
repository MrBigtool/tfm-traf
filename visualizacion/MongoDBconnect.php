<?php
    // MONGODB CONNECT:
	//$m = new MongoClient("mongodb://$OPENSHIFT_MONGODB_DB_HOST:$OPENSHIFT_MONGODB_DB_PORT");
	$dburl = $_ENV['OPENSHIFT_MONGODB_DB_URL'];
	$m = new MongoClient($dburl);
	$db = $m->selectDB('tfm');
	$db->authenticate("admin", " My password ");
	/*$info = $db->selectCollection("info");
	$msgs = $info->find();
	foreach ($msgs as $msg) {
		echo "VISITANTES:".$msg['visitantes']."\n";
	}*/
?>
