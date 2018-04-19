<?php
require_once 'hjelpeFunksjoner.php';
session_start();

//Sender tilbake statustyper fra database hvis POST inneholder statustype param.
if (isset($_SESSION['brukernavn']) && isset($_POST['statustype'])){
	$result = databaseKoblingUtenParam('SELECT * FROM statustype');
	echo json_encode($result);

//Sjekker om en kommune eksisterer hvis POST inneholder validering param.
//Sender tilbake TRUE(1 i php) hvis valgt kommune fra POST eksisterer.
} elseif (isset($_SESSION['brukernavn']) && isset($_POST['validering'])) {
	$query = 'SELECT kommuneEksisterer(?) AS validering;';
	$result = databaseKobling($query,'s',array($_POST['kommune']));
	echo json_encode($result[0]);

//Hvis $_FILES eksisterer settes det inn en ny arkivpakke og lastes opp valgt fil.
} elseif (isset($_SESSION['brukernavn'])&&$_FILES) {
	$filnavn = $_FILES['fil']['name'];
	$filstr = $_FILES['fil']['size']/1000;
	$kommuneID = databaseKobling('SELECT kommuneNr FROM kommune WHERE kommunenavn = ?','s',array($_POST['kommune']));
	$brukerID = databaseKobling('SELECT brukerID FROM bruker WHERE brukernavn = ?','s',array($_SESSION['brukernavn']));
	$statusTekst = $_POST['statusTekst'];
	$startDato = $_POST['startDato'];
	$sluttDato = $_POST['sluttDato'];
	$arkivpakkeQuery = 'SELECT nyArkivpakke(?,?,?,?,?,?,?) AS filID';
	$array = array($filnavn,$filstr,$kommuneID[0]['kommuneNr'],$statusTekst,$startDato,$sluttDato,$brukerID[0]['brukerID']);
	$filIDResultat = databaseKobling($arkivpakkeQuery,'sdisssi',$array);
	$dir = '~/doklager/';
	$filID = $filIDResultat[0]['filID'];
	move_uploaded_file($_FILES['fil']['tmp_name'],"$dir$filID$filnavn");
	echo "<p id='arkivpakkeOpprettet'>Arkivpakke opprettet</p>";
}
?>