<?php
	header("Access-Control-Allow-Origin: *");
	$servername = "localhost";
	$username = "root";
	$password = "";
	$dbname = "ece492database";
	
	// Get passed data
	$year = intval($_GET['year']);
	$month = intval($_GET['month']);
	$day = intval($_GET['day']);
	$hour = intval($_GET['hour']);
	$min = intval($_GET['min']);
	$sec = intval($_GET['sec']);

	$filter = ($_GET['filtertype']);

	$q =  ' "' . (string)$year . "-" . (string)$month . "-" . (string)$day . " " . (string)$hour . ":" . (string)$min . ":" . (string)$sec . '" ';

	// Create connection
	$conn = mysqli_connect($servername, $username, $password, $dbname);

	// Check connection
	if (!$conn) {
	    die("Connection failed: " . mysqli_error($conn));
	}

	if($filter == "ShowAll"){
		$type = "SELECT *";
	}
	if($filter == "Temp"){
		$type = "SELECT StationName,Latitude,Longitude ,Temperature, Date ";
	}
	if($filter == "PM"){
		$type = "SELECT StationName,Latitude,Longitude,Dust, Date ";
	}


	mysqli_select_db($conn, "remotesensor");
	$sql =  $type . "
	FROM remotestation as r
	WHERE r.Date = (SELECT MAX(Date) from remotestation as r2 where r2.StationName = r.StationName AND r2.Date < " . $q . ")
	ORDER by r.StationName ASC;";
	//echo ($sql);
	$result = mysqli_query($conn, $sql);
	$resultCheck = mysqli_num_rows($result);
	if($filter =="Temp"){
		echo "StationName,Latitude,Longitude,Temperature,Date\n";
	}
	if($filter == "PM"){
		echo "StationName,Latitude,Longitude,Dust,Date\n";
	}
	if($filter =="ShowAll"){
		echo "StationName,Latitude,Longitude,Temperature,Dust10,Dust2.5,Humidity,Voltage%,Date\n";
	}	
	
	if ($resultCheck > 0) {
	    // output data of each row
	    while($row = mysqli_fetch_assoc($result)) {
			if($filter == "Temp"){
				echo $row['StationName'] . "," . $row["Latitude"] . "," . $row["Longitude"] . "," . $row["Temperature"] . "," . $row["Date"] . "\n";
			}
			if($filter == "PM"){
				echo $row['StationName'] . "," . $row["Latitude"] . "," . $row["Longitude"] . "," . $row["Dust"] . "," . $row["Date"] . "\n";
			}
			if($filter == "ShowAll"){
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
	} else {
	    echo "No Rows";
	}
	mysqli_close($conn);
?>
