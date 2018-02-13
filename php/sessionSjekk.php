<?php
session_start();
if (isset($_SESSION['brukernavn'])){
	echo '{"brukernavn":"'.$_SESSION['brukernavn'].'"}';
}
?>