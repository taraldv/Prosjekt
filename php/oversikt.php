<?php  
require_once 'hjelpeFunksjoner.php';
session_start();
if(isset($_SESSION['brukernavn'])&&isset($_POST['antall'])){
	$antall = $_POST['antall'];
	$query = 'SELECT k.kommuneNavn,a.statusTekst,a.startDato,a.sluttDato,a.sistEndret,a.arkivID,d.filnavn,d.filstørrelse
	FROM arkivpakke a
	INNER join kommune k
	ON a.arkivskaper = k.kommuneNr
	INNER join doklager d
	ON a.dokfil = d.filID
	ORDER BY a.sluttDato DESC
	LIMIT ?';
	$result = databaseKobling($query,'i',array($antall));
	echo json_encode($result);
} elseif (isset($_SESSION['brukernavn'])&&isset($_POST['slettet'])) {
	$slettetQuery = 'SELECT arkivID FROM logg WHERE slettet = true';
	echo json_encode(databaseKoblingUtenParam($slettetQuery));
}
?>