<?php  
require_once 'hjelpeFunksjoner.php';
session_start();
if(isset($_SESSION['brukernavn'])){
	$query = 'SELECT k.kommuneNavn,a.statusTekst,a.startDato,a.sluttDato,a.sistEndret,a.arkivID,d.filnavn,d.filstørrelse
	FROM arkivpakke a
	INNER join kommune k
	ON a.arkivskaper = k.kommuneNr
	INNER join doklager d
	ON a.dokfil = d.filID
	WHERE k.kommuneNavn LIKE ?
	OR a.statusTekst LIKE ?
	OR a.startDato LIKE ?
	OR a.sluttDato LIKE ?
	OR a.sistEndret LIKE ?
	OR d.filnavn LIKE ?
	ORDER BY a.sluttDato DESC';
	$arkivpakke = '%'.$_POST['arkivpakke'].'%';
	$param = array($arkivpakke,$arkivpakke,$arkivpakke,$arkivpakke,$arkivpakke,$arkivpakke);
	$result = databaseKobling($query,'ssssss',$param);
	echo json_encode($result);
}
?>