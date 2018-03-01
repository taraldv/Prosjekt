<?php  
require_once 'hjelpeFunksjoner.php';
session_start();
if(isset($_SESSION['brukernavn'])){
	$query = 'SELECT k.kommuneNavn AS "arkivskaper",
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
		WHERE l.arkivID = ?';
	$result = databaseKobling($query,'i',array($_POST['arkivID']));
	echo json_encode($result);
}
?>