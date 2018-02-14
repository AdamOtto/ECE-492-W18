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


function init(){
	console.log("init started...");
	window.onscroll = function() {stickyFunc()};
	mapElement = document.getElementById("fixedDiv");
	sticky = mapElement.offsetTop;
	initMap();
	parseData(csvData);
	initContent(csvHeader, csvContent);
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
function initContent(header, body) {
	//Code help from -> https://code.tutsplus.com/tutorials/parsing-a-csv-file-with-javascript--cms-25626
	console.log("initContent started...");
	var htmlCode = "<table>";
	var hlat;
	var hlon;
	document.getElementById('content').innerHTML = "";
	
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
	
	for (var row = 0; row < body.length; row++) {
		htmlCode += '<tr>';
		var latitude = 0;
		var longitude = 0;
		
		for (var rowCell = 0; rowCell < body[row].length; rowCell++) {
			if(rowCell == hlat)
				latitude = parseInt( body[row][rowCell] );
			if(rowCell == hlon)
				longitude = parseInt( body[row][rowCell] );
			htmlCode += '<td>';
			htmlCode += body[row][rowCell];
			htmlCode += '</td>';
		}

		console.log("Adding marker " + row + ": Lat: " + latitude + ", Long: " + longitude);
		var pos = new google.maps.LatLng(latitude, longitude);
		var mark = new google.maps.Marker({position:pos});
		mark.setMap(map);
		
		htmlCode += '</tr>';
	}
	htmlCode += '</tbody>';
	htmlCode += '</table>';
	document.getElementById('content').innerHTML = htmlCode;
	console.log("initContent end.");
}

function parseData(data)
{
	//var d1 = new Date(2017, 7, 24, 14, 52, 10);
	//var d2 = Date.parse("2018 Feb 13 2:34:55");
	var allRows = data.split(/\r?\n|\r/);
	for (var row = 0; row < allRows.length; row++) {
		var rowCells = allRows[row].split(',');
		if(row == 0)
			csvHeader = rowCells;
		else
			csvContent[row - 1] = rowCells;
	}
	console.log(csvHeader);
	console.log(csvContent);
	
	filterTable("Tempurature", "-20", "<")
}

/**
 FilterTable
 
 filters the contents of the csv file based on the arguments passed in.
 
 Arguments:  FilterTable takes in 3 strings as arguments.
 	filterKey: The header that we want to sort by. (This implementation will only allow simple, 1 value filtering.)
 	filterValue: The value that will be compared to the table content.
 	filterType: 
 			"=" : filterValue is equal to scvContent.
 			">=" : filterValue is greater than or equal to scvContent.
 			"<=" : filterValue is less than or equal to scvContent.
 			">" : filterValue is greater than scvContent.
 			"<" : filterValue is less than scvContent.
*/
function filterTable(filterKey, filterValue, filterType)
{
	var headerIndex = -1;
	var newTableContent = [];
	for(var i = 0; i < csvHeader.length; i++){
		if(filterKey === csvHeader[i])
		{
			headerIndex = i;
			break;
		}
	}
	if(headerIndex == -1) {
		console.log("Error: Couldn't find specific header to filter by.");
		return;
	}
	
	for(var i = 0; i < csvContent.length; i++){
		
		var filter;
		var content;
		
		if (filterKey === "Name"){
			filter = filterValue;
			content = csvContent[i][headerIndex];
		}
		else if(filterKey === "Date"){
			filter = Date.parse(filterValue);
			content = Date.parse(csvContent[i][headerIndex]);
		}
		else if(filterKey === "Tempurature" || filterKey === "Dust"){
			filter = parseInt(filterValue);
			content = parseInt(csvContent[i][headerIndex]);
		}
		
		switch(filterType) {
			case "=" :
				if(filter == content)
					newTableContent[newTableContent.length] = csvContent[i];
				break;
			case ">=" :
				if(filter >= content)
					newTableContent[newTableContent.length] = csvContent[i];
				break;
			case "<=" :
				if(filter <= content)
					newTableContent[newTableContent.length] = csvContent[i];
				break;
			case ">" :
				if(filter > content)
					newTableContent[newTableContent.length] = csvContent[i];
				break;
			case "<" :
				if(filter < content)
					newTableContent[newTableContent.length] = csvContent[i];
				break;
		}
	}
	
	console.log(newTableContent);
}

/**
 * 
 * 
 * Loads the latest data of the csv file.  Assumes the most recent data is appended to the end of the file.
 */
function LoadLatestData()
{
	
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
