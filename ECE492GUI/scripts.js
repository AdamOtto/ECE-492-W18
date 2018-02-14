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
	mapElement = document.getElementById("fixedDiv");
	sticky = mapElement.offsetTop;
	initContent();	
	console.log("init end.");
}

function createContentString(station_number,temp,humididty,pmatter){
	var contentString = '<h1 class= "contentstring"> REMOTE STATION' + station_number + '</h1>'+
						'<p>Temperature: '+ temp + ' </p>'+
						'<p>Humididty: '+ humididty + ' </p>' +
						'<p>Particulate matter: ' + pmatter +' </p>';
	return contentString;
}


function initMap() {
	var center = new google.maps.LatLng(53.5444,-113.4909);
	var mapProp= {
	    center:new google.maps.LatLng(53.5444,-113.4909),
	    zoom:5,
	};
	
//	var marker = new google.maps.Marker({position:center});
	
//	var infoWindowContent = [
//	['<h3> hello </h3>'],
//	['<h2>sup</h2>']];
	
	
	map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
	
	//var infoWindow = new google.maps.InfoWindow(),marker,i;
	
/*	var markers = [['Remote 1',53.5444,-113.4909],
				   ['Remote 2',53.5444,-130.4909]];
	int i 
	
	for(i = 0 ; i<markers.length;i++){
		var position = new google.maps.LatLng(markers[i][1],markers[i][2]);
		bounds.extend(position);
		var marker = new google.maps.Marker({
			position:position,
			map:map,
			title: markers[i][0]
		});
		
	google.maps.event.addListener(marker,'click',(function(marker,i){
		return function(){
			infoWindow.setContent(infoWindowContent[i][0]);
			infoWindow.open(map,marker);
		}
	}) (marker,i));
	
	map.fitBounds(bounds);

	*////}	
	
		var marker = new google.maps.Marker({
			position:center,
			map:map,
			title:'hello'
		});

		
 
	map.addListener('center_changed', function() {
          // 3 seconds after the center of the map has changed, pan back to the
          // marker.
          window.setTimeout(function() {
            map.panTo(marker.getPosition());
          }, 3000);
        });
	
	 var contentString = createContentString(1,190,20,39);
	
	
	

	
	
	var infowindow = new google.maps.InfoWindow({
    content: contentString
    });
	
	marker.addListener('click',function() {
		 infowindow.open(map, marker);
	});
	
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