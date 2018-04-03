/**
 * @author adamo
 */
/*
$(document).ready(function() {
	$.ajax({	
		type: "GET",	
		url: "test.csv",
		dataType: "text",	
		success: function(data) {csvFunction(data);}	
	});
});
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
var timeskipamount = 10.0;
var FilterType = "ShowAll";
const timerInterval = 60;
var timerVal = timerInterval;
var timerEnabled = true;
var GetNowPressed = false;
var infoWindowContent;

function init(){
	console.log("init started...");

	time = new Date();
	time = new Date(time.setHours(time.getHours() - 6));
	console.log(time);
	document.getElementById('textDate').value =  time.toISOString().slice(0, 19).replace('T', ' ');
	document.getElementById('timeskip').value = timeskipamount;
	
	initMap();
	//parseData(csvData);
	callServer();
	//initContent(csvHeader, csvContent);
	
	setInterval(timer, 1000);
	
	console.log("init end.");
}

function initMap() {
	var center = new google.maps.LatLng(53.5444,-113.4909);
	var mapProp= {
	    center:new google.maps.LatLng(53.5444,-113.4909),
	    zoom:5,
	    gestureHandling: 'greedy'
	};
	//var marker = new google.maps.Marker({position:center});
	
	map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
	
	//marker.setMap(map);
}

/**
 * Reloads the table with data from the csv file based on the passed in value.
 * 
 * Takes in the headers of the table and the rows, or the body, of the table as arguments.
 */
 var markers =  [];
function initContent(header, body) {
	//Code help from -> https://code.tutsplus.com/tutorials/parsing-a-csv-file-with-javascript--cms-25626
	console.log("initContent started...");
	var htmlCode = "<table>";
	var hlat;
    var hlon;
    document.getElementById('content').innerHTML = "";
    //console.log("the filter type is: " + FilterType);
	

    if (FilterType == "Temp") {
        infoWindowContent = createInforWindowContentTemp(body);
    }
    if (FilterType == "HUMID") {
        //console.log("inside this if for humid");
        infoWindowContent = createInforWindowContentHumid(body);
    }
    if (FilterType == "PM") {
        infoWindowContent = createInforWindowContentPM(body);
    }
    if (FilterType == "VOLT") {
        infoWindowContent = createInforWindowContentVoltaged(body);
    }
    if (FilterType == "ShowAll") {
        //console.log("inside this else");
        infoWindowContent = createInfoWindowContent(body);
    }
	var infoWindow = new google.maps.InfoWindow(),marker,row;
	//console.log('The new infowindowcontent is ' + infoWindowContent);


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
		//htmlCode += '<tr>';
		var latitude = 0;
		var longitude = 0;
		var temperature = 0;
        var markerColor = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
       
        if ((BadStations.includes(body[row]) == true) && (GetNowPressed == true)) {
            //console.log("inside here");
            //console.log(BadStations);
            htmlCode += '<tr id ="highlight">';
        }
   
        else if ((lowBatteryStations.includes(body[row]) == true) && (voltCol != true)) {
            //console.log("inside this second if");
            htmlCode += '<tr id ="highlightVolt">';
        }

        else {
            htmlCode += '<tr>';
        }

        for (var rowCell = 0; rowCell < body[row].length; rowCell++) {
			if(rowCell == hlat)
				latitude = parseInt( body[row][rowCell] );
			if(rowCell == hlon)
                longitude = parseInt(body[row][rowCell]);

			htmlCode += '<td>';
			htmlCode += body[row][rowCell];
			htmlCode += '</td>';
		}

		//console.log("Adding marker " + row + ": Lat: " + latitude + ", Long: " + longitude);		
		//console.log("the temperature is " + body[row][3]);
		temperature = parseInt(body[row][3]);
		if(temperature <= -25){
			markerColor ='http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
		}
		if( (-10 > temperature )&&( temperature > -20)){
			markerColor = 'http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png';
		}
		if(( 0 > temperature)&&(temperature > -10)){
			markerColor = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
		}
		if((temperature > 0) && ( temperature < 10)){
			markerColor = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
		}		
		if((temperature >= 10) && ( temperature < 20)){
			markerColor = 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
		}		
		if(temperature >= 20){
			markerColor = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
		}
		
			var pos = new google.maps.LatLng(latitude, longitude);
			marker = new google.maps.Marker({
			position:pos,
			map:map,
			icon: markerColor,
			title:'hello'
			});
			markers.push(marker);
			//console.log(row);
			google.maps.event.addListener(marker,'click',(function(marker,row){
				return function(){
                    //console.log('setting the content to this' + row + infoWindowContent[row][0]);
                    //console.log("before this stuff: " + infoWindowContent);
                    infoWindow.setContent(infoWindowContent[row][0]);
                    //console.log("the content is: " + infoWindowContent[row][0]);
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

function clearMap() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers.length = 0;
}

function filterTemp(){
	//console.log("inside filterTemp")
	time = new Date(time.getTime());
	dt = time.toISOString().slice(0, 19).replace('T', ' ');
	document.getElementById('textDate').value = dt;
	callServerTemp(time);
	
}


function callServerTemp(filterTime){
	
	//console.log("inside callserverTemp")
	//console.log(filterTime) 
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
    FilterType = "Temp"
    //console.log(req)
    xmlhttp.open("GET","http://localhost/serverFilterTemp.php" + req, true);
    xmlhttp.send();
	

}

function filterVolt() {
    //console.log("inside filterVolt")
    time = new Date(time.getTime());
    dt = time.toISOString().slice(0, 19).replace('T', ' ');
    document.getElementById('textDate').value = dt;
    callServerVolt(time)
}

function callServerVolt(filterTime) {
    //console.log("inside callServerVolt")
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
    FilterType = "VOLT"
    VoltagePressed = true;
    //console.log(req)
    xmlhttp.open("GET", "http://localhost/serverFilterVolt.php" + req, true);
    xmlhttp.send();
}

function filterHumid() {
    //console.log("inside filterHumid")
    time = new Date(time.getTime());
    dt = time.toISOString().slice(0, 19).replace('T', ' ');
    document.getElementById('textDate').value = dt;
    callServerHumid(time)
}

function callServerHumid(filterTime) {
    //console.log("inside callServerHumid")
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
    FilterType = "HUMID"
    //console.log(req)
    xmlhttp.open("GET", "http://localhost/serverHumid.php" + req, true);
    xmlhttp.send();
}


function findDateCol(csvHeader, csvContent) {
    for (var i = 0; i < csvHeader.length; i++) {
        //console.log(csvHeader[i]);
        if (csvHeader[i] == "Date") {
            return i;
        }
    }
    return i
}


function findVolCol(csvHeader) {
    //console.log("inside findVolVol");
    for (var i = 0; i < csvHeader.length; i++) {
        //console.log(csvHeader[i]);
        if (csvHeader[i] == "Voltage%") {
            console.log("matched")
            return i;
        }
    }
    return false;
}

function checklastcall(csvContent, dateCol) {
    time = new Date();
    //console.log("the time today is: " + time);
    var ErrorStations = []
    for (var i = 0; i < csvContent.length-1; i++) {
        splitDateFormat = csvContent[i][dateCol].split(" ");
        splitYearMonthDate = splitDateFormat[0].split("-");
        splitHourMinSec = splitDateFormat[1].split(":");
        if ((time.getFullYear() - splitYearMonthDate[0]) == 0) {
            if (((time.getMonth() + 1) - splitYearMonthDate[1]) == 0) {
                if ((time.getDate() - splitYearMonthDate[2]) == 0) {
                    if ((time.getHours()- splitHourMinSec[0]) == 0) {
                        //console.log("the miniutes are going to be: " + splitHourMinSec[1]);
                        //console.log(time.getUTCMinutes());
                        //console.log(time.getMinutes() - splitHourMinSec[1]);
                        if ((time.getMinutes() - splitHourMinSec[1]) <= 10) {
                            //console.log("inside here and the statointhat passed is: " + csvContent[i]);
                        }
                        else {
                            //console.log("Error at station miniutes:" + csvContent[i][0]);
                            //console.log(splitHourMinSec[1]);
                            //console.log(time.getUTCMinutes());
                            ErrorStations.push(csvContent[i]);
                        }
                    }
                    else {
                        //console.log("Error at station Hours :" + csvContent[i][0]);
                        //console.log(splitHourMinSec[0]);
                        //console.log(time.getHours());
                        ErrorStations.push(csvContent[i]);
                    }
                }
                else {
                    //console.log("Error at station :" + csvContent[i][0]);
                    ErrorStations.push(csvContent[i]);

                }
            }   
            else {
                //console.log("Error at station :" + csvContent[i][0]);
                ErrorStations.push(csvContent[i]);

            }
        }
        else {
            //console.log("Error at station :" + csvContent[i][0]);
            ErrorStations.push(csvContent[i]);
        }
    }
    return ErrorStations;
}


function checkVoltageLevel(dataheader,data) {
    var voltCol = findVolCol(dataheader)
    //console.log("the volt column is: " + voltCol);
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

function filterPM(){
	//console.log("inside filterPM")
	time = new Date(time.getTime());
	dt = time.toISOString().slice(0, 19).replace('T', ' ');
	document.getElementById('textDate').value = dt;
	callServerPM(time);
}

function filterShowAll() {
    //console.log("inside filterShowAll")
    time = new Date(time.getTime());
    dt = time.toISOString().slice(0, 19).replace('T', ' ');
    document.getElementById('textDate').value = dt;
    FilterType = "ShowAll"
    callServerTime(time,FilterType);
}
	  
function callServerPM(filterTime){
	//console.log("inside callServerPM")
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
    FilterType = "PM"		
    xmlhttp.open("GET", "http://localhost/serverFilterPM.php" + req, true);
    VoltagePressed = false;
    xmlhttp.send();
}	
	  
function deleteMarkers(){
	clearMap();
}

function parseData(data)
{
	//var d1 = new Date(2017, 7, 24, 14, 52, 10);
	//var d2 = Date.parse("2018 Feb 13 2:34:55");
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
	//console.log(csvHeader);
	//console.log(csvContent);
}

function csvFunction(data)
{
	//console.log(data);
	csvData = data;
}

function createContentString(station_number,temp,humididty,pmatter){
	var contentString = '<h1 class= "contentstring"> REMOTE STATION' + station_number + '</h1>'+
						'<p>Temperature: '+ temp + ' </p>'+
						'<p>Humididty: '+ humididty + ' </p>' +
                        '<p>Particulate matter: ' + pmatter + ' </p>';
        
	return contentString;
}

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

} function createInforWindowContentHumid(data) {
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


function myFunction() {
	//console.log("hello inside myFunction");
    document.getElementById("myDropdown").classList.toggle("show");
}

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
    xmlhttp.open("GET","http://localhost/serverCom.php",true);
    xmlhttp.send();
}

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
    //console.log("FILTER TYPE IS : " + FilterType)
    var req = "?year=" + filterTime.getFullYear() + "&" +
        "month=" + (filterTime.getMonth() + 1) + "&" +
        "day=" + filterTime.getDate() + "&" +
        "hour=" + filterTime.getUTCHours() + "&" +
        "min=" + filterTime.getUTCMinutes() + "&" +
        "sec=" + filterTime.getUTCSeconds() + "&" +
        "filtertype=" + FilterType;
    //console.log("inside callServerTime")
    //console.log(req)
    xmlhttp.open("GET","http://localhost/DateFilter.php" + req,true);
    xmlhttp.send();
}

/*
function callServerPrevIndex(filterTime, filterName){
	
	if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest({mozSystem: true});
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        	//buffer[buffer.length] = this.responseText;
            console.log(this.responseText);
        }
    };
    
    var req = "?year=" + filterTime.getFullYear() + "&" +
        "month=" + (filterTime.getMonth() + 1) + "&" +
        "day=" + filterTime.getDate() + "&" +
        "hour=" + filterTime.getUTCHours() + "&" +
        "min=" + filterTime.getUTCMinutes() + "&" +
        "sec=" + filterTime.getUTCSeconds() + "&" +
        "name=" + filterName;
    xmlhttp.timeout = 4000;
    xmlhttp.open("GET","http://localhost/serverPrevIndex.php" + req,true);
    xmlhttp.send();
}
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

function getPrevDate()
{   
    GetNowPressed = false;
	//time = new Date(time - (10 * 60000));
	time = new Date(parseDateString( document.getElementById('textDate').value) - (timeskipamount * 60000));
	var dt = time.toISOString().slice(0, 19).replace('T', ' ');
	document.getElementById('textDate').value = dt;
	callServerTime(time,FilterType);	
}

function getNextDate()
{
    GetNowPressed = false;
	//time = new Date(time.getTime() + (10 * 60000));
	time = new Date(parseDateString( document.getElementById('textDate').value).valueOf() + (timeskipamount * 60000));
	dt = time.toISOString().slice(0, 19).replace('T', ' ');
    document.getElementById('textDate').value = dt;
    callServerTime(time, FilterType);	
}

/*
function getNextIndex(){
	
}

function getprevIndex(){
	buffer = [];
	for ( i = 0; i < csvContent.length - 1; i++)
	{
		//console.log(csvContent[i][0]);
		//console.log(csvContent[i][csvContent[i].length - 1]);		
		callServerPrevIndex( parseDateString(csvContent[i][csvContent[i].length - 1]), csvContent[i][0]);
	}
}

function sortFunc(a, b)
{
	if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}
*/
function parseDateString(datestr){
	var newTime = new Date();
	newTime.setFullYear( datestr.substring(0,4) );
	newTime.setMonth( (datestr.substring(5,7)) - 1 );
	newTime.setDate( datestr.substring(8,10) );
	newTime.setUTCHours( datestr.substring(11,13) );
	newTime.setUTCMinutes( datestr.substring(14,16) );
	newTime.setUTCSeconds( datestr.substring(17,19) );
	//console.log(newTime);
	return newTime;
}

function timer(){
	if(timerEnabled){
		timerVal -= 1;
		
		if(timerVal <= 0){
			timerVal = timerInterval;
            getNow();
		}
	
		document.getElementById('timer').innerHTML = timerVal;
	}
}

function pauseTimer()
{
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
