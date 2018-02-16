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
	if (!isset($nyttPassord)) {
		echo password_verify($gammeltPassord, $hash);
	} else if (password_verify($gammeltPassord, $hash)) {
		$query2 = 'UPDATE bruker SET passord = ? WHERE brukernavn= ?';
		echo databaseKobling($query2,'ss',array(password_hash($nyttPassord, PASSWORD_DEFAULT),$brukernavn));
	} 
}
?>