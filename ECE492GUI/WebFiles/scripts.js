/**
 * @author adamo
 */
var csvData;
var csvHeader = [];
var csvContent = [];
var BadStations = [];
var lowBatteryStations = [];
var dateCol;
var voltCol;
var map;
var time;
var tempPressed = false;
var HumidPressed = false;
var voltPressed = false;
var PmPressed1 = false;
var PmPressed2 = false;
var slideShowStartTime;
var slideShowEndTime;
var timeskipamount = 10.0;
var FilterType = "ShowAll";
const timerInterval = 60;
var timerVal = timerInterval;
var timerEnabled = true;
var slideShowEnabled = false;
var GetNowPressed = false;
var infoWindowContent;
var markers =  [];

/**
 * init()
 * 
 * An "on load" function that preps the webpage.
 * Sets the time in the filter and initializes the google map.
 */
function init(){
	console.log("init started...");

	time = new Date();
	console.log(time);
	slideShowEndTime = time = new Date(time.setHours(time.getHours() - 6));
	slideShowStartTime = new Date();
	slideShowStartTime = new Date(slideShowStartTime.setHours(time.getHours() - 24));	
	document.getElementById('textDate').value =  time.toISOString().slice(0, 19).replace('T', ' ');
	document.getElementById('slideShowStart').value =  slideShowStartTime.toISOString().slice(0, 19).replace('T', ' ');
	document.getElementById('slideShowEnd').value =  slideShowEndTime.toISOString().slice(0, 19).replace('T', ' ');
	document.getElementById('timeskip').value = timeskipamount;
	
	initMap();
	callServer();	
	setInterval(timer, 1000);	
	console.log("init end.");
}

/**
 * initMap
 * 
 * A function that sets up the google map.  Centers the map on Edmonton. 
 */
function initMap() {
	var center = new google.maps.LatLng(53.5444,-113.4909);
	var mapProp= {
	    center:new google.maps.LatLng(53.5444,-113.4909),
	    zoom:5,
	    gestureHandling: 'greedy'
	};	
	map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
}

/**
 * initContent()
 * 
 * Generates the HTML code that will display the current table.
 * Also creates and sets the markers on the google map.
 * 
 * input:
 * 		header: an array containing the elements of the table header.
 * 		body: a 2D array containing the elements for each row.
 */
function initContent(header, body) {
	//Code help from -> https://code.tutsplus.com/tutorials/parsing-a-csv-file-with-javascript--cms-25626
	console.log("initContent started...");
	var htmlCode = "<table>";
	var hlat;
    var hlon;
    document.getElementById('content').innerHTML = "";
	

    if (FilterType == "Temp") {
        infoWindowContent = createInforWindowContentTemp(body);
    }
    if (FilterType == "HUMID") {
        infoWindowContent = createInforWindowContentHumid(body);
    }
    if (FilterType == "PM1") {
        infoWindowContent = createInforWindowContentPM1(body);
    }
    if (FilterType == "PM2") {
        infoWindowContent = createInforWindowContentPM2(body);
    }

    if (FilterType == "VOLT") {
        infoWindowContent = createInforWindowContentVoltaged(body);
    }
    if (FilterType == "ShowAll") {
        infoWindowContent = createInfoWindowContent(body);
    }
	var infoWindow = new google.maps.InfoWindow(),marker,row;


	htmlCode += '<thead><tr>'
	for (var h = 0; h < header.length; h++) {
		htmlCode += '<th>';
		htmlCode += header[h];
		htmlCode += '</th>';
		
		if(header[h].toLowerCase().includes("latitude"))
			hlat = h;
		if(header[h].toLowerCase().includes("longitude"))
			hlon = h;
	}
	htmlCode += '</tr>';
	htmlCode += '</thead>';
    htmlCode += '<tbody>';

    voltCol = findVolCol(csvHeader);
    if (GetNowPressed == true) {
        dateCol = findDateCol(csvHeader, csvContent);
        BadStations = checklastcall(csvContent, dateCol);
        checkVoltageLevel(csvHeader, csvContent);
    }
    if (voltCol != false) {
        lowBatteryStations = checkVoltageLevel(csvHeader,csvContent);
    }

	for (var row = 0; row < body.length - 1; row++) {
		var latitude = 0;
		var longitude = 0;
		var temperature = 0;
        var markerColor = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
       
        if ((BadStations.includes(body[row]) == true) && (GetNowPressed == true)) {
            htmlCode += '<tr id ="highlight">';
        }
   
        else if ((lowBatteryStations.includes(body[row]) == true) && (voltCol != true)) {
            htmlCode += '<tr id ="highlightVolt">';
        }

        else {
            htmlCode += '<tr>';
        }

        for (var rowCell = 0; rowCell < body[row].length; rowCell++) {
			if(rowCell == hlat)
				latitude = parseFloat( body[row][rowCell] );
            if (rowCell == hlon)
                longitude = parseFloat(body[row][rowCell]);

			htmlCode += '<td>';
			htmlCode += body[row][rowCell];
			htmlCode += '</td>';
		}
            if (tempPressed == true) {
                var tempcol = findTemplCol(csvHeader);
                HumidPressed = false;
                PmPressed = false;
                voltPressed = false;
                console.log("the tempcol is: " + tempcol);
                temperature = parseInt(body[row][3]);
                if (temperature <= 14) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }
                if ((22 > temperature) && (temperature > 14)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png';
                }
                if ((26 > temperature) && (temperature > 22)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
                }
                if ((temperature > 26) && (temperature < 30)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
                }
                if ((temperature >= 30) && (temperature < 34)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
                }
                if (temperature >= 34) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
                }
            }
             if (HumidPressed == true) {
                 var humidCol = findHumidCol(csvHeader);
                 tempPressed = false;
                 voltPressed = false;
                 PmPressed = false
                console.log("the tempcol is: " + tempcol);
                 var humididty = parseInt(body[row][humidCol]);

                 if (humididty <= 60) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }
                 if ((70 > humididty) && (humididty > 60)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png';
                }
                 if ((80 > humididty) && (humididty > 70)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
                }
                 if ((humididty > 80) && (humididty < 90)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
                }
                 if ((humididty >= 90) && (humididty < 100)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
                }
                 if (humididty >= 100) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
                }
            }
            if (voltPressed == true) {
                 var voltCol = findVolCol(csvHeader);
                tempPressed = false;
                HumidPressed = false;
                PmPressed = false;
                console.log("the voltage column is: " + voltCol);
                var voltage = parseInt(body[row][voltCol]);

                if (voltage < 20) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }
                if ((40 > voltage) && (voltage >= 20)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png';
                }
                if ((60 > voltage) && (voltage >= 40)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
                }
                if ((voltage >= 60) && (voltage < 80)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
                }
                if ((voltage >= 80) && (voltage < 100)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
                }
                if (voltage >= 100) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
                }
            }
            if (PmPressed1 == true) {
              var pmCol = findPMCol1(csvHeader);
            tempPressed = false;
            HumidPressed = false;
            var pm = parseInt(body[row][pmCol]);

            if (pm < 50) {
                markerColor = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }
            if ((100 > pm) && (pm >= 50)) {
                markerColor = 'http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png';
            }
            if ((150 > pm) && (pm >= 100)) {
                markerColor = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
            }
            if ((pm >= 150) && (pm < 200)) {
                markerColor = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
            }
            if ((pm >= 200) && (pm < 300)) {
                markerColor = 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
            }
            if (pm >= 500) {
                markerColor = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
            }
         }
            if (PmPressed2 == true) {
                var pmCol = findPMCol2(csvHeader);
                tempPressed = false;
                HumidPressed = false;
                 var pm = parseInt(body[row][pmCol]);

                 if (pm < 50) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }
                 if ((100 > pm) && (pm >= 50)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png';
                }
                 if ((150 > pm) && (pm >= 100)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
                }
                 if ((pm >= 150) && (pm < 200)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
                }
                 if ((pm >= 200) && (pm < 300)) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
                }
                 if (pm >= 500) {
                    markerColor = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
                }
               }

			var pos = new google.maps.LatLng(latitude, longitude);
			marker = new google.maps.Marker({
			position:pos,
			map:map,
			icon: markerColor,
			title:'hello'
			});
			markers.push(marker);
			google.maps.event.addListener(marker,'click',(function(marker,row){
				return function(){
                    infoWindow.setContent(infoWindowContent[row][0]);
					infoWindow.open(map,marker);
				}
			})(marker,row));
			
		
		htmlCode += '</tr>';
	}
	htmlCode += '</tbody>';
	htmlCode += '</table>';
    document.getElementById('content').innerHTML = htmlCode;
    GetNowPressed = false;
	console.log("initContent end.");
}

/**
 * Function here clears the map when called, goes through the marker array and set them all to null
 * 
 */
function clearMap() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers.length = 0;
}

/**
 * Function here is called in the HTML page when we are filtering by Temp,
 * when called it will look for the div id of "image" and replace that with a inner html <-- which will
 * be the html code that will update the page with the the temperature scale. It will also get the current time too to pass to our filtering
 */
function filterTemp(){
	document.getElementById("image").innerHTML = 
        "<img src =" + "'temp_scale.png'" +"alt = " + "temp scale" +"width=" + "'150px'" + "height=" + "'330px'" + "align=" + "right>";
	time = new Date(time.getTime());
	dt = time.toISOString().slice(0, 19).replace('T', ' ');
	document.getElementById('textDate').value = dt;
	callServerTemp(time);
    tempPressed = true;

}
/**
 * After filterTemp is called it will pass the current time and pass it to CallServerTemp, in which
 * will store the current time in a var to pass onto our php file to filter the database to look
 * specifically for Temperature
 * @param {any} filterTime
 */

function callServerTemp(filterTime){
	if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest({mozSystem: true});
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            parseData(this.responseText);
            initContent(csvHeader, csvContent);
        }
    };

	  var  req ="?year=" + filterTime.getFullYear() + "&" +
    			"month=" + (filterTime.getMonth() + 1) + "&" +
    			"day=" + filterTime.getDate() + "&" +
    			"hour=" + filterTime.getUTCHours() + "&" +
    			"min=" + filterTime.getUTCMinutes() + "&" + 	
        		"sec=" + filterTime.getUTCSeconds();
    FilterType = "Temp";
    xmlhttp.open("GET","http://ece492group4.000webhostapp.com/serverFilterTemp.php" + req, true);
    xmlhttp.send();
	

}

/**
 * Here this function is called from the HTML side when we are filtering by voltage in which again looking for the 
 * div id = image it will replace the html with a img src which will be our voltage scale that is displayed
 * at the same it will also get the current time to pass onto the filtering
 */
function filterVolt() {
    time = new Date(time.getTime());
    dt = time.toISOString().slice(0, 19).replace('T', ' ');
    document.getElementById('textDate').value = dt;

    document.getElementById("image").innerHTML =
        "<img src =" + "'voltage_scale.png'" + "alt = " + "temp scale" + "width=" + "'150px'" + "height=" + "'330px'" + "align=" + "right>";
    voltPressed = true;
    callServerVolt(time)
}

/**
 * This is called by filterVolt in which takes in a parameter of the current time to pass onto our filtering
 * pretty much we are storing the curr time in a varaible into our php file in which will do a sql query to grab the
 * filtered column which is voltage and display it on the GUI
 *
 * @param {any} filterTime
 */
function callServerVolt(filterTime) {
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest({ mozSystem: true });
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            parseData(this.responseText);
            initContent(csvHeader, csvContent);
        }
    };
    var req = "?year=" + filterTime.getFullYear() + "&" +
        "month=" + (filterTime.getMonth() + 1) + "&" +
        "day=" + filterTime.getDate() + "&" +
        "hour=" + filterTime.getUTCHours() + "&" +
        "min=" + filterTime.getUTCMinutes() + "&" +
        "sec=" + filterTime.getUTCSeconds();
    FilterType = "VOLT";
    VoltagePressed = true;
    xmlhttp.open("GET", "http://ece492group4.000webhostapp.com/serverFilterVolt.php" + req, true);
    xmlhttp.send();
}


/**
 * Here this function is called from the HTML side when we are filtering by humiditiy in which again looking for the 
 * div id = image it will replace the html with a img src which will be our humiditiy scale that is displayed
 * at the same it will also get the current time to pass onto the filtering
 */
function filterHumid() {
    document.getElementById("image").innerHTML =
        "<img src =" + "'humi_scale.png'" + "alt = " + "temp scale" + "width=" + "'150px'" + "height=" + "'330px'" + "align=" + "right>";
    time = new Date(time.getTime());
    dt = time.toISOString().slice(0, 19).replace('T', ' ');
    document.getElementById('textDate').value = dt;
    HumidPressed = true;
    callServerHumid(time)
}

/**
 * Here this function is called when we click on filterHumid in which takes the parameter of time to pass onto our filtering in which
 * storing it in a varaible we pass into php to filter by column which will be humididty and then output this onto our html
 * @param {any} filterTime
 */
function callServerHumid(filterTime) {
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest({ mozSystem: true });
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            parseData(this.responseText);
            initContent(csvHeader, csvContent);
        }
    };
    var req = "?year=" + filterTime.getFullYear() + "&" +
        "month=" + (filterTime.getMonth() + 1) + "&" +
        "day=" + filterTime.getDate() + "&" +
        "hour=" + filterTime.getUTCHours() + "&" +
        "min=" + filterTime.getUTCMinutes() + "&" +
        "sec=" + filterTime.getUTCSeconds();
    FilterType = "HUMID";
    xmlhttp.open("GET", "http://ece492group4.000webhostapp.com/serverHumid.php" + req, true);
    xmlhttp.send();
}


/**
 * This function here will take teh data header [name,lat,long,temp... so on] and the content 
 * of the data Rows  <--- actual data 
 * and it will loop through the entire header to find the data column and return that column placement to the user 
 * to which will be used when we are creating data to display for filtering 
 * 
 * @param {any} csvHeader
 * @param {any} csvContent
 */
function findDateCol(csvHeader, csvContent) {
    for (var i = 0; i < csvHeader.length; i++) {
        if (csvHeader[i] == "Date") {
            return i;
        }
    }
    return i
}

/**
 * Function that takes the header data from html side to find the column "Voltage%" to return
 * to the user in which will be used when we are filtering 
 * @param {any} csvHeader
 */

function findVolCol(csvHeader) {
    for (var i = 0; i < csvHeader.length; i++) {
        if (csvHeader[i] == "Voltage%") {
            console.log("matched")
            return i;
        }
    }
    return false;
}

/**
 * Function that takes the header data from the html side to find the column "Temperature" to return
 * to the user which will be used when we are creating markers for filtering
 * @param {any} csvHeader
 */
function findTemplCol(csvHeader) {
    for (var i = 0; i < csvHeader.length; i++) {
        if (csvHeader[i] == "Temperature") {
            console.log("matched")
            return i;
        }
    }
    return false;
}

/**
 * Function that takes the header data from html side and returns the column/placement of the column named "Humidity"
 * @param {any} csvHeader
 */
function findHumidCol(csvHeader) {
    for (var i = 0; i < csvHeader.length; i++) {
        if (csvHeader[i] == "Humidity") {
            console.log("matched")
            return i;
        }
    }
    return false;
}

/**
 * Function that takes the header from html side and returns the column/placement of the column named "Dust10"
 * @param {any} csvHeader
 */
function findPMCol1(csvHeader) {
    for (var i = 0; i < csvHeader.length; i++) {
        if (csvHeader[i] == "Dust10") {
            console.log("matched")
            return i;
        }
    }
    return false;
}

/**
 * Function that takes the header from html side and returns the column/placement of the column named "Dust2.5"
 * @param {any} csvHeader
 */
function findPMCol2(csvHeader) {
    for (var i = 0; i < csvHeader.length; i++) {
        if (csvHeader[i] == "Dust2.5") {
            console.log("matched")
            return i;
        }
    }
    return false;
}

/**
 * Takes in the column placement of the DATE from the html side and the data too and will iterate at each data at that index of the dateCol to compare the current
 * time and the last call time, if the current time and last call time differs more then 10 mins then it means there was a error that has occured in which will return
 * and array back to the html a list of all the stations that havent sent data within 10 mins or less
 * @param {any} csvContent
 * @param {any} dateCol
 */
function checklastcall(csvContent, dateCol) {
    time = new Date();
    var ErrorStations = []
    for (var i = 0; i < csvContent.length-1; i++) {
        splitDateFormat = csvContent[i][dateCol].split(" "); 
        splitYearMonthDate = splitDateFormat[0].split("-");
        splitHourMinSec = splitDateFormat[1].split(":");
        if ((time.getFullYear() - splitYearMonthDate[0]) == 0) {
            if (((time.getMonth() + 1) - splitYearMonthDate[1]) == 0) {
                if ((time.getDate() - splitYearMonthDate[2]) == 0) {
                    if ((time.getHours()- splitHourMinSec[0]) == 0) {
                        if ((time.getMinutes() - splitHourMinSec[1]) <= 10) {}
                        else {
                            ErrorStations.push(csvContent[i]);
                        }
                    }
                    else {
                        ErrorStations.push(csvContent[i]);
                    }
                }
                else {
                    ErrorStations.push(csvContent[i]);
                }
            }   
            else {
                ErrorStations.push(csvContent[i]);
            }
        }
        else {
            ErrorStations.push(csvContent[i]);
        }
    }
    return ErrorStations;
}


/**
 * Takes in the voltage col and the data to compare the data of each row at the index of the voltage and check if the level is less then 25 
 * which will then return a list of arrays of all the stations that are below 25
 * @param {any} dataheader
 * @param {any} data
 */
function checkVoltageLevel(dataheader,data) {
    var voltCol = findVolCol(dataheader)
    var ErrorStations = []
    for (var i = 0; i < data.length - 1; i++) {
        //console.log(data[i]);
        //console.log(data[i][voltCol]);
        if (data[i][voltCol] <= 25) {
            ErrorStations.push(data[i]);
        }
    }
    return ErrorStations;

}

/**
 * From the HTML side when we press on DUST1.0 when filtering the data it'll call this function and update the webpage with
 * the PM scale and find the current time in which will then pass that information to the actual filtering
 */
function filterPM(){
	time = new Date(time.getTime());
	dt = time.toISOString().slice(0, 19).replace('T', ' ');
    document.getElementById('textDate').value = dt;
    document.getElementById("image").innerHTML =
        "<img src =" + "'PM_scale.png'" + "alt = " + "temp scale" + "width=" + "'150px'" + "height=" + "'330px'" + "align=" + "right>";
    PmPressed1 = true;
	callServerPM(time);
}

/**
 * From the HTML side when we press on DUST2.5 when filtering the data it'll call this function and update the webpage with
 * the PM scale and find the current time in which will then pass that information to the actual filtering
 */
function filterPM2() {
	time = new Date(time.getTime());
	dt = time.toISOString().slice(0, 19).replace('T', ' ');
    document.getElementById('textDate').value = dt;
    document.getElementById("image").innerHTML =
        "<img src =" + "'PM_scale.png'" + "alt = " + "temp scale" + "width=" + "'150px'" + "height=" + "'330px'" + "align=" + "right>";
    PmPressed2 = true;
	callServerPM2(time);
}

/**
 * From the HTML side when we press on show when filtering the data it'll call this function and update the webpage with
 * the default Temperature scale and find the current time in which will then pass that information to the actual filtering
 */
function filterShowAll() {
    time = new Date(time.getTime());
    document.getElementById("image").innerHTML =
        "<img src =" + "'temp_scale.png'" + "alt = " + "temp scale" + "width=" + "'150px'" + "height=" + "'330px'" + "align=" + "right>";
    dt = time.toISOString().slice(0, 19).replace('T', ' ');
    document.getElementById('textDate').value = dt;
    FilterType = "ShowAll"
    tempPressed = true;

    callServerTime(time,FilterType);
}


/**
 * Here this function is called when we click on filterPM1 in which takes the parameter of time to pass onto our filtering in which
 * storing it in a varaible we pass into php to filter by column which will be dust1.0 and then output this onto our html
 * @param {any} filterTime
 */
function callServerPM(filterTime){
		if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest({mozSystem: true});
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            parseData(this.responseText);
            initContent(csvHeader, csvContent);
        }
    };
	var  req ="?year=" + filterTime.getFullYear() + "&" +
				"month=" + (filterTime.getMonth() + 1) + "&" +
    			"day=" + filterTime.getDate() + "&" +
    			"hour=" + filterTime.getUTCHours() + "&" +
    			"min=" + filterTime.getUTCMinutes() + "&" + 
    			"sec=" + filterTime.getUTCSeconds();
    FilterType = "PM1"		
    xmlhttp.open("GET", "http://ece492group4.000webhostapp.com/serverFilterPM1.php" + req, true);
    VoltagePressed = false;
    xmlhttp.send();
}

/**
 * Here this function is called when we click on dust2.5 in which takes the parameter of time to pass onto our filtering in which
 * storing it in a varaible we pass into php to filter by column which will be dust2.5 and then output this onto our html
 * @param {any} filterTime
 */
function callServerPM2(filterTime) {
		if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest({mozSystem: true});
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            parseData(this.responseText);
            initContent(csvHeader, csvContent);
        }
    };
	var  req ="?year=" + filterTime.getFullYear() + "&" +
				"month=" + (filterTime.getMonth() + 1) + "&" +
    			"day=" + filterTime.getDate() + "&" +
    			"hour=" + filterTime.getUTCHours() + "&" +
    			"min=" + filterTime.getUTCMinutes() + "&" + 
    			"sec=" + filterTime.getUTCSeconds();
    FilterType = "PM2"		
    xmlhttp.open("GET", "http://ece492group4.000webhostapp.com/serverFilterPM2.php" + req, true);
    VoltagePressed = false;
    xmlhttp.send();
}	

//Function that is called will just call clearMap and delete the markers on googlemaps	  
function deleteMarkers(){
	clearMap();
}

/**
 *parseData
 * input:
 *		data: a newline sperated list of the to-be-built table.
 * output:
 * 		global csvHeader: contains the header of the table.
 * 		global csvContent: contains the rows of the table.
 */
function parseData(data)
{
	var allRows = data.split(/\r?\n|\r/);
	csvHeader = [];
	csvContent = [];
	for (var row = 0; row < allRows.length; row++) {
		var rowCells = allRows[row].split(',');
		if(row == 0)
			csvHeader = rowCells;
		else
			csvContent[row - 1] = rowCells;
	}
}


/**
 * Takes in the data from the webserver and converts it into a readable data that will be displayed on the markers when the user clicks on the markers
 * sepecfically temperature
 * @param {any} data
 */
function createInforWindowContentTemp(data) {
    var infoWindow = [];
    for (var i = 0; i < data.length; i++) {
        infoWindow.push(['<h1>' + data[i][0] + '</h1>' +
            '<p>Latitude: ' + data[i][1] + '</p>' +
            '<p>Longitude: ' + data[i][2] + '</p>' +
            '<p>Temperature: ' + data[i][3] + '</p>' +
            '<p>Date: ' + data[i][4] + '</p>']);
    }
    return infoWindow;
}

/**
 * Takes in the data from the webserver and converts it into a readable data that will be displayed on the markers when the user clicks on the markers
 * sepecfically Humididity
 * @param {any} data
 */
function createInforWindowContentHumid(data) {
    var infoWindow = [];
    for (var i = 0; i < data.length; i++) {
        infoWindow.push(['<h1>' + data[i][0] + '</h1>' +
            '<p>Latitude: ' + data[i][1] + '</p>' +
            '<p>Longitude: ' + data[i][2] + '</p>' +
            '<p>Humidity: ' + data[i][3] + '</p>' +
            '<p>Date: ' + data[i][4] + '</p>']);
    }
    return infoWindow;
}

/**
 * Takes in the data from the webserver and converts it into a readable data that will be displayed on the markers when the user clicks on the markers
 * sepecfically voltage
 * @param {any} data
 */
function createInforWindowContentVoltaged(data) {
    var infoWindow = [];
    for (var i = 0; i < data.length; i++) {
        infoWindow.push(['<h1>' + data[i][0] + '</h1>' +
            '<p>Latitude: ' + data[i][1] + '</p>' +
            '<p>Longitude: ' + data[i][2] + '</p>' +
            '<p>Voltage: ' + data[i][3] + '</p>' +
            '<p>Date: ' + data[i][4] + '</p>']);
    }
    return infoWindow;
}

/**
 * Takes in the data from the webserver and converts it into a readable data that will be displayed on the markers when the user clicks on the markers
 * sepecfically for dust1.0
 * @param {any} data
 */
function createInforWindowContentPM1(data) {
    var infoWindow = [];
    for (var i = 0; i < data.length; i++) {
        infoWindow.push(['<h1>' + data[i][0] + '</h1>' +
            '<p>Latitude: ' + data[i][1] + '</p>' +
            '<p>Longitude: ' + data[i][2] + '</p>' +
            '<p>Dust 1.0: ' + data[i][3] + '</p>' +
            '<p>Date: ' + data[i][4] + '</p>']);
    }
    return infoWindow;
}

/**
 * Takes in the data from the webserver and converts it into a readable data that will be displayed on the markers when the user clicks on the markers
 * sepecfically dust2
 * @param {any} data
 */
function createInforWindowContentPM2(data) {
    var infoWindow = [];
    for (var i = 0; i < data.length; i++) {
        infoWindow.push(['<h1>' + data[i][0] + '</h1>' +
            '<p>Latitude: ' + data[i][1] + '</p>' +
            '<p>Longitude: ' + data[i][2] + '</p>' +
            '<p>Dust 2.5: ' + data[i][3] + '</p>' +
            '<p>Date: ' + data[i][4] + '</p>']);
    }
    return infoWindow;
}


function createInforWindowContentPM(data) {
    var infoWindow = [];
    for (var i = 0; i < data.length; i++) {
        infoWindow.push(['<h1>' + data[i][0] + '</h1>' +
            '<p>Latitude: ' + data[i][1] + '</p>' +
            '<p>Longitude: ' + data[i][2] + '</p>' +
            '<p>Dust 1.0: ' + data[i][3] + '</p>' +
            '<p>Dust 2.5: ' + data[i][4] + '</p>' + 
            '<p>Date: ' + data[i][5] + '</p>']);
    }
    return infoWindow;
}

/**
 * Takes in the data from the webserver and converts it into a readable data that will be displayed on the markers when the user clicks on the markers
 * sepecfically showAll
 * @param {any} data
 */
function createInfoWindowContent(data){
	var infoWindow = [];
	for (var i = 0; i < data.length; i ++){
        infoWindow.push(['<h1>' + data[i][0] + '</h1>' +
            '<p>Latitude: ' + data[i][1] + '</p>' +
            '<p>Longitude: ' + data[i][2] + '</p>' +
            '<p>Temperature: ' + data[i][3] + '</p>' +
            '<p>Dust 1.0: ' + data[i][4] + '</p>' +
            '<p>Dust 2.5: ' + data[i][5] + '</p>' +
            '<p>Humidity: ' + data[i][6] + '</p>' +
            '<p>Voltage%: ' + data[i][7] + '</p>' +
            '<p>Date: ' + data[i][8] + '</p>']); 
	}
	return infoWindow;
}

/**
 * Function that will activate when the drop down button is pressed on the html side
 * @param {any} event
 */
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

/**
 * Function that toggles the myDropdown button to show the list elements
 */
function myFunction() {
 document.getElementById("myDropdown").classList.toggle("show");}

/**
 * callServer()
 * 
 * Calls the server to return the most recent data-set of each remote station.
 * Once the asynchronous call has returned, update the table with the new data.
 */
function callServer() {
	
	if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest({mozSystem: true});
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //document.getElementById("content").innerHTML = this.responseText;
            //console.log(this.responseText);
            parseData(this.responseText);
            initContent(csvHeader, csvContent);
        }
    };
    xmlhttp.open("GET","http://ece492group4.000webhostapp.com/serverCom.php",true);
    xmlhttp.send();
}

/**
 * callServerTime
 * 
 * Calls the server, including a filter for the most recent call up to a certain date and time.
 * Once the asynchronous call has returned, update the table with the new data.
 * 
 * inputs:
 * 		filterTime: The time we'd like the server to filter by.
 * 		FilterType: Determines what elements the server will return.
 */
function callServerTime(filterTime,FilterType){
	if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest({mozSystem: true});
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            parseData(this.responseText);
            clearMap();
            initContent(csvHeader, csvContent);
        }
    };
    var req = "?year=" + filterTime.getFullYear() + "&" +
        "month=" + (filterTime.getMonth() + 1) + "&" +
        "day=" + filterTime.getDate() + "&" +
        "hour=" + filterTime.getUTCHours() + "&" +
        "min=" + filterTime.getUTCMinutes() + "&" +
        "sec=" + filterTime.getUTCSeconds() + "&" +
        "filtertype=" + FilterType;
    xmlhttp.open("GET","http://ece492group4.000webhostapp.com/DateFilter.php" + req,true);
    xmlhttp.send();
}

/**
 * getNow()
 * 
 * Function for the "<- get this time" button.  Makes sure that the input date is valid before making the request.
 */
function getNow(){
    timestamp = Date.parse(document.getElementById('textDate').value);
    GetNowPressed = true;
	if(isNaN(timestamp)==false)
	{
		time = parseDateString(document.getElementById('textDate').value)
		//console.log(time)
        callServerTime(time, FilterType);
	}
	else
	{
		//console.log(time)
		var dt = time.toISOString().slice(0, 19).replace('T', ' ');
		document.getElementById('textDate').value = dt;
	}
}

/**
 * getPrevDate()
 * 
 * Function for the "-10 minutes" button.  Decreases the filter time then calls the server.
 */
function getPrevDate()
{   
    GetNowPressed = false;
	//time = new Date(time - (10 * 60000));
	time = new Date(parseDateString( document.getElementById('textDate').value) - (timeskipamount * 60000));
	var dt = time.toISOString().slice(0, 19).replace('T', ' ');
	document.getElementById('textDate').value = dt;
	callServerTime(time,FilterType);	
}

/**
 * getNextDate()
 * 
 * Function for the "-10 minutes" button.  Increases the filter time then calls the server.
 */
function getNextDate()
{
    GetNowPressed = false;
	//time = new Date(time.getTime() + (10 * 60000));
	time = new Date(parseDateString( document.getElementById('textDate').value).valueOf() + (timeskipamount * 60000));
	dt = time.toISOString().slice(0, 19).replace('T', ' ');
    document.getElementById('textDate').value = dt;
    callServerTime(time, FilterType);	
}

/**
 * parseDateString()
 * 
 * A function that takes a date string and converts it to a Date object.
 * 
 * input:
 * 		datestr: A string representing a datetime
 */
function parseDateString(datestr){
	var newTime = new Date();
	newTime.setFullYear( datestr.substring(0,4) );
	newTime.setMonth( (datestr.substring(5,7)) - 1 );
	newTime.setDate( parseInt(datestr.substring(8,10)) -  1 );
	if (parseInt(datestr.substring(8,10)) < newTime.getDate()){
	    newTime.setDate( parseInt(datestr.substring(8,10)) );
	}
	newTime.setUTCHours( datestr.substring(11,13) );
	newTime.setUTCMinutes( datestr.substring(14,16) );
	newTime.setUTCSeconds( datestr.substring(17,19) );
	//console.log(newTime);
	return newTime;
}

/**
 * timer()
 * 
 * A function that is executed every second.  Is used for the automatic updates as well as the slide show. 
 */
function timer(){
	if(timerEnabled){
		timerVal -= 1;
		
		if(timerVal <= 0){
			timerVal = timerInterval;
            getNow();
		}
	
		document.getElementById('timer').innerHTML = timerVal;
	}
	
	if(slideShowEnabled){
		
		if(time >= slideShowEndTime){
			time = slideShowStartTime;
			document.getElementById('textDate').value =  time.toISOString().slice(0, 19).replace('T', ' ');
		}
		else {
			time = new Date(parseDateString( document.getElementById('textDate').value).valueOf() + (timeskipamount * 60000));
			document.getElementById('textDate').value = time.toISOString().slice(0, 19).replace('T', ' ');
		}
		callServerTime(time,FilterType);
	}
}

/**
 * pauseTimer()
 *  
 * Pauses and un-pauses the automatic timer countdown.
 */
function pauseTimer()
{
	if (!slideShowEnabled){
		if(timerEnabled){
			timerEnabled = false;
			document.getElementById('timerPause').innerHTML = "Start";
		}
		else
		{
			timerEnabled = true;
			document.getElementById('timerPause').innerHTML = "Pause";
		}
	}
}


/**
 * timeSkipFunc()
 * 
 * Function used for an on-change event when altering the timeskip text field. 
 */
function timeSkipFunc(){
	var temp = parseFloat(document.getElementById('timeskip').value);
	if(temp != NaN)
	{
		timeskipamount = temp;
		var str;
		if(temp < 1)
		{
			str = (60 * temp).toString() + " seconds";
		}
		else if (temp >= 60)
		{
			str = (temp / 60).toString() + " hours";
		}
		else
			str = temp.toString() + " minutes";
		document.getElementById('nextButton').innerHTML = "+" + str;
		document.getElementById('prevButton').innerHTML = "-" + str;
	}
	else
		document.getElementById('timeskip').value = timeskipamount;
}

/**
 * slideShowStartChange()
 * 
 * Function used for an on-change event when altering the slide show start time text field. 
 */
function slideShowStartChange(){
	slideShowStartTime = parseDateString(document.getElementById('slideShowStart').value)
	//console.log(slideShowStartTime);
}

/**
 * slideShowStartChange()
 * 
 * Function used for an on-change event when altering the slide show end time text field. 
 */
function slideShowEndChange(){
	slideShowEndTime = parseDateString(document.getElementById('slideShowEnd').value)
	//console.log(slideShowEndTime);
}

/**
 * StartSlideShow()
 * 
 * The function for the "start slideshow" button.
 * Pauses the automatic update timer and enables the slide show for the timer function.
 */
function StartSlideShow(){
	if (slideShowEnabled) {
		slideShowEnabled = false;
		document.getElementById('slideShowButton').innerHTML = "Start";
	}
	else{
		slideShowEnabled = true;
		document.getElementById('slideShowButton').innerHTML = "Stop";
		timerEnabled = false;
		document.getElementById('timerPause').innerHTML = "Start";
		
		time = slideShowStartTime;
		document.getElementById('textDate').value =  time.toISOString().slice(0, 19).replace('T', ' ');
	}
}
