<?php  
require_once 'database.php';
session_start();
if(isset($_SESSION['brukernavn'])){
	$arkivpakkeID = $_POST['arkivpakkeID'];
	$conn = new mysqli($hn, $un, $pw, $db);
	if ($conn->connect_error) die($conn->connect_error);
	$stmt = $conn->prepare('DELETE FROM arkivpakke WHERE arkivID = ?');
	$stmt->bind_param('i', $arkivpakkeID);
	$stmt->execute();
	echo($stmt->affected_rows);
	$stmt->close();
	$conn->close();
}
?>