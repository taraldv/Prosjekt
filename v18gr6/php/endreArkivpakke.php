<?php
require_once 'hjelpeFunksjoner.php';
session_start();

//Oppdaterer en arkivpakke
if (isset($_SESSION['brukernavn']) && isset($_POST['statusTekst'])) {
	//Henter brukerID og kommuneNr fra database med brukernavn og kommunenavn.
	$brukerID = databaseKobling('SELECT brukerID FROM bruker WHERE brukernavn = ?','s',array($_SESSION['brukernavn']));
	$kommuneNr = databaseKobling('SELECT kommuneNr FROM kommune WHERE kommunenavn = ?','s',array($_POST['arkivskaper']));
	$arkivID = $_POST['arkivID'];

	//Oppdaterer alle kolonner, men ikke alle som får ny verdi.
	$query = 'UPDATE arkivpakke SET arkivskaper = ?, statusTekst = ?, startDato = ?, sluttDato = ?, sistEndret = CURRENT_TIMESTAMP(), endretAv = ? WHERE arkivID = ?';
	$array = array($kommuneNr[0]['kommuneNr'],$_POST['statusTekst'],$_POST['startDato'],$_POST['sluttDato'],$brukerID[0]['brukerID'],$arkivID);

	//Siden det er en oppdatering så returnerer databaseKobling med antall rader som ble endret
	$result = databaseKobling($query,'isssii',$array);

	//Hvis antall rader som ble endret er større enn 0 så hentes den oppdaterte arkivpakken, ellers hentes sql feilbeskjeden.
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