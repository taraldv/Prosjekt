<?php  
require_once 'hjelpeFunksjoner.php';
session_start();
if(isset($_SESSION['brukernavn'])&&isset($_POST['antall'])){
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
} elseif (isset($_SESSION['brukernavn'])&&isset($_POST['slettet'])) {
	$slettetQuery = 'SELECT k.kommuneNavn AS "arkivskaper",
	b.brukerNavn AS "ansvarlig",
	l.statusTekst,l.startDato,l.sluttDato,l.sistEndret,
	b2.brukerNavn AS "endretAv",
	l.dokfil,l.arkivID,l.slettet
		FROM logg l
		INNER join kommune k
		ON l.arkivskaper = k.kommuneNr
		INNER JOIN bruker b
		ON l.ansvarlig = b.brukerID
		RIGHT JOIN bruker b2
		ON l.endretAv = b2.brukerID
		WHERE l.slettet = true';
	$slettetResult = databaseKoblingUtenParam($slettetQuery);
	echo json_encode($slettetResult);
}
?>