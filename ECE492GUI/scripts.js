/**
 * @author adamo
 */

var map;
//window.onscroll = function() {stickyFunc()};
var mapElement;
var sticky;


function init(){
	console.log("init started...");
	window.onscroll = function() {stickyFunc()};
	mapElement = document.getElementById("googleMap");
	sticky = mapElement.offsetTop;
	initContent();	
	console.log("init end.");
}

function initMap() {
	var center = new google.maps.LatLng(53.5444,-113.4909);
	var mapProp= {
	    center:new google.maps.LatLng(53.5444,-113.4909),
	    zoom:5,
	};
	var marker = new google.maps.Marker({position:center});
	
	map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
	
	marker.setMap(map);
}


function initContent() {
	console.log("initContent started...");
	var htmlCode = "";
	
	for(var i = 0; i < 100; i++)
	{		
		htmlCode += "<p>Content goes here.</p>";
	}
	
	document.getElementById('content').innerHTML = htmlCode;
	console.log("initContent end.");
}

function stickyFunc(){
	if (window.pageYOffset >= sticky) {
		mapElement.classList.add("sticky");
 	} else {
		mapElement.classList.remove("sticky");
	}
}
