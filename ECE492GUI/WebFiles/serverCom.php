<?php
	header("Access-Control-Allow-Origin: *");
	$servername = "localhost";
	$username = "ahnguyen_local";
	$password = "123";
	$dbname = "ahnguyen_comp466part2";
	/*$q = intval($_GET['q']);*/
	// Create connection
	$conn = mysqli_connect($servername, $username, $password, $dbname);

	// Check connection
	if (!$conn) {
	    die("Connection failed: " . mysqli_error($conn));
	}
	mysqli_select_db($conn, "ahnguyen_comp466part2");
	
	$sql = "SELECT DISTINCT *
	FROM remotestation as r
	WHERE r.Date = (SELECT MAX(Date) from remotestation as r2 where r2.StationName = r.StationName AND r2.Date < NOW())
	ORDER by r.StationName ASC;";
	
	$result = mysqli_query($conn, $sql);
	$resultCheck = mysqli_num_rows($result);
	echo "StationName,Latitude,Longitude,Temperature,Dust10,Dust2.5,Humidity,Voltage%,Date\n";
	if ($resultCheck > 0) {
	    // output data of each row
	    while($row = mysqli_fetch_assoc($result)) {
	        echo $row['StationName'] . "," .
	        $row["Latitude"] . "," .
	        $row["Longitude"] . "," .
	        $row["Temperature"] . "," .
	        $row["Dust 10"] . ","  .
	        $row["Dust 2.5"] . ","  .
	        $row["Humidity"] . ","  .
	        $row["Battery %"] . ","  .
	        $row["Date"] . "\n";
	    }
	}
	mysqli_close($conn);
?>