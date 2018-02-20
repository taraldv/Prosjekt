<?php
session_start();
if (isset($_SESSION['brukernavn'])){
	echo '{"fornavn":"'.$_SESSION['fornavn'].'","etternavn":"'.$_SESSION['etternavn'].'"}';
}
?>