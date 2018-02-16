<?php  
require_once 'hjelpeFunksjoner.php';
session_start();
if(isset($_SESSION['brukernavn'])){
	$arkivpakkeID = $_POST['arkivpakkeID'];
	$query = 'DELETE FROM arkivpakke WHERE arkivID = ?';
	echo databaseKobling($query,"i",array($arkivpakkeID));
}
?>