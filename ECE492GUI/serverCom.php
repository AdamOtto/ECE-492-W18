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
	$sql = "SELECT * from remotesensor;";
	$result = mysqli_query($conn, $sql);
	$resultCheck = mysqli_num_rows($result);
	if ($resultCheck > 0) {
	    // output data of each row
	    while($row = mysqli_fetch_assoc($result)) {
	        echo $row['StationName'] . "," . $row["Latitude"] . "," . $row["Longitude"] . "," . $row["Temperature"] . "," . $row["Dust"] . "," . $row["Date"] . "\n";
	    }
	} else {
	    echo "Didn't get shit yo";
	}
	mysqli_close($conn);
?>