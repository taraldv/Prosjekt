<?php  
function databaseKobling($queryString,$typeString,$paramArray){
	require_once 'database.php';
	$conn = new mysqli($hn, $un, $pw, $db);
	if ($conn->connect_error) die($conn->connect_error);
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
	$stmt->close();
	$conn->close();
	return $result->fetch_all(MYSQLI_ASSOC);
}
?>