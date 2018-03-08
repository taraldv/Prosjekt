<?php  
require_once 'hjelpeFunksjoner.php';
session_start();
if(isset($_SESSION['brukernavn'])){
	$arkivpakkeID = $_POST['arkivpakkeID'];

	$filNavnQuery = 'SELECT d.filID,d.filnavn FROM arkivpakke a INNER JOIN doklager d ON a.dokfil = d.filID WHERE a.arkivID = ?';
	$filResult = databaseKobling($filNavnQuery,'i',array($arkivpakkeID));
	$filId = $filResult[0]['filID'];
	$filnavn = $filResult[0]['filnavn'];
	$dir = '/home/skule/doklager/';
	$file = "$dir$filId$filnavn";
	$query = 'DELETE FROM arkivpakke WHERE arkivID = ?';

	if(unlink($file)){
		echo databaseKobling($query,'i',array($arkivpakkeID));
	} else {
		echo 0;
	}
}
?>