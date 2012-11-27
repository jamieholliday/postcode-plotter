// csv parser
// @attribution : http://www.greywyvern.com/?post=258
// http://stackoverflow.com/questions/1155678/javascript-string-newline-character

//map markers
//@attribution : http://www.benjaminkeen.com/google-maps-coloured-markers/


(function($){
	var canvas, geocoder, mapOptions, map, submitPoint, output;

	//localStorage.clear();

	mapOptions = {
		center: new google.maps.LatLng(53.722, -2.856),
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	canvas = $("#mapCanvas");

	map = new google.maps.Map(canvas[0], mapOptions);

	geocoder = new google.maps.Geocoder();

	submitPoint = $('#submitPostcode');

	submitPoint.on('click', function(e){
		var postcode = $('#postcode');
		plotPoint(postcode.val());
		postcode.val('');
		return false;
	});

	var upload = $('#upload');
	upload.on('change', function(e){
		var file = e.target.files[0];

		var reader = new FileReader();

		reader.readAsText(file);

		reader.onload = function(e){
			output = parseCSV(e.target.result);
			showPostcodes();
		}		

	});

	var plotPoint = function(postcd){
		//check if postcode is stored in local storage
		var postcode,
			latlong,
			marker,
			coords;

		if (postcd){
			postcode = postcd.toLowerCase();
		}

		if (supports_html5_storage()){
			var localPostcode = localStorage[postcode];
			if(localPostcode){
				coords = JSON.parse(localPostcode)
				latlong = new google.maps.LatLng(coords.lat, coords.lng);

				console.log(latlong);
				addMarker(latlong);
			} else {
				geocode(postcode);
			}
			
		} else {
			geocode(postcode);
		}
	}

	var geocode = function(postcode){
		geocoder.geocode({'address' : postcode}, function(results, status){
				if(status == google.maps.GeocoderStatus.OK){
					var lat = results[0].geometry.location.lat();
					var lng = results[0].geometry.location.lng();
					var obj = {};
					obj.lat = lat;
					obj.lng = lng;

					addMarker(results[0].geometry.location);

					localStorage[postcode] = JSON.stringify(obj);
				} else {
					console.log("geocode unsucessfull: " + status);
				}
			});
	}

	var supports_html5_storage = function() {
	  try {
	    return 'localStorage' in window && window['localStorage'] !== null;
	  } catch (e) {
	    return false;
	  }
	}

	var addMarker = function(loc){
		// map.setCenter(results[0].geometry.location);
		// map.setZoom(6);
		console.log("loc " + loc);
		var marker = new google.maps.Marker({
			map: map,
			position: loc,
			icon: 'img/blue_MarkerA.png'
		});
	}

	var showPostcodes = function(){
		 var titles = output[0],
		 	i = 0,
		 	list = [];

		 for (; i < titles.length; i++) {
		 	// list.push('<li class="btn" data-id="'+ i + '">' + titles[i] + '</li>');
		 	list.push('<option value="'+ i +'">' + titles[i] + '</option>');
		 }

		 listholder = $('#postcodes');

		  var selectPostcode = '<div class="alert alert-info"><p>Select which field to use for postcode:</p>'
		 + '<select name="postcodes">' + list.join('') + '</select>'
		 +'<p>Select which field to use to group markers:</p>'
		 + '<select name="group">' + list.join('') + '</select>'
		 + '<button type="button" class="btn btn-small">SELECT</button>'
		 +'</div>';
		 
		 listholder.html(selectPostcode);

		 var select1 = $('#postcodes select[name="postcodes"]');
		 var select2 = $('#postcodes select[name="group"]');
		 
		 listholder.find('button').on('click', function(e){

		 	var id = parseInt(select1.val());
			var	i = 1, 
			len = output.length;

		 for (; i < len; i++) {
		 	if(output[i][id] !== "" || output[i][id] !== "undefined"){
		 		var postcode = output[i][id];
		 		plotPoint(postcode);
		 	}
		 }

		 //clear fields
		 listholder.html('');
		 
		 });
	}

	var parseCSV = function(s,sep) {
            var universalNewline = /\r\n|\r|\n/g;
            var a = s.split(universalNewline);
            for(var i in a){
                for (var f = a[i].split(sep = sep || ","), x = f.length - 1, tl; x >= 0; x--) {
                    if (f[x].replace(/"\s+$/, '"').charAt(f[x].length - 1) == '"') {
                        if ((tl = f[x].replace(/^\s+"/, '"')).length > 1 && tl.charAt(0) == '"') {
                            f[x] = f[x].replace(/^\s*"|"\s*$/g, '').replace(/""/g, '"');
                          } else if (x) {
                        f.splice(x - 1, 2, [f[x - 1], f[x]].join(sep));
                      } else f = f.shift().split(sep).concat(f);
                    } else f[x].replace(/""/g, '"');
                  } a[i] = f;
        }
        return a;
    }


})(jQuery);

// var markers = new Array(); 
//     var locations = [
//       ['Bondi Beach', 'Some text goes here<br />text', 'Walk', -33.890542, 151.274856, 4],
//       ['Coogee Beach', 'Some text goes here<br />text', 'Fish', -33.923036, 151.259052, 5],
//       ['Cronulla Beach', 'Some text goes here<br />text', 'Fish', -34.028249, 151.157507, 3],
//       ['Manly Beach', 'Some text goes here<br />text', 'Walk', -33.80010128657071, 151.28747820854187, 2],
//       ['Maroubra Beach', 'Some text goes here<br />text', 'Walk', -33.950198, 151.259302, 1]
//     ];

//     var map = new google.maps.Map(document.getElementById('mapCanvas'), {
//       zoom: 10,
//       center: new google.maps.LatLng(-33.92, 151.25),
//       mapTypeId: google.maps.MapTypeId.ROADMAP
//     });

//     var infowindow = new google.maps.InfoWindow();

//     var marker, i;

//     for (i = 0; i < locations.length; i++) {  
//       marker = new google.maps.Marker({
//         position: new google.maps.LatLng(locations[i][3], locations[i][4]),
//         map: map
//       });
        
//         markers.push(marker);
        
//       google.maps.event.addListener(marker, 'click', (function(marker, i) {
//         return function() {
//           infowindow.setContent(locations[i][0]+"<br />"+locations[i][2]+"<br />"+locations[i][1]);
//           infowindow.open(map, marker);
//         }
//       })(marker, i));
//     }
    
    
    

//     // == shows all markers of a particular category, and ensures the checkbox is checked ==
//       function show(category) {
//         for (var i=0; i<locations.length; i++) {
//           if (locations[i][2] == category) {
//             markers[i].setVisible(true);
//           }
//         }
//       }

//       // == hides all markers of a particular category, and ensures the checkbox is cleared ==
//       function hide(category) {
//         for (var i=0; i<locations.length; i++) {
//           if (locations[i][2] == category) {
//             markers[i].setVisible(false);
//           }
//         }
//       }
      
//       // == show or hide the categories initially ==
//         show("Walk");
//         hide("Fish");  

