<?php 
require_once 'hjelpeFunksjoner.php';
session_start();
if(isset($_SESSION['brukernavn'])){
	$brukernavn = $_SESSION['brukernavn'];
	$gammeltPassord = $_POST['gammeltPassord'];
	$query = 'SELECT passord,fornavn,etternavn FROM bruker WHERE brukernavn= ?';
	$result = databaseKobling($query,'s',array($brukernavn));
	$hash = $result[0]['passord'];
	$boolean = password_verify($gammeltPassord, $hash);
	//Sjekker om nyttPassord ble sendt som parameter i POST
	if (!isset($_POST['nyttPassord'])) {
		//Sjekker om gammelt passord fra POST er korrekt
		echo $boolean;
	} else if ($boolean && isset($_POST['nyttPassord'])) {
		$nyttPassord = $_POST['nyttPassord'];
		//Oppdaterer databasen med nytt passord, hvis det gamle er korrekt.
		$query2 = 'UPDATE bruker SET passord = ? WHERE brukernavn= ?';
		echo databaseKobling($query2,'ss',array(password_hash($nyttPassord, PASSWORD_DEFAULT),$brukernavn));
	} 
}
?>