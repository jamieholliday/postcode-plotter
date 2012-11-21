(function(){
	var geocoder, mapOptions, map, submitPoint, output;

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

	var plotPoint = function(postcode){
		geocoder.geocode({'address' : postcode}, function(results, status){
			if(status == google.maps.GeocoderStatus.OK){
				// map.setCenter(results[0].geometry.location);
				// map.setZoom(6);
				var marker = new google.maps.Marker({
					map: map,
					position: results[0].geometry.location
				});
				// var circle = new google.maps.Circle({
				// 	map: map,
				// 	center: results[0].geometry.location,
				// 	radius: 10000, 
				// 	fillOpacity: 0.3,
				// 	fillColor: '#cc0033',
				// 	strokeOpacity: 0
				// });
			} else {
				console.log("geocode unsucessfull" + status);
			}
		});
	}

	var showPostcodes = function(){

		 var titles = output[0],
		 	i = 0,
		 	list = [],
		 	listHolder;

		 for (; i < titles.length; i++) {
		 	list.push('<li data-id="'+ i + '">' + titles[i] + '</li>');
		 }

		 listholder = document.getElementById('postcodes');
		 listholder.innerHTML = "<p>Select which field to use</p>";
		 listholder.innerHTML += '<ul>' + list.join('') + '</ul>';
		 listholder.addEventListener('click', onListClick, true);
	}

	function onListClick(e){
		var id = parseInt(e.target.getAttribute('data-id'));
		var	i = 1, 
			len = output.length;

		 for (; i < len; i++) {
		 	if(output[i][id] !== "" || output[i][id] !== undefined){
		 		var postcode = output[i][id];
		 		plotPoint(postcode);
		 		console.log(postcode);
		 	}
		 }
		 document.getElementById('postcodes').innerHTML = '';
		 document.getElementById('upload').value = '';
	}

	// csv parser
	// @attribution : http://www.greywyvern.com/?post=258
	var parseCSV = function(s,sep) {
            // http://stackoverflow.com/questions/1155678/javascript-string-newline-character
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