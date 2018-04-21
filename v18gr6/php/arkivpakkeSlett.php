<?php  
require_once 'hjelpeFunksjoner.php';
require_once 'dir.php';
session_start();
if(isset($_SESSION['brukernavn'])){
	$arkivpakkeID = $_POST['arkivpakkeID'];

	$filNavnQuery = 'SELECT d.filID,d.filnavn FROM arkivpakke a INNER JOIN doklager d ON a.dokfil = d.filID WHERE a.arkivID = ?';
	$filResult = databaseKobling($filNavnQuery,'i',array($arkivpakkeID));
	$filId = $filResult[0]['filID'];
	$filnavn = $filResult[0]['filnavn'];
<<<<<<< HEAD:v18gr6/php/arkivpakkeSlett.php
=======
	$dir = '/home/skule/doklager/';
>>>>>>> parent of 7a363b2... endret dir:php/arkivpakkeSlett.php
	$fil = "$dir$filId$filnavn";

	if(file_exists($fil)){
		require 'database.php';
		$conn = new mysqli($hn, $un, $pw, $db);
	//Hvis noe galt med connection send tilbake error
		if ($conn->connect_error){
			return $conn->connect_error;
		}
		$conn->set_charset("utf8");

		//Starter sammensatt transaksjon
		$conn->query("BEGIN");

		$stmt = $conn->prepare("SELECT dokfil INTO @tempFilID FROM arkivpakke WHERE arkivID = ?");
		$stmt->bind_param("i",$arkivpakkeID);
		$stmt->execute();

		//SQL Procedure som sletter arkivpakken og setter inn en siste rad i loggen.
		$stmt = $conn->prepare("CALL slettArkivpakke(?,?,@tempInt)");
		$stmt->bind_param("is",$arkivpakkeID,$_SESSION['brukernavn']);
		$stmt->execute();

		$result = $conn->query("SELECT @tempInt AS rader");
		$antallRader = $result->fetch_all(MYSQLI_ASSOC);
		$raderEndret = (int)$antallRader[0]['rader'];

		$conn->query("DELETE FROM doklager WHERE filID = @tempFilID");
		$raderEndret += $conn->affected_rows;

		//Hvis 3 rader har blitt endret og fil slettet ferdigjøres transaksjon
		if($raderEndret == 3 && unlink($fil)){
			$conn->query("COMMIT");
			echo 1;
		//Ellers glemmes endringene
		} else {
			$conn->query("ROLLBACK");
			echo "SQL error, arkivpakke ble ikke slettet";
		}
	} else {
		echo "Fil ble ikke funnet";
	}
}
?>