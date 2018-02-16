<?php  
require_once 'hjelpeFunksjoner.php';
session_start();
if(isset($_SESSION['brukernavn'])){
	$antall = $_POST['antall'];
	$query = 'SELECT k.kommuneNavn,b.brukerNavn,a.statusTekst,a.startDato,a.sluttDato,a.sistEndret,a.dokfil,a.arkivID
	FROM arkivpakke a
	INNER JOIN bruker b
	ON a.ansvarlig = b.brukerID
	INNER join kommune k
	ON a.arkivskaper = k.kommuneNr
	ORDER BY a.sluttDato DESC
	LIMIT ?';
	$result = databaseKobling($query,'i',array($antall));
	echo json_encode($result);
}
?>