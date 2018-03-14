<?php
	header("Access-Control-Allow-Origin: *");
	$servername = "localhost";
	$username = "root";
	$password = "";
	$dbname = "ece492database";
	/*$q = intval($_GET['q']);*/
	// Create connection
	$conn = mysqli_connect($servername, $username, $password, $dbname);

	// Check connection
	if (!$conn) {
	    die("Connection failed: " . mysqli_error($conn));
	}
	mysqli_select_db($conn, "remotesensor");
	$sql ="SELECT StationName,Temperature,Date
	FROM remotestation as r
	WHERE r.Date = (SELECT MAX(Date) from remotestation as r2 where r2.StationName = r.StationName AND r2.Date < NOW())
	ORDER by r.StationName ASC;";
	
	$result = mysqli_query($conn, $sql);
	$resultCheck = mysqli_num_rows($result);
	echo "StationName,Temperature,Date\n";
	if ($resultCheck > 0) {
	    while($row = mysqli_fetch_assoc($result)) {
	        echo $row['StationName'] . "," . $row["Temperature"] . "," . $row["Date"] . "\n";
	   }
	}
		else{
		echo "error";
	}
	
	mysqli_close($conn);
?>