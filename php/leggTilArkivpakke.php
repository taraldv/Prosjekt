<?php
require_once 'hjelpeFunksjoner.php';
session_start();
if (isset($_SESSION['brukernavn']) && $_POST['statustype']){
	$result = databaseKoblingUtenParam('select * from statustype');
	echo json_encode($result);
} elseif (isset($_SESSION['brukernavn']) && $_POST['validering']) {
	$query = 'select 1 from kommune where kommuneNavn = ?';
	$result = databaseKobling($query,'s',array($_POST['kommune']));
	echo json_encode($result);
} elseif (isset($_SESSION['brukernavn'])) {
	$brukernavn = $_SESSION['brukernavn'];
	$arkivskaper = $_POST['kommune'];
	$statusTekst = $_POST['statusTekst'];
	$startDato = $_POST['startDato'];
	$sluttDato = $_POST['sluttDato'];
	//$fil = $_POST['fil'];
	var_dump($_FILES['fil']);
}
?>