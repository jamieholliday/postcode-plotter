// csv parser
// @attribution : http://www.greywyvern.com/?post=258
// http://stackoverflow.com/questions/1155678/javascript-string-newline-character

//map markers
//@attribution : http://www.benjaminkeen.com/google-maps-coloured-markers/


(function(){
	var geocoder, mapOptions, map, submitPoint, output;

	//localStorage.clear();

	mapOptions = {
		center: new google.maps.LatLng(53.722, -2.856),
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	map = new google.maps.Map(document.getElementById("mapCanvas"), mapOptions);

	geocoder = new google.maps.Geocoder();

	submitPoint = document.getElementById('submitPostcode');

	submitPoint.addEventListener('click', function(e){
		var postcode = document.getElementById('postcode');
		plotPoint(postcode.value);
		postcode.value = '';
		e.preventDefault = true;
		return false;
	});

	var upload = document.getElementById('upload');
	upload.addEventListener('change', function(e){
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
		 	list = [],
		 	listHolder;

		 for (; i < titles.length; i++) {
		 	list.push('<li class="btn" data-id="'+ i + '">' + titles[i] + '</li>');
		 }

		 listholder = document.getElementById('postcodes');
		  var selection = '<div class="alert alert-info"><p>Select which field to use:</p>'
		 + '<ul>' + list.join('') + '</ul>'
		 +'</div>';
		 
		 listholder.innerHTML = selection;
		 listholder.addEventListener('click', onListClick, true);
	}

	function onListClick(e){
		var id = parseInt(e.target.getAttribute('data-id'));
		var	i = 1, 
			len = output.length;

		 for (; i < len; i++) {
		 	if(output[i][id] !== "" || output[i][id] !== "undefined"){
		 		var postcode = output[i][id];
		 		plotPoint(postcode);
		 	}
		 }

		 //clear fields
		 document.getElementById('postcodes').innerHTML = '';
		 document.getElementById('upload').value = '';
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


})();
