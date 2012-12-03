// csv parser
// @attribution : http://www.greywyvern.com/?post=258
// http://stackoverflow.com/questions/1155678/javascript-string-newline-character

//map markers
//@attribution : http://www.benjaminkeen.com/google-maps-coloured-markers/


// (function($){
	var canvas, geocoder, mapOptions, map, submitPoint, output, groups, markers, geocodeQue, postcodesTable, markerList, markerListToggle, groupToggle, upload;

	//localStorage.clear();

	geocodeQue = [];

	mapOptions = {
		center: new google.maps.LatLng(53.722, -2.856),
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	markers = [
		{markerName:'marker1', file:'blue_Marker'},
		{markerName:'marker2', file:'brown_Marker'},
		{markerName:'marker3', file:'darkgreen_Marker'},
		{markerName:'marker4', file:'green_Marker'},
		{markerName:'marker5', file:'orange_Marker'},
		{markerName:'marker6', file:'paleblue_Marker'},
		{markerName:'marker7', file:'pink_Marker'},
		{markerName:'marker8', file:'purple_Marker'},
		{markerName:'marker9', file:'red_Marker'},
		{markerName:'marker10', file:'yellow_Marker'}
	];

	groups = [];

	//cached selectors
	canvas = $("#mapCanvas");
	submitPoint = $('#postcodeForm');
	postcodesTable = $('#mapControls table');
	markerList = $('#mapControls #markerListWrapper');
	markerListToggle = $('#mapControls #markerToggle');
	groupToggle = $('#mapControls #groupToggle');
	upload = $('#upload');


	map = new google.maps.Map(canvas[0], mapOptions);

	geocoder = new google.maps.Geocoder();

	submitPoint.on('submit', function(e){
		var postcode = $('#postcode');
		// if(postcode.val() == ''){
		// 	return false;
		// }
		plotPoint(postcode.val(), "none");
		postcode.val('');
		processGeocodeQue();
		return false;
	});

	markerListToggle.on('click', function(){
		var i = $(this).find('i');
		if(i.hasClass('icon-minus')){
			i.removeClass('icon-minus').addClass('icon-plus');
		} else {
			i.removeClass('icon-plus').addClass('icon-minus');
		}
	});

	upload.on('change', function(e){
		var file = e.target.files[0];

		var reader = new FileReader();

		reader.readAsText(file);

		reader.onload = function(e){
			output = parseCSV(e.target.result);
			showPostcodes();
		}		
		upload.val('');
	});

	groupToggle.on('click', function(e){
		var btn = $(e.target).closest('button'),
			tbl = btn.attr('data-group');
		btn.toggleClass('faded');
		postcodesTable.find('#'+tbl).toggleClass('faded');

		for (var i = 0; i < groups.length; i++) {
			if(groups[i].id === tbl){
				for(var j=0; j<groups[i].allMarkers.length; j++){
					if(groups[i].allMarkers[j].getVisible()){
						groups[i].allMarkers[j].setVisible(false);
					} else {
						groups[i].allMarkers[j].setVisible(true);
					}
				}
			}
		};

	});

	var plotPoint = function(postcd, group){
		//check if postcode is stored in local storage
		var postcode,
			latlong,
			marker,
			coords;

		if (postcd){
			postcode = postcd.toString().toLowerCase();
		}

		if (supports_html5_storage()){
			var localPostcode = localStorage[postcode];
			if(localPostcode){
				coords = JSON.parse(localPostcode)
				latlong = new google.maps.LatLng(coords.lat, coords.lng);

				addMarker(latlong, group, postcd);
			} else {
				if(group){
					geocodeQue.push({pc:postcode, grp:group});
				} else{
					geocode(postcode);
				}	
			}
			
		} else {
			if(group){
				geocodeQue.push({pc:postcode, grp:group});
			} else{
				geocode(postcode);
			}
		}
	}

	var geocode = function(postcode, group){
		geocoder.geocode({'address' : postcode}, function(results, status){
				if(status == google.maps.GeocoderStatus.OK){
					var lat = results[0].geometry.location.lat();
					var lng = results[0].geometry.location.lng();
					var obj = {};
					obj.lat = lat;
					obj.lng = lng;

					addMarker(results[0].geometry.location, group, postcode);

					localStorage[postcode] = JSON.stringify(obj);
				} else {
					console.log("geocode unsucessfull: " + status);
				}
			});
	}

	var processGeocodeQue = function(){
		//stagger geocode requests to avoid Google over use limit 1s per request seems the right amount
		var i,
			len = geocodeQue.length;

		for(i=0; i<len; i+=1){
			var multiplier = i*1000;
			if(geocodeQue[i].pc && geocodeQue[i].grp){
				setTimeout(shuttle, multiplier, [geocodeQue[i].pc, geocodeQue[i].grp]);
			}
		}
		geocodeQue = []; //empty the array after processing the que
	}

	var shuttle = function(args){
		geocode(args[0], args[1]);
	}

	var supports_html5_storage = function() {
	  try {
	    return 'localStorage' in window && window['localStorage'] !== null;
	  } catch (e) {
	    return false;
	  }
	}

	var addMarker = function(loc, grouper, postcode){
		var newGroup = true,
			marker = "",
			len,
			mk,
			ingroup = false,
			grouper = $.trim(grouper).toLowerCase();
			console.log(grouper+"xxx");

			len = groups.length;
			for (var i = 0; i < len; i++) {
				if(groups[i].id === grouper){
					marker = groups[i].marker;
					mk = makeMarker(loc, marker+'.png');
					addTableRow(postcode, grouper, marker);
					groups[i].allMarkers.push(mk);
					ingroup = true;
					break;
				}
			}
			if(!ingroup){
				groups.push({
					id:grouper,
					marker : markers[groups.length].file,
					markerName : markers[groups.length].markerName,
					allMarkers : []
				});
				marker = groups[groups.length - 1];
				groupToggle.append('<li><button data-group="'+grouper+'" class="btn btn-mini"><div class="group-color '+marker.markerName+'"></div></button></li>');
				postcodesTable.append('<tbody id="'+grouper+'"></tbody>');
				mk = makeMarker(loc, marker.marker+'.png');
				addTableRow(postcode, grouper, marker.marker);
				groups[groups.length - 1].allMarkers.push(mk);
			}

		markerList.removeClass('hidden');	
	}

	var makeMarker = function(loc, marker){
		//console.log('marker: ' + marker);
		if(marker === 'undefined'){
			//if we run out of markers make them the default color
			marker = markers[0].file;
		}
		var mapMarker = new google.maps.Marker({
			map: map,
			position: loc,
			icon: 'img/' + marker
		});
		return mapMarker;
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
		 		var grp = parseInt(select2.val());
		 		plotPoint(postcode, output[i][grp]);
		 	}
		 }

		 processGeocodeQue(); //proccess all the items that need geogoding

		 //clear fields
		 listholder.html('');
		 
		 });
	}

	var addTableRow = function(postcode, grouper, marker){
		var img = '<img src="img/'+marker+'_sml.png" alt="map marker"/>',
			grouper = grouper.toLowerCase();
			tb = postcodesTable.find('#'+grouper);
		tb.append('<tr><td>'+postcode.toUpperCase()+'</td><td>'+grouper+'</td><td>'+img+'</td></tr>');
	}

	var updateTable = function(){

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

// })(jQuery);

// var markers = new Array(); 
//     var locations = [
//       ['Bondi Beach', 'Some text goes here<br />text', 'Walk', -33.890542, 151.274856, 4],
//       ['Coogee Beach', 'Some text goes here<br />text', 'Fish', -33.923036, 151.259052, 5],
//       ['Cronulla Beach', 'Some text goes here<br />text', 'Fish', -34.028249, 151.157507, 3],
//       ['Manly Beach', 'Some text goes here<br />text', 'Walk', -33.80010128657071, 151.28747820854187, 2],
//       ['Maroubra Beach', 'Some text goes here<br />text', 'Walk', -33.950198, 151.259302, 1]
//     ];

    
    

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

