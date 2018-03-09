<?php  
require_once 'hjelpeFunksjoner.php';
session_start();
if(isset($_SESSION['brukernavn'])&&isset($_POST['antall'])){
	$antall = $_POST['antall'];
	$query = 'SELECT k.kommuneNavn,a.statusTekst,a.startDato,a.sluttDato,a.sistEndret,a.dokfil,a.arkivID
	FROM arkivpakke a
	INNER join kommune k
	ON a.arkivskaper = k.kommuneNr
	ORDER BY a.sluttDato DESC
	LIMIT ?';
	$result = databaseKobling($query,'i',array($antall));
	echo json_encode($result);
} elseif (isset($_SESSION['brukernavn'])&&isset($_POST['slettet'])) {
	$slettetQuery = 'SELECT k.kommuneNavn AS "arkivskaper",
	l.statusTekst,l.startDato,l.sluttDato,l.sistEndret,
	b.brukerNavn AS "endretAv",
	l.arkivID,l.slettet
		FROM logg l
		INNER join kommune k
		ON l.arkivskaper = k.kommuneNr
		INNER JOIN bruker b
		ON l.endretAv = b.brukerID
		WHERE l.slettet = true';
	$slettetResult = databaseKoblingUtenParam($slettetQuery);
	echo json_encode($slettetResult);
}
?>