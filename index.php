<!DOCTYPE html>
<html>
<head>
	<title>Prosessverktøy</title>
	<meta name="viewport" content="width=device-width">
	<meta charset="utf-8">
	<link rel="stylesheet" type="text/css" href="bootstrap-3.3.7-dist/css/bootstrap.min.css">
	<link rel="stylesheet" type="text/css" href="main.css">
	<script src="jquery/jquery-3.3.1.min.js"></script>
	<script src="bootstrap-3.3.7-dist/js/bootstrap.min.js"></script>
	<script src="javascript.js"></script>
</head>
<body>
	<header>
		<p>Prosessverktøy</p>
	</header>
	<div id='innhold'>
		<div id='login'>
			<?php
			require_once 'php/sessionSjekk.php';
			require_once 'php/innlogging.php';
			?>
		</div>
		<?php
		require_once 'php/leggTilArkivpakke.php';
		?>
	</div>
	<footer>
		<a href="example.com">Kontakt oss</a>
		<a href="https://jigsaw.w3.org/css-validator/validator?uri=https%3A%2F%2Fskule.tarves.no%2Fmain.css&profile=css3svg&usermedium=all&warning=1&vextwarning=&lang=en">CSS Validering</a>
		<a href="https://validator.w3.org/nu/?doc=https%3A%2F%2Fskule.tarves.no%2Findex.php">HTML Validering</a>
	</footer>
</body>
</html>