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
				
				if(rowCell == 1)
					latitude = parseInt( rowCells[rowCell] );
				if(rowCell == 2)
					longitude = parseInt( rowCells[rowCell] );
				htmlCode += '<td>';
				htmlCode += rowCells[rowCell];
				htmlCode += '</td>';
			}
		}
		var pos = new google.maps.LatLng(latitude, longitude);
		var mark = new google.maps.Marker({position:pos});
		mark.setMap(map);
		
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
