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
	</div>
	<footer>
		<a href="example.com">Kontakt oss</a>
		<a href="example.com">CSS Validering</a>
		<a href="example.com">HTML Validering</a>
	</footer>
</body>
</html>