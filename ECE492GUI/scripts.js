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

function initMap() {
	var center = new google.maps.LatLng(53.5444,-113.4909);
	var mapProp= {
	    center:new google.maps.LatLng(53.5444,-113.4909),
	    zoom:5,
	};
//	var marker = new google.maps.Marker({position:center});
	
	map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
	
	var marker = new google.maps.Marker({
      position: center,
      map: map,
      title: 'Click to zoom'
        });
	
	map.addListener('center_changed', function() {
          // 3 seconds after the center of the map has changed, pan back to the
          // marker.
          window.setTimeout(function() {
            map.panTo(marker.getPosition());
          }, 3000);
        });
	
	 var contentString = 'remote station 1';
	
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