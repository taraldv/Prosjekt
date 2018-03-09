<?php
require_once 'hjelpeFunksjoner.php';
session_start();
if (isset($_SESSION['brukernavn']) && isset($_POST['validering'])) {

	//gjør om til prosedyre
	$query = 'SELECT 1 FROM bruker WHERE brukernavn = ?';
	$result = databaseKobling($query,'s',array($_POST['ansvarlig']));
	echo json_encode($result);
} elseif (isset($_SESSION['brukernavn'])) {
	$arkivID = $_POST['arkivID'];
	$ansvarligID = databaseKobling('SELECT brukerID FROM bruker WHERE brukernavn = ?','s',array($_POST['ansvarlig']));
	$brukerID = databaseKobling('SELECT brukerID FROM bruker WHERE brukernavn = ?','s',array($_SESSION['brukernavn']));
	$statusTekst = $_POST['statusTekst'];
	//$startDato = $_POST['startDato'];
	//$kommuneID = databaseKobling('SELECT kommuneNr FROM kommune WHERE kommunenavn = ?','s',array($_POST['kommune']));
	$sluttDato = $_POST['sluttDato'];
	$arkivpakkeQuery;
	$array;
	$type;
	if ($_FILES) {
		$filnavn = $_FILES['fil']['name'];
		$filstr = $_FILES['fil']['size']/1000;
		$doklagerQuery = 'INSERT INTO doklager(filnavn,filstørrelse) VALUES(?,?)';
		$dokID = databaseKobling($doklagerQuery,'sd',array($filnavn,$filstr));
		$unikFilnavn = "$dokID.$filnavn";
		$dir = '/home/skule/doklager/';
		if (!move_uploaded_file($_FILES['fil']['tmp_name'],"$dir$unikFilnavn")) {
			die("Noe gikk galt med filopplastning, endring avbrutt");
		} else {
			$arkivpakkeQuery = 'UPDATE arkivpakke SET ansvarlig = ?, statusTekst = ?, sluttDato = ?, sistEndret = CURRENT_TIMESTAMP(), endretAv = ?, dokfil = ? WHERE arkivID = ?';
			$array = array($ansvarligID[0]['brukerID'],$statusTekst,$sluttDato,$brukerID[0]['brukerID'],$dokID,$arkivID);
			$type = 'issiii';
		}
	} else {
		$arkivpakkeQuery = 'UPDATE arkivpakke SET ansvarlig = ?, statusTekst = ?, sluttDato = ?, sistEndret = CURRENT_TIMESTAMP(), endretAv = ? WHERE arkivID = ?';
		$array = array($ansvarligID[0]['brukerID'],$statusTekst,$sluttDato,$brukerID[0]['brukerID'],$arkivID);
		$type = 'issii';
	}
	$result = databaseKobling($arkivpakkeQuery,$type,$array);
	if ($result > 0) {
		$oppdatertQuery = 'SELECT k.kommuneNavn,b.brukerNavn,a.statusTekst,a.startDato,a.sluttDato,a.sistEndret,a.dokfil,a.arkivID
		FROM arkivpakke a
		INNER JOIN bruker b
		ON a.ansvarlig = b.brukerID
		INNER join kommune k
		ON a.arkivskaper = k.kommuneNr
		WHERE a.arkivID = ?';
		$oppdatertResultat = databaseKobling($oppdatertQuery,'i',array($arkivID));
		echo json_encode($oppdatertResultat);
	} else {
		echo 0;
	}
}
?>