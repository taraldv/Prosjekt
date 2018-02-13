<?php 
require_once 'database.php';
session_start();
if(isset($_SESSION['brukernavn'])){
	$brukernavn = $_SESSION['brukernavn'];
	$gammeltPassord = $_POST['gammeltPassord'];
	$nyttPassord = $_POST['nyttPassord'];
	$hash = hentHash($brukernavn,$hn, $un, $pw, $db);
	if (!isset($nyttPassord)) {
		echo password_verify($gammeltPassord, $hash);
	} else if (password_verify($gammeltPassord, $hash)) {
		$conn = new mysqli($hn, $un, $pw, $db);
		$stmt = $conn->prepare('UPDATE bruker SET passord = ? WHERE brukernavn= ?');
		$stmt->bind_param('ss', password_hash($nyttPassord, PASSWORD_DEFAULT),$brukernavn);
		$stmt->execute();
		echo($stmt->affected_rows);
		$stmt->close();
		$conn->close();
	} 
}


function hentHash($brukernavn,$hn, $un, $pw, $db){
	$conn = new mysqli($hn, $un, $pw, $db);
	$stmt = $conn->prepare('SELECT passord FROM bruker WHERE brukernavn= ?');
	$stmt->bind_param('s', $brukernavn);
	$stmt->execute();
	$stmt->bind_result($hash);
	$stmt->fetch();
	$stmt->close();
	$conn->close();
	return $hash;
}

?>