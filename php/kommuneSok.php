<?php
require_once 'database.php';
$kommune = $_POST['kommune'];
$conn = new mysqli($hn, $un, $pw, $db);
$stmt = $conn->prepare('SELECT COUNT(arkivpakke.arkivskaper) FROM arkivpakke INNER JOIN kommune ON arkivpakke.arkivskaper=kommune.kommuneNr where kommune.kommuneNavn = ?');
$stmt->bind_param('s', $kommune);
$stmt->execute();
$stmt->bind_result($antall);
$stmt->fetch();
$stmt->close();
$conn->close();
echo '{"'.$kommune.'":"'.$antall.'"}';
?>