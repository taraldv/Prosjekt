<?php  
require_once 'hjelpeFunksjoner.php';
$brukernavn = $_POST['brukernavn'];
$passord = $_POST['passord'];
$query = 'SELECT passord,fornavn,etternavn FROM bruker WHERE brukernavn= ?';
$param = array($brukernavn);
$result = databaseKobling($query,'s',$param);
$hash = $result[0]['passord'];
$fornavn = $result[0]['fornavn'];
$etternavn = $result[0]['etternavn'];
if (password_verify($passord, $hash)) {
	session_start();
	$_SESSION['brukernavn'] = $brukernavn;
	$_SESSION['fornavn'] = $fornavn;
	$_SESSION['etternavn'] = $etternavn;
	header('Location: ../index.html');
}else {
	header('Location: ../index.html?error');
}
?>