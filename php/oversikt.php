<?php  
require_once 'database.php';
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
	$conn = new mysqli($hn, $un, $pw, $db);
	$conn->set_charset("utf8");
	$stmt = $conn->prepare($query);
	$stmt->bind_param('i', $antall);
	$stmt->execute();
	$result = $stmt->get_result();
	echo json_encode($result->fetch_all(MYSQLI_ASSOC));
	$stmt->close();
	$conn->close();
}
?>