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
var csvHeaders = [];
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
	initContent(csvData);
	test(csvData);
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


function initContent(data) {
	//Code help from -> https://code.tutsplus.com/tutorials/parsing-a-csv-file-with-javascript--cms-25626
	console.log("initContent started...");
	var htmlCode = "<table>";
	var allRows = data.split(/\r?\n|\r/);
	
	for (var row = 0; row < allRows.length; row++) {
		if (row === 0) {
			htmlCode += '<thead>';
			htmlCode += '<tr>';
		}
		else {
			htmlCode += '<tr>';
		}
		
		var rowCells = allRows[row].split(',');
		var latitude = 0;
		var longitude = 0;
		for (var rowCell = 0; rowCell < rowCells.length; rowCell++) {
			if (row === 0) {
				htmlCode += '<th>';
				htmlCode += rowCells[rowCell];
				htmlCode += '</th>';
			} else {
				if(row != 0){
					if(rowCell == 1)
						latitude = parseInt( rowCells[rowCell] );
					if(rowCell == 2)
						longitude = parseInt( rowCells[rowCell] );
					}
					htmlCode += '<td>';
					htmlCode += rowCells[rowCell];
					htmlCode += '</td>';
			}
		}
		if(row != 0){
			console.log("Adding marker " + row + ": Lat: " + latitude + ", Long: " + longitude);
			var pos = new google.maps.LatLng(latitude, longitude);
			var mark = new google.maps.Marker({position:pos});
			mark.setMap(map);
		}
		
		if (row === 0) {
			htmlCode += '</tr>';
			htmlCode += '</thead>';
			htmlCode += '<tbody>';
		} else {
		  htmlCode += '</tr>';
		}
	}
	htmlCode += '</tbody>';
	htmlCode += '</table>';
	document.getElementById('content').innerHTML = htmlCode;
	console.log("initContent end.");
}

function test(data)
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

/*
 FilterTable
 
 Arguments:  FilterTable takes in 3 strings as arguments.
 	filterKey: The header that we want to sort by. (This implementation will only allow simple, 1 value filtering.)
 	filterValue: The value that will be compared to the table content.
 	filterType: 
 			"=" : filterValue is equal to scvContent.
 			">=" : filterValue is greater than or equal to scvContent.
 			"<=" : filterValue is less than or equal to scvContent.
 			">" : filterValue is greater than scvContent.
 			"<" : filterValue is less than scvContent.
 * */
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
