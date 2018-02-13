<?php  
require_once 'database.php';

$brukernavn = $_POST['brukernavn'];
$passord = $_POST['passord'];
$hash = getHash($brukernavn,$hn, $un, $pw, $db);
if (password_verify($passord, $hash)) {
	session_start();
	$_SESSION['brukernavn'] = $brukernavn;
	header('Location: ../index.html');
}else {
	header('Location: ../index.html?error');
}

function getHash($brukernavn,$hn, $un, $pw, $db){
	$conn = new mysqli($hn, $un, $pw, $db);
	if ($conn->connect_error) die($conn->connect_error);
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