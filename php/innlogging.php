<?php  
require_once 'hjelpeFunksjoner.php';
$brukernavn = $_POST['brukernavn'];
$passord = $_POST['passord'];
$query = 'SELECT * FROM bruker WHERE brukernavn= ?';
$param = array($brukernavn);
$result = databaseKobling($query,'s',$param);
$hash = $result[0]['passord'];

if (password_verify($passord, $hash)) {
	session_start();
	$_SESSION['brukernavn'] = $brukernavn;
	$_SESSION['fornavn'] = $result[0]['fornavn'];
	$_SESSION['etternavn'] = $result[0]['etternavn'];
	header('Location: ../');
}elseif (count($_POST)>0) {
	echo "feil passord eller brukernavn";
} 
?>