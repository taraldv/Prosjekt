<?php
require_once 'hjelpeFunksjoner.php';
session_start();
if (isset($_SESSION['brukernavn']) && isset($_POST['statustype'])){
	$result = databaseKoblingUtenParam('SELECT * FROM statustype');
	echo json_encode($result);
} elseif (isset($_SESSION['brukernavn']) && isset($_POST['validering'])) {
	//$query = 'SELECT 1 FROM kommune WHERE kommunenavn = ?';
	$query = 'SELECT kommuneEksisterer(?) AS validering;';
	$result = databaseKobling($query,'s',array($_POST['kommune']));
	echo json_encode($result[0]);
} elseif (isset($_SESSION['brukernavn'])&&$_FILES) {
	$filnavn = $_FILES['fil']['name'];
	$filstr = $_FILES['fil']['size']/1000;
	$doklagerQuery = 'INSERT INTO doklager(filnavn,filstørrelse) VALUES(?,?)';
	$dokID = databaseKobling($doklagerQuery,'sd',array($filnavn,$filstr));
	$unikFilnavn = "$dokID.$filnavn";
	$dir = '/home/skule/doklager/';
	if ($dokID && move_uploaded_file($_FILES['fil']['tmp_name'],"$dir$unikFilnavn")) {
		$kommuneID = databaseKobling('SELECT kommuneNr FROM kommune WHERE kommunenavn = ?','s',array($_POST['kommune']));
		$brukerID = databaseKobling('SELECT brukerID FROM bruker WHERE brukernavn = ?','s',array($_SESSION['brukernavn']));
		$statusTekst = $_POST['statusTekst'];
		$startDato = $_POST['startDato'];
		$sluttDato = $_POST['sluttDato'];
		$arkivpakkeQuery = 'INSERT INTO arkivpakke(arkivskaper,ansvarlig,statusTekst,startDato,sluttDato,sistEndret,endretAv,dokfil) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP(),?,?)';
		$array = array($kommuneID[0]['kommuneNr'],$brukerID[0]['brukerID'],$statusTekst,$startDato,$sluttDato,$brukerID[0]['brukerID'],$dokID);
		$result = databaseKobling($arkivpakkeQuery,'iisssii',$array);
		echo json_encode($result);
	}
}
?>