<?php
	header("Access-Control-Allow-Origin: *");
	$servername = "localhost";
	$username = "root";
	$password = "";
	$dbname = "ece492database";
	/*$q = intval($_GET['q']);*/
	// Create connection
	$year = intval($_GET['year']);
	$month = intval($_GET['month']);
	$day = intval($_GET['day']);
	$hour = intval($_GET['hour']);
	$min = intval($_GET['min']);
	$sec = intval($_GET['sec']);
	$conn = mysqli_connect($servername, $username, $password, $dbname);
	$q =  '"' . (string)$year . "-" . (string)$month . "-" . (string)$day . " " . (string)$hour . ":" . (string)$min . ":" . (string)$sec . '"';

	// Check connection
	if (!$conn) {
	    die("Connection failed: " . mysqli_error($conn));
	}
	mysqli_select_db($conn, "remotesensor");
	$sql ="SELECT StationName,Latitude,Longitude,`Battery %`,Date
	FROM remotestation as r
	WHERE r.Date = (SELECT MAX(Date) from remotestation as r2 where r2.StationName = r.StationName AND r2.Date < "  .$q.  ")
	ORDER by r.StationName ASC;";
	
	$result = mysqli_query($conn, $sql);
	$resultCheck = mysqli_num_rows($result);
	echo "StationName,Latitude,Longitude,Voltage %,Date\n";
	if ($resultCheck > 0) {
	    while($row = mysqli_fetch_assoc($result)) {
	        echo $row['StationName'] ."," . $row["Latitude"] . "," . $row["Longitude"] ."," . $row["Battery %"] . "," . $row["Date"] . "\n";
	   }
	}
		else{
		echo "error";
	}
	
	mysqli_close($conn);
?>