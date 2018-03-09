<?php  
require_once 'hjelpeFunksjoner.php';
session_start();
if(isset($_SESSION['brukernavn'])){
	$query = 'SELECT k.kommuneNavn AS "arkivskaper",
	l.statusTekst,l.startDato,l.sluttDato,l.sistEndret,
	b.brukerNavn AS "endretAv",l.arkivID,l.slettet
		FROM logg l
		INNER join kommune k
		ON l.arkivskaper = k.kommuneNr
		RIGHT JOIN bruker b
		ON l.endretAv = b.brukerID
		WHERE l.arkivID = ?';
	$result = databaseKobling($query,'i',array($_POST['arkivID']));
	echo json_encode($result);
}
?>