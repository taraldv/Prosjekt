<?php 

function databaseKoblingUtenParam($queryString){
	require 'database.php';
	$conn = new mysqli($hn, $un, $pw, $db);
	//Hvis noe galt med connection send tilbake error
	if ($conn->connect_error){
		return $conn->connect_error;
	}
	$conn->set_charset("utf8");
	$result = $conn->query($queryString);
	return $result->fetch_all(MYSQLI_ASSOC);
}

function databaseKobling($queryString,$typeString,$paramArray){
	require 'database.php';
	$conn = new mysqli($hn, $un, $pw, $db);
	//Hvis noe galt med connection send tilbake error
	if ($conn->connect_error){
		return $conn->connect_error;
	}
	$conn->set_charset("utf8");
	$stmt = $conn->prepare($queryString);
	
	/*https://stackoverflow.com/questions/42373433/mysqlis-bind-param-using-an-array
	Ingen lett måte å lage en dynamisk bind param i mysqli. Lettere med PDO, men pensum tar kun mysqli for seg.
	Skjønner ikke hva dette gjør men det funker.*/
	$params = array_merge(array($typeString), $paramArray);
	foreach( $params as $key => $value ) {
		$params[$key] = &$params[$key];
	}
	call_user_func_array(array($stmt, "bind_param"), $params);
	$stmt->execute();

	$result = $stmt->get_result();
	//Hvis noe går galt med query sendes error tilbake
	if ($stmt->error){
		return $stmt->error;
		//Hvis query har et resultat (select) sendes det tilbake
	}elseif ($result) {
		return $result->fetch_all(MYSQLI_ASSOC);
		//Hvis query er insert og tabellen har auto_increment sendes den siste IDen tilbake
	} elseif ($stmt->insert_id) {
		return $stmt->insert_id;
		//Ellers sendes antall rader påvirket
	} else {
		return $stmt->affected_rows;
	}
}
?>