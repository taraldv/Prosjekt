<?php
require_once 'hjelpeFunksjoner.php';
$kommune = $_POST['kommune'];
$query = 'SELECT COUNT(arkivpakke.arkivskaper) AS antall FROM arkivpakke INNER JOIN kommune ON arkivpakke.arkivskaper=kommune.kommuneNr where kommune.kommunenavn = ?';
$result = databaseKobling($query,'s',array($kommune));
$antall = $result[0]['antall'];
echo '{"'.$kommune.'":"'.$antall.'"}';
?>