<?php  
require_once 'database.php';
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
	$conn = new mysqli($hn, $un, $pw, $db);
	$conn->set_charset("utf8");
	$stmt = $conn->prepare($query);
	$stmt->bind_param('sssssss', $arkivpakke,$arkivpakke,$arkivpakke,$arkivpakke,$arkivpakke,$arkivpakke,$arkivpakke);
	$stmt->execute();
	$result = $stmt->get_result();
	echo json_encode($result->fetch_all(MYSQLI_ASSOC));
	$stmt->close();
	$conn->close();
}
?>