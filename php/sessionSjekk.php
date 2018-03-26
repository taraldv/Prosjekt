<?php
session_start();
if (isset($_SESSION['brukernavn'])){
	$navigering = "<div id='loginLeft'>"
		."<button id='arkivpakkeSøkNavigering' class='btn btn-default'><span class='glyphicon glyphicon-search'></span>Arkivpakker</button>"
		."<button id='leggTilArkivpakkeNavigering' class='btn btn-default'><span class='glyphicon glyphicon-plus'></span>Legg til ny arkivpakke</button>"
	."</div>"
	."<div id='loginRight'>"
		."<p id='brukeren'><span class='glyphicon glyphicon-user'></span>".ucfirst($_SESSION['fornavn'])." ".ucfirst($_SESSION['etternavn'])."</p>"
		."<button id='endrePassordButton' type='button' class='btn btn-default'><span class='glyphicon glyphicon-pencil'></span>Endre passord</button>"
		."<form action='php/utlogging.php' method='POST'>"
			."<button id='loggUt' type='submit' class='btn btn-default'><span class='glyphicon glyphicon-log-out'></span>Logg ut</button>"
		."</form>"
	."</div>";
	echo $navigering;
} else {
	$innlogging = "<div id='loginLeft'></div>"
	."<div id='loginRight'>"
		."<form method='POST' id='innlogging'>"
			."<input id='brukernavn' type='text' name='brukernavn' placeholder='Brukernavn' required>"
			."<input id='passord' type='password' name='passord' placeholder='Passord' required>"
			."<button type='submit' class='btn btn-default'><span class='glyphicon glyphicon-log-in'></span>Logg inn</button>"
		."</form>"
	."</div>";
	echo $innlogging;
}
?>