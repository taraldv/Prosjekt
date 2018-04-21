<?php  
require_once 'hjelpeFunksjoner.php';
require_once 'dir.php';
session_start();
if(isset($_SESSION['brukernavn'])&&isset($_GET['arkivID'])){
	$query = 'SELECT d.filID,d.filnavn FROM arkivpakke a INNER JOIN doklager d ON a.dokfil = d.filID WHERE a.arkivID = ?';
	$int = (int)$_GET['arkivID'];
	$result = databaseKobling($query,'i',array($int));
	$filId = $result[0]['filID'];
	$filnavn = $result[0]['filnavn'];
<<<<<<< HEAD:v18gr6/php/hentFil.php
=======
	$dir = '/home/skule/doklager/';
>>>>>>> parent of 7a363b2... endret dir:php/hentFil.php
	$file = "$dir$filId$filnavn";
	if (file_exists($file)) {
		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename='.$filnavn);
		header('Content-Length: ' . filesize($file));
		readfile($file);
	} else {
		echo "fant ikke fil";
	}
}
?>