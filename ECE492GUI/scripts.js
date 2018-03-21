/**
 * @author adamo
 */

$(document).ready(function() {
	$.ajax({	
		type: "GET",	
		url: "test.csv",
		dataType: "text",	
		success: function(data) {csvFunction(data);}	
	});
});

var csvData;
var csvHeader = [];
var csvContent = [];
var map;
//window.onscroll = function() {stickyFunc()};
var mapElement;
var sticky;
var time;
var FilterType = "ShowAll";
var timerInterval = 60;
var timerVal = timerInterval;

function init(){
	console.log("init started...");
	time = new Date();
	document.getElementById('textDate').value =  time.toISOString().slice(0, 19).replace('T', ' ');;
	window.onscroll = function() {stickyFunc()};
	mapElement = document.getElementById("fixedDiv");
	//sticky = mapElement.offsetTop;
	initMap();
	//parseData(csvData);
	callServer();
	//initContent(csvHeader, csvContent);
	console.log("init end.");
}

function initMap() {
	var center = new google.maps.LatLng(53.5444,-113.4909);
	var mapProp= {
	    center:new google.maps.LatLng(53.5444,-113.4909),
	    zoom:5,
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
	
	var contentString = createContentString(1,190,20,39);	
	var infoWindowContent = createInfoWindowContent(body);	
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

    var dateCol = findDateCol(csvHeader, csvContent);
    var BadStations = checklastcall(csvContent, dateCol);
    console.log(BadStations);

	for (var row = 0; row < body.length - 1; row++) {
		//htmlCode += '<tr>';
		var latitude = 0;
		var longitude = 0;
		var temperature = 0;
        var markerColor = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
        if (BadStations.includes(body[row]) == true) {
            htmlCode += '<tr id ="highlight">';
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
		//console.log(-10 > temperature);
		//console.log(-temperature > -20);
		if(temperature <= -25){
			markerColor ='http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
		}
		if( (-10 > temperature )&&( temperature > -20)){
			//console.log("inside this other if");
			markerColor = 'http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png';
		}
		if(( 0 > temperature)&&(temperature > -10)){
			//console.log("im inside here ");
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
					infoWindow.setContent(infoWindowContent[row][0]);
					infoWindow.open(map,marker);
				}
			})(marker,row));
			
		
		htmlCode += '</tr>';
	}
	htmlCode += '</tbody>';
	htmlCode += '</table>';
	document.getElementById('content').innerHTML = htmlCode;
	console.log("initContent end.");
}

function clearMap() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers.length = 0;
}

function filterTemp(){
	console.log("inside filterTemp")
	time = new Date(time.getTime() + (10 * 60000));
	dt = time.toISOString().slice(0, 19).replace('T', ' ');
	document.getElementById('textDate').value = dt;
	callServerTemp(time);
	
}


function callServerTemp(filterTime){
	
	console.log("inside callserverTemp")
	console.log(filterTime) 
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
	console.log(req)
    xmlhttp.open("GET","http://localhost/serverFilterTemp.php" + req, true);
    findDateCol(csvHeader, csvContent);
    xmlhttp.send();
	

}

function filterVolt() {
    console.log("inside filterVolt")
    time = new Date(time.getTime() + (10 * 60000));
    dt = time.toISOString().slice(0, 19).replace('T', ' ');
    document.getElementById('textDate').value = dt;
    callServerVolt(time)
}

function callServerVolt(filterTime) {
    console.log("inside callServerVolt")
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
    console.log(req)
    xmlhttp.open("GET", "http://localhost/serverFilterVolt.php" + req, true);
    xmlhttp.send();
}

function filterHumid() {
    console.log("inside filterHumid")
    time = new Date(time.getTime() + (10 * 60000));
    dt = time.toISOString().slice(0, 19).replace('T', ' ');
    document.getElementById('textDate').value = dt;
    callServerHumid(time)
}

function callServerHumid(filterTime) {
    console.log("inside callServerHumid")
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
    console.log(req)
    xmlhttp.open("GET", "http://localhost/serverHumid.php" + req, true);
    var dateCol = findDateCol(csvHeader, csvContent);
    var BadStations = checklastcall(csvContent, dateCol);
    console.log(BadStations);
    xmlhttp.send();
}


function findDateCol(csvHeader, csvContent) {
    console.log("the csvheader is: " + csvHeader);
    console.log("the csvContent is: " + csvContent);
    for (var i = 0; i < csvHeader.length; i++) {
        console.log(csvHeader[i]);
        if (csvHeader[i] == "Date") {
            console.log("Found Date the counter is: " + i);
        }
    }
    return i
}

function checklastcall(csvContent, dateCol) {
    time = new Date(time.getTime());
    var ErrorStations = []
    for (var i = 0; i < csvContent.length-1; i++) {
        splitDateFormat = csvContent[i][8].split(" ");
        splitYearMonthDate = splitDateFormat[0].split("-");
        splitHourMinSec = splitDateFormat[1].split(":");
        if ((time.getFullYear() - splitYearMonthDate[0]) == 0) {
            if (((time.getMonth() + 1) - splitYearMonthDate[1]) == 0) {

                if ((time.getDate() - splitYearMonthDate[2]) == 0) {
                    if ((time.getHours() - splitHourMinSec[0]) == 0) {
                        console.log("the miniutes are going to be: " + splitHourMinSec[1]);
                        console.log(time.getUTCMinutes());
                        console.log(time.getMinutes() - splitHourMinSec[1]);
                        if ((time.getMinutes() - splitHourMinSec[1]) <= 10) {
                            console.log("inside here and the statointhat passed is: " + csvContent[i]);
                        }
                        else {
                            console.log("Error at station miniutes:" + csvContent[i][0]);
                            console.log(splitHourMinSec[1]);
                            console.log(time.getUTCMinutes());
                            ErrorStations.push(csvContent[i]);
                        }
                    }
                    else {
                        console.log("Error at station Hours :" + csvContent[i][0]);
                        console.log(splitHourMinSec[0]);
                        console.log(time.getHours());
                        ErrorStations.push(csvContent[i]);
                    }
                }
                else {
                    console.log("Error at station :" + csvContent[i][0]);
                    ErrorStations.push(csvContent[i]);

                }
            }   
            else {
                console.log("Error at station :" + csvContent[i][0]);
                ErrorStations.push(csvContent[i]);

            }
        }
        else {
            console.log("Error at station :" + csvContent[i][0]);
            ErrorStations.push(csvContent[i]);
        }
    }
    return ErrorStations;
}

function filterPM(){
	console.log("inside filterPM")
	time = new Date(time.getTime() + (10 * 60000));
	dt = time.toISOString().slice(0, 19).replace('T', ' ');
	document.getElementById('textDate').value = dt;
	callServerPM(time);
}

function filterShowAll() {
    console.log("inside filterShowAll")
    time = new Date(time.getTime() + (10 * 60000));
    dt = time.toISOString().slice(0, 19).replace('T', ' ');
    document.getElementById('textDate').value = dt;
    FilterType = "ShowAll"
    callServerTime(time,FilterType);
}
	  
function callServerPM(filterTime){
	console.log("inside callServerPM")
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
    xmlhttp.open("GET","http://localhost/serverFilterPM.php"+ req,true);
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
	console.log(data);
	csvData = data;
}



function stickyFunc(){
	if (window.pageYOffset >= sticky) {
		mapElement.classList.add("sticky");
 	} else {
		mapElement.classList.remove("sticky");
	}
}

function createContentString(station_number,temp,humididty,pmatter){
	var contentString = '<h1 class= "contentstring"> REMOTE STATION' + station_number + '</h1>'+
						'<p>Temperature: '+ temp + ' </p>'+
						'<p>Humididty: '+ humididty + ' </p>' +
                        '<p>Particulate matter: ' + pmatter + ' </p>';
        
	return contentString;
}



function createInfoWindowContent(data){
	var infoWindow = [];
	//console.log("inside createInfoWindowContent");
	//console.log('the lenght of hte data is ' + data.length);
	//console.log('that data at data[0]' + data[0][0] + ' ' + data[0][1] +' '+data[0][2] + ' '+data[0][3] +' '+data[0][4]);
	for (var i = 0; i < data.length; i ++){
		infoWindow.push([ '<h1>'+ data[i][0]+'</h1>' + 
		'<p>Latitude: ' + data[i][1] +'</p>' +
		'<p>Longitude: '+ data[i][2] +'</p>'+
		'<p>Temperature: '+data[i][3] +'</p>'+ 
		'<p>Particulate matter: '+data[i][4] +'</p>']);
		//console.log('printing the data inside for loop' + data[i] );
	}
	//console.log('the infoWindow is now' + infoWindow);
	return infoWindow;
}


function myFunction() {
	console.log("hello inside myFunction");
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
    console.log("FILTER TYPE IS : " + FilterType)
    var req = "?year=" + filterTime.getFullYear() + "&" +
        "month=" + (filterTime.getMonth() + 1) + "&" +
        "day=" + filterTime.getDate() + "&" +
        "hour=" + filterTime.getUTCHours() + "&" +
        "min=" + filterTime.getUTCMinutes() + "&" +
        "sec=" + filterTime.getUTCSeconds() + "&" +
        "filtertype=" + FilterType;
    console.log("inside callServerTime")
    //console.log(req)
    xmlhttp.open("GET","http://localhost/DateFilter.php" + req,true);
    xmlhttp.send();
}

function getNow(){
	timestamp = Date.parse( document.getElementById('textDate').value );
	if(isNaN(timestamp)==false)
	{
		time = parseDateString(document.getElementById('textDate').value)
		console.log(time)
        callServerTime(time, FilterType);
	}
	else
	{
		console.log(time)
		var dt = time.toISOString().slice(0, 19).replace('T', ' ');
		document.getElementById('textDate').value = dt;
	}
}

function getPrevDate()
{
	time = new Date(time - (10 * 60000));
	var dt = time.toISOString().slice(0, 19).replace('T', ' ');
	document.getElementById('textDate').value = dt;
	callServerTime(time,FilterType);	
}

function getNextDate()
{
	time = new Date(time.getTime() + (10 * 60000));
	dt = time.toISOString().slice(0, 19).replace('T', ' ');
    document.getElementById('textDate').value = dt;
    callServerTime(time, FilterType);	
}

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
	timerVal -= 1;
	
	if(timer <= 0){
		timerVal = timerInterval;
		callServer();
	}
	
	document.getElementById('timer').innerHTML = timer;
}
