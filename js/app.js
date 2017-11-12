'use strict';

var styles = [
          {
            featureType: 'water',
            stylers: [
              { color: '#19a0d8' }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
              { color: '#ffffff' },
              { weight: 6 }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
              { color: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -40 }
            ]
          },{
            featureType: 'transit.station',
            stylers: [
              { weight: 9 },
              { hue: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [
              { visibility: 'off' }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
              { lightness: 100 }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
              { lightness: -100 }
            ]
          },{
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
              { visibility: 'on' },
              { color: '#f0e4d3' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -25 }
            ]
          }
        ];

var restaurants = [
	{title: 'Spaghetti Notte',location:{lat: 44.286234,lon: 11.880963}},
	{title: 'Marianaza',location:{lat: 44.284288,lon: 11.883672}},
	{title: 'Il Turismo',location:{lat: 44.284807,lon: 11.881587}},
	{title: 'Silverio',location:{lat: 44.286702,lon: 11.878769}},
	{title: 'Zingarò',location:{lat: 44.288390,lon: 11.883024}},
	{title: 'Osteria Ristorante La Baita',location:{lat: 44.288302,lon: 11.883443}}];

var map;
var clientID;
var clientSecret;
var prev_infowindow = false;


var Location = function(data) {
	var self = this;
	this.title = data.title;
	this.lat = data.location.lat;
	this.lon = data.location.lon;
	this.URL = "";
	this.phone = "";

	this.visible = ko.observable(true);

	// Foursquare
	clientID = "KZHSKXLUDMIS04MTH4B1VNFAZBRIBZ2NNBJN5ZX2AEPWCMSR";
	clientSecret = "HIR0SBPEJOMUAUABGYZ51V3I1A2ZL0ETZHVSXUDUJJBPT1CW";

	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' +
   this.lon + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.title;

	$.getJSON(foursquareURL).done(function(data) {
		var results = data.response.venues[0];
		self.URL = results.url;
		if (typeof self.URL === 'undefined'){
			self.URL = "";
		}
    self.phone = results.contact.phone;
      if (typeof self.phone === 'undefined'){
			self.phone = "";
		}
	}).fail(function() {
		alert("Error. Please refresh your page.");
	});
    
  //Map
    
  var defaultIcon = makeMarkerIcon('0091ff');
	var highlightedIcon = makeMarkerIcon('FFFF24');
    
	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.location.lat, data.location.lon),
			map: map,
			title: data.title,
			animation: google.maps.Animation.DROP,
			icon: defaultIcon
	});

  // to change the colors back and forth.
  this.marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
  });
  this.marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
  });

	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	this.largeInfoWindow = new google.maps.InfoWindow();
  
	this.marker.addListener('click', function(){
    
    if( prev_infowindow ) {
           prev_infowindow.close();
    }
    prev_infowindow = self.largeInfoWindow;

    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;
    var latLng = new google.maps.LatLng(data.location.lat, data.location.lon);
    streetViewService.getPanoramaByLocation(latLng, radius, function (streetViewPanoramaData, status) {
      if (status === google.maps.StreetViewStatus.OK) {
          var heading = google.maps.geometry.spherical.computeHeading(latLng, self.marker.position);
              self.largeInfoWindow.setContent('<div>' + data.title + '</div></br></div><div id="pano"></div>' + 
                '</br><div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" + 
                '<div class="content"><a href="tel:' + self.phone +'">' + self.phone +"</a></div>");
              
              var panoramaOptions = {
                position: latLng,
                pov: {
                  heading: heading,
                  pitch: 20
                }
              };
              var panorama = new google.maps.StreetViewPanorama(
               document.getElementById('pano'), panoramaOptions);
      } else {
          // no street view available in this range, or some error occurred
          alert("No street view available in this range, or some error occurred. \
            Please check your internet connection and try again.");
      }
    });
	  self.largeInfoWindow.open(map, this);
	});
  
	this.jump = function(place) {
	 	google.maps.event.trigger(self.marker, 'click');
	};

	// This function takes in a COLOR, and then creates a new marker
  // icon of that color. The icon will be 21 px wide by 34 high, have an origin
  // of 0, 0 and be anchored at 10, 34).
	function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }    
};

function AppViewModel() {
	var self = this;

	this.searchTerm = ko.observable("");

	this.locationList = ko.observableArray([]);



	map = new google.maps.Map(document.getElementById('map'), {
	    center: {lat: 44.286, lng: 11.883},
	    zoom: 16,
	    styles: styles,
	    mapTypeControl: false

	});

	//Adapt map to screen size
	google.maps.event.addDomListener(window, "resize", function() {
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center); 
	});

	restaurants.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem));
	});

	this.filteredElem = ko.computed( function() {
		var filter = self.searchTerm().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
				var string = locationItem.title.toLowerCase();
				var result = (string.search(filter) >= 0);
				locationItem.visible(result);
				return result;
			});
		}
	}, self);

	this.mapElem = document.getElementById('map');
}

function startApp() {
	ko.applyBindings(new AppViewModel());
}

function errorHandling() {
	alert("Error loading Google Maps. Please refresh your page.");
}