<?php
require_once 'hjelpeFunksjoner.php';
session_start();
if (isset($_SESSION['brukernavn']) && isset($_POST['statusTekst'])) {
	$brukerID = databaseKobling('SELECT brukerID FROM bruker WHERE brukernavn = ?','s',array($_SESSION['brukernavn']));
	$kommuneNr = databaseKobling('SELECT kommuneNr FROM kommune WHERE kommunenavn = ?','s',array($_POST['arkivskaper']));
	$arkivID = $_POST['arkivID'];
	$query = 'UPDATE arkivpakke SET arkivskaper = ?, statusTekst = ?, startDato = ?, sluttDato = ?, sistEndret = CURRENT_TIMESTAMP(), endretAv = ? WHERE arkivID = ?';
	$array = array($kommuneNr[0]['kommuneNr'],$_POST['statusTekst'],$_POST['startDato'],$_POST['sluttDato'],$brukerID[0]['brukerID'],$arkivID);
	$result = databaseKobling($query,'isssii',$array);
	if ($result > 0) {
		$oppdatertQuery = 'SELECT k.kommuneNavn,a.statusTekst,a.startDato,a.sluttDato,a.sistEndret,a.dokfil,a.arkivID,d.filnavn,d.filstørrelse
		FROM arkivpakke a
		INNER join kommune k
		ON a.arkivskaper = k.kommuneNr
		INNER join doklager d
		ON a.dokfil = d.filID
		WHERE arkivID = ?';
		$oppdatertResultat = databaseKobling($oppdatertQuery,'i',array($arkivID));
		echo json_encode($oppdatertResultat);
	} else {
		echo $result;
	}
}
?>