// This sample uses the Autocomplete widget to help the user select a
// place, then it retrieves the address components associated with that
// place, and then it populates the form fields with those details.
// This sample requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script
// src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
let placeSearch;
let autocomplete;

//Make sure modal window is shown only once
var modalCount = 0;

const componentForm = {
	street_number: "short_name",
	route: "long_name",
	locality: "long_name",
	administrative_area_level_1: "long_name",
	administrative_area_level_2: "short_name",
	country: "long_name",
	postal_code: "short_name"
};

function initAutocomplete() {
	// Create the autocomplete object, restricting the search predictions to
	// geographical location types.
	autocomplete = new google.maps.places.Autocomplete(
		document.getElementById("Autocomplete"),
		{ types: ["address"] }
	);

	// Set initial restrict to just the US and US territories
	autocomplete.setComponentRestrictions({
		country: ["us", "pr", "vi", "gu", "mp"]
	});

	// Avoid paying for data that you don't need by restricting the set of
	// place fields that are returned to just the address components.
	autocomplete.setFields(["address_components", "geometry", "place_id"]);

	// When the user selects an address from the drop-down, populate the
	// address fields in the form.
	autocomplete.addListener("place_changed", fillInAddress);
}

function fillInAddress() {
	// Get the place details from the autocomplete object.
	const place = autocomplete.getPlace();
	var lat = place.geometry.location.lat();
	var lng = place.geometry.location.lng();

	for (const component in componentForm) {
		document.getElementById(component).value = "";
		document.getElementById(component).disabled = false;
	}

	// Get each component of the address from the place details,
	// and then fill-in the corresponding field on the form.
	for (const component of place.address_components) {
		const addressType = component.types[0];

		if (componentForm[addressType]) {
			const val = component[componentForm[addressType]];
			document.getElementById(addressType).value = val;
		}
	}

	var center = {lat: lat, lng: lng};

	// var map = new google.maps.Map(document.getElementById('map'), {
	//   zoom: 10,
	//   center: center
	// });

	//var theURL = 'https://franklinproject.azurewebsites.net/api/FranklinProjectNearestLocation?Lat=' + lat + "&Lng=" + lng + "&Locality=" + document.getElementById("locality").value + "&County=" + document.getElementById("administrative_area_level_2").value + "&State=" + document.getElementById("administrative_area_level_1").value ;
	var theURL = 'https://wevotesafelylocationfunction.azurewebsites.net/api/FranklinProjectNearestLocation?Lat=' + lat + "&Lng=" + lng + "&Locality=" + document.getElementById("locality").value + "&County=" + document.getElementById("administrative_area_level_2").value + "&State=" + document.getElementById("administrative_area_level_1").value ;
	retrieveNearestLocations(lat, lng, theURL);
}

// Do NOT bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function nogeolocate() {
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 10
	});
}


// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			const geolocation = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			const circle = new google.maps.Circle({
				center: geolocation,
				radius: position.coords.accuracy
			});
			autocomplete.setBounds(circle.getBounds());
		});
	}
}


function autoQueryMap(lat, lng) {

	var geocodeURL = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&key=AIzaSyD2payJm4Ynu0DcdCo9AfaXZTPCUEmUt4k';
	var geocodeResults;

	var xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4

			if (xmlhttp.status == 200) {
				//document.getElementById("rawOutput").innerHTML = xmlhttp.responseText;
				geocodeResults = JSON.parse(xmlhttp.responseText);

				//get the address components for the first (closest) match to the lat/long
				var addresscomponents = geocodeResults.results[0].address_components;

				for (const component in componentForm) {
					document.getElementById(component).value = "";
					document.getElementById(component).disabled = false;
				}

				// Get each component of the address from the geocoded details,
				// and then fill-in the corresponding field on the form.
				for (const component of addresscomponents) {
					const addressType = component.types[0];

					if (componentForm[addressType]) {
						const val = component[componentForm[addressType]];
						document.getElementById(addressType).value = val;
					}
				}

				//var theURL = 'https://franklinproject.azurewebsites.net/api/FranklinProjectNearestLocation?Lat=' + lat + "&Lng=" + lng + "&Locality=" + document.getElementById("locality").value + "&County=" + document.getElementById("administrative_area_level_2").value + "&State=" + document.getElementById("administrative_area_level_1").value ;
				var theURL = 'https://wevotesafelylocationfunction.azurewebsites.net/api/FranklinProjectNearestLocation?Lat=' + lat + "&Lng=" + lng + "&Locality=" + document.getElementById("locality").value + "&County=" + document.getElementById("administrative_area_level_2").value + "&State=" + document.getElementById("administrative_area_level_1").value ;
				retrieveNearestLocations(lat, lng, theURL);
			}
			else if (xmlhttp.status == 400) {
				alert('There was an error (400) when searching for safe voting locations. Please try again.');
			}
			else {
				alert('There was an error when searching for safe voting locations. Please try again.');
			}
		}
	}

	xmlhttp.open("GET", geocodeURL, true);
	xmlhttp.send();

}


// Retrieve the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function onDemandGeolocate() {

	document.getElementById("main_body").classList.add("loading");

	if (navigator && navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position => {
			document.getElementById("Autocomplete").value = '';
			autoQueryMap(position.coords.latitude, position.coords.longitude);
		}, showGeolocationError);
	} else {
		alert("We are unable to automatically determine your location. In order to find your nearest safe voting locations, please type your home address in the text box on the page.");
	}

	document.getElementById("main_body").classList.remove("loading");
}

function showGeolocationError(error) {
	switch(error.code) {
		case error.PERMISSION_DENIED:
			alert("In order to find your nearest safe voting locations, we need to know where you are. Please either approve the use of location services by this device/application or type your home address in the text box on the page.");
			break;
		case error.POSITION_UNAVAILABLE:
			alert("We are unable to automatically determine your location. In order to find your nearest safe voting locations, please either try again or type your home address in the text box on the page.");
			break;
		case error.TIMEOUT:
			alert("Our attempts to automatically determine your location have timed out. In order to find your nearest safe voting locations, please either try again or type your home address in the text box on the page.");
			break;
		case error.UNKNOWN_ERROR:
			alert("An unknown error has occurred in trying to automatically determine your location. In order to find your nearest safe voting locations, please either try again or type your home address in the text box on the page.");
			break;
	}
}

function retrieveNearestLocations(lat, lng, theURL) {

	document.getElementById("main_body").classList.add("loading");
	var xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
			document.getElementById("main_body").classList.remove("loading");
			if (xmlhttp.status == 200) {
				//document.getElementById("rawOutput").innerHTML = xmlhttp.responseText;
				initMapWithLocations(lat, lng, JSON.parse(xmlhttp.responseText));
				if (modalCount == 0) setTimeout(() => { modal.style.display = "block"; }, 15000);
					modalCount++;
				}
			else if (xmlhttp.status == 400) {
				alert('There was an error 400');
			}
			else {
				alert('something else other than 200 was returned' + xmlhttp.status);
			}
		}
	};


	xmlhttp.open("GET", theURL, true);
	xmlhttp.send();
}

function initMapWithLocations(lat, lng, locationDetails) {

	document.getElementById("errorMessage").innerHTML = '';
	document.getElementById("stateMessage").innerHTML = '';
	document.getElementById("countyMessage").innerHTML = '';

	var errorMessage = locationDetails[0].ErrorMessage;
	document.getElementById("errorMessage").innerHTML = (typeof errorMessage === 'undefined' ? '' : errorMessage);

	var stateMessage = locationDetails[0].StateMessage;
	document.getElementById("stateMessage").innerHTML = (typeof stateMessage === 'undefined' ? '' : stateMessage);

	var countyMessage = locationDetails[0].tblCounties[0].CountyMessage;
	document.getElementById("countyMessage").innerHTML = (typeof countyMessage === 'undefined' ? '' : countyMessage);

	var dropOffLocationAddresses = document.getElementById('dropOffLocationAddresses');
	if (dropOffLocationAddresses != null) {
		dropOffLocationAddresses.innerHTML = 'Your nearest ballot dropoff locations are as follows:<ul>';
	}

	alterVisibilitiesAfterSearch();

	var center = {lat: lat, lng: lng};
	var bounds  = new google.maps.LatLngBounds();

	var map = new google.maps.Map(document.getElementById('map'), {
		zoomControl: false,
		streetViewControl: false,
		mapTypeControl: false,
		center: center
	});

	var locations = locationDetails[0].tblCounties[0].tblDropOffLocations;
	var thisLocation;
	var infowindow =  new google.maps.InfoWindow({});
	var marker, count;
	var markerContent = [];

	//add the location markers and infowindows
	for (count = 0; count < locations.length; count++) {
		markerContent[count] = '<div class="gm-style-iw-mod">' + (locations[count].DropOffLocationAddressPre == '' ? '' : '<strong>' + locations[count].DropOffLocationAddressPre + '</strong><br/>') + (locations[count].DropOffLocationAddress == '' ? '' : createGoogleMapsLink(locations[count].DropOffLocationAddress) + '<br/>') + (locations[count].DropOffLocationType == '' ? '' : '<strong>Location Type:</strong> ' + locations[count].DropOffLocationType) + (locations[count].DropOffLocationPhoneNumber == '' ? '' : '<br/><strong>Phone Number:</strong> ' + locations[count].DropOffLocationPhoneNumber) + (locations[count].DropOffLocationHours == '' ? '' : '<br/><strong>Hours of Operation:</strong> ' + locations[count].DropOffLocationHours) + (locations[count].DropOffLocationNotes == '' ? '' : '<br/><strong>Notes:</strong> ' + locations[count].DropOffLocationNotes) + '<br/>' + createGenericLink('Verify this from the original source', locations[count].DropOffLocationSourceURL) + '</div>';
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(locations[count].DropOffLocationLat, locations[count].DropOffLocationLong),
			map: map,
			title: locations[count].DropOffLocationAddress});
		thisLocation = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
		bounds.extend(thisLocation);

		google.maps.event.addListener(marker, 'click', (function (marker, count) {
			return function () {
				infowindow.setContent(markerContent[count]);
				infowindow.open(map, marker);
			}
		})(marker, count));

		//optional: extend the map to include the current location if/when the current location is outside the bounds of the locations
		bounds.extend(new google.maps.LatLng(lat, lng));

		map.fitBounds(bounds);       // auto-zoom
		map.panToBounds(bounds);     // auto-center

		if (dropOffLocationAddresses != null) {
			dropOffLocationAddresses.innerHTML += ('<li><strong>' + locations[count].DropOffLocationAddress + '</strong>' + (locations[count].DropOffLocationHours == '' ? '' : ' - ' + locations[count].DropOffLocationHours) + '</li>');
		}
	}

	if (dropOffLocationAddresses != null) {
		dropOffLocationAddresses.innerHTML += ('</ul>');
	}

	// alert(countyMessage);

	//add the home (you are here) marker last so that it is never covered up by other locations
	var homeMarker = new google.maps.Marker({
		map: map,
		position: {lat: lat, lng: lng},
		title: 'YOU ARE HERE',
		zIndex: 9999999,
		icon: {
			url: "https://wevotesafely.org/img/star.png",
		}
	});
}

function createGoogleMapsLink (theAddress) {
	return createGenericLink ('Get directions to ' + theAddress, 'https://www.google.com/maps/dir/?api=1&destination=' + theAddress.replace(" ", "+"));
}

function createGenericLink (theText, theURL) {
	return '<a target="_blank" href="' + theURL + '">' + theText + '</a>';
}

function removeClass(theElement, theClass) {
	var element = document.getElementById(theElement);
	/*element.classList.remove("mystyle");*/
	alert('1');
	element.className = element.className.replace(/\b + theClass + \b/g, "");
	alert('2');
}

function addClass(theElement, theClass) {
	var element, name, arr;
	element = document.getElementById(theElement);
	name = "mystyle";
	arr = element.className.split(" ");
	if (arr.indexOf(theClass) == -1) {
		element.className += " " + theClass;
	}
}

function alterVisibilitiesAfterSearch() {
	document.getElementById("TopBox").classList.add("hiddenAfterSearch");
	document.getElementById("printThis").classList.remove("hiddenBeforeSearch");
	document.getElementById("countyMessage").classList.remove("hiddenBeforeSearch");
	document.getElementById("countyMessage").classList.add("countyMessageFormatted");
	document.getElementById("TopBoxAfterSearch").classList.remove("hiddenBeforeSearch");
	document.getElementById("map").classList.remove("hiddenBeforeSearch");
	document.getElementById("temporaryBlurb").classList.add("hiddenAfterSearch");
	document.getElementById("zipCode").classList.add("hiddenAfterSearch");
}
