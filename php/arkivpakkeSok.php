<?php  
require_once 'hjelpeFunksjoner.php';
session_start();
if(isset($_SESSION['brukernavn'])){
	$query = 'SELECT k.kommuneNavn,b.brukerNavn,a.statusTekst,a.startDato,a.sluttDato,a.sistEndret,a.dokfil,a.arkivID
	FROM arkivpakke a
	INNER JOIN bruker b
	ON a.ansvarlig = b.brukerID
	INNER join kommune k
	ON a.arkivskaper = k.kommuneNr
	WHERE k.kommuneNavn LIKE ?
	OR b.brukernavn LIKE ?
	OR a.statusTekst LIKE ?
	OR a.startDato LIKE ?
	OR a.sluttDato LIKE ?
	OR a.sistEndret LIKE ?
	OR a.dokfil LIKE ?
	ORDER BY a.sluttDato DESC';
	$arkivpakke = '%'.$_POST['arkivpakke'].'%';
	$param = array($arkivpakke,$arkivpakke,$arkivpakke,$arkivpakke,$arkivpakke,$arkivpakke,$arkivpakke);
	$result = databaseKobling($query,'sssssss',$param);
	echo json_encode($result);
}
?>