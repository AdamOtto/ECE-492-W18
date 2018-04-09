<?php
	header("Access-Control-Allow-Origin: *");
	$servername = "localhost";
	$username = "id5126683_rootuser";
	$password = "groot";
	$dbname = "id5126683_ece492database";
	//~ // Create connection
	$conn = mysqli_connect($servername, $username, $password, $dbname);
	
	$StationName = $_GET['StationName'];
	$Latitude = $_GET['Latitude'];
	$Longitude = $_GET['Longitude'];
	$Temperature = $_GET['Temperature'];
	$Dust10 = $_GET['Dust10'];
	$Dust2_5 = $_GET['Dust2_5'];
	$Humidity = $_GET['Humidity'];
	$Battery = $_GET['Battery'];
	#$Date = $_GET['Date'];
	$q = (string)$StationName . "," . (string)$Latitude . "," . (string)$Longitude . "," . (string)$Temperature . "," . (string)$Dust10 . "," . (string)$Dust2_5 . "," . (string)$Humidity . "," . (string)$Battery . ", DATE_ADD(now(), INTERVAL -6 HOUR)";
	echo $q;
	// Check connection
	if (!$conn) {
	    die("Connection failed: " . mysqli_error($conn));
	}
	mysqli_select_db($conn, "id5126683_ece492database");

	$sql = "INSERT INTO `remotestation`(`StationName`, `Latitude`, `Longitude`, `Temperature`, `Dust 10`, `Dust 2.5`, `Humidity`, `Battery %`, `Date`) VALUES (" . $q . ")";
	$result = mysqli_query($conn, $sql);
	if ($result) {
		echo "Good";
	} else {
		echo "Bad";
	}
	mysqli_close($conn);
?>