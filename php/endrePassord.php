<?php 
require_once 'hjelpeFunksjoner.php';
session_start();
if(isset($_SESSION['brukernavn'])){
	$brukernavn = $_SESSION['brukernavn'];
	$gammeltPassord = $_POST['gammeltPassord'];
	$nyttPassord = $_POST['nyttPassord'];
	$query = 'SELECT passord,fornavn,etternavn FROM bruker WHERE brukernavn= ?';
	$result = databaseKobling($query,'s',array($brukernavn));
	$hash = $result[0]['passord'];
	$boolean = password_verify($gammeltPassord, $hash);
	//Sjekker om nyttPassord ble sendt som paramter i POST
	if (!isset($nyttPassord)) {
		//Sjekker om gammelt passord fra POST er korrekt
		echo $boolean;
	} else if ($boolean) {
		//Oppdaterer 
		$query2 = 'UPDATE bruker SET passord = ? WHERE brukernavn= ?';
		echo databaseKobling($query2,'ss',array(password_hash($nyttPassord, PASSWORD_DEFAULT),$brukernavn));
	} 
}
?>