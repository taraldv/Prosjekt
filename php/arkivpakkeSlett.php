<?php  
require_once 'hjelpeFunksjoner.php';
session_start();
if(isset($_SESSION['brukernavn'])){
	$arkivpakkeID = $_POST['arkivpakkeID'];

	$filNavnQuery = 'SELECT d.filID,d.filnavn FROM arkivpakke a INNER JOIN doklager d ON a.dokfil = d.filID WHERE a.arkivID = ?';
	$filResult = databaseKobling($filNavnQuery,'i',array($arkivpakkeID));
	$filId = $filResult[0]['filID'];
	$filnavn = $filResult[0]['filnavn'];
	$dir = '/home/skule/doklager/';
	$file = "$dir$filId$filnavn";

	if(unlink($file)){
		echo sammensattTransaksjon($arkivpakkeID);
	} else {
		echo 0;
	}
}

function sammensattTransaksjon($id){
	require 'database.php';
	$conn = new mysqli($hn, $un, $pw, $db);
	//Hvis noe galt med connection send tilbake error
	if ($conn->connect_error){
		return $conn->connect_error;
	}
	$conn->set_charset("utf8");
	$conn->query("BEGIN");

	$stmt = $conn->prepare("SELECT dokfil INTO @tempFilID FROM arkivpakke WHERE arkivID = ?");
	$stmt->bind_param("i",$id);
	$stmt->execute();

	$stmt = $conn->prepare("CALL slettArkivpakke(?,?,@tempInt)");
	$stmt->bind_param("is",$id,$_SESSION['brukernavn']);
	$stmt->execute();

	$result = $conn->query("SELECT @tempInt AS rader");
	$antallRader = $result->fetch_all(MYSQLI_ASSOC);
	$raderEndret = (int)$antallRader[0]['rader'];

	$conn->query("DELETE FROM doklager WHERE filID = @tempFilID");
	$raderEndret += $conn->affected_rows;

	//Hvis begge radene har blitt slettet utføres transaksjonen
	if($raderEndret == 3){
		$conn->query("COMMIT");
		return $raderEndret;
	//Ellers glemmes endringene
	} else {
		$conn->query("ROLLBACK");
		return 0;
	}
}
?>