var allParks = [];
var allDisabledParks = [];
var numberOfParks = 200; //initial high value so the code runs the first fetch
var numberOfDisabledParks = 200;
var keepPulling = true;
var currentOffset = 0;
var disablityOffset = 0;
var map;
var markerLayer;
var disabilityLayer;
var userX;
var userY;
var distanceFilter;
var locationLayer;
var routingLayer;
var locationRadius;
var priceFilter;
var timeFilter;
var loadingFilterElement;
var showDisabled = false;
var shoesUrl;
var topUrl;
var hatUrl;
var rooParkButton;
var route;

var mapBoxKey = "pk.eyJ1IjoiYW5kbzUyNyIsImEiOiJjbTFwbmJyaXEwNmIwMm5xMnFoOGd5dDdrIn0.3EvqnTYY5gIlOKehtLG9xQ";
var bestSpot;
var bestDistance = 0;


const customIcon = L.icon({
    iconUrl: 'images/location.png',
    iconSize: [15, 15],
    iconAnchor: [7, 7],
    popupAnchor: [0, 0]
});



const dIcon = L.icon({
    iconUrl: 'css/images/disabled-icon.png',

    iconAnchor: [7, 7],
    popupAnchor: [0, 0]
});

$( document ).ready(function() {
    
    map = L.map('map').setView([-27.47, 153.02], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
    disabilityLayer = L.layerGroup().addTo(map);
    locationLayer = L.layerGroup().addTo(map);
    routingLayer = L.layerGroup().addTo(map);;
    loadingFilterElement = document.querySelector('#loadingFilter');
    //getParks();

    

    const distanceValue = document.querySelector("#distanceValue");
    const distanceSlider = document.querySelector("#distance");
    const priceSlider = document.querySelector("#price");
    const priceValue = document.querySelector("#priceValue");
    const disabledCheckBox = document.querySelector("#disabledCheck");
    const filterButton = document.querySelector("#filterButton");
    const closeFilter = document.querySelector("#closeFilters");
    rooParkButton = document.querySelector("#rooPark");
    distanceValue.textContent = distanceSlider.value + "km";
    distanceFilter = parseInt(distanceSlider.value);
    distanceSlider.addEventListener("change", (event) => {
        distanceFilter = parseInt(distanceSlider.value);
        locationRadius.setRadius (distanceFilter*1000);
        distanceValue.textContent = distanceSlider.value + "km";
        markerLayer.clearLayers();
        disabilityLayer.clearLayers();
        loadNewMarkers();
    });

    priceValue.textContent = "$" + priceSlider.value;
    priceFilter = parseFloat(priceSlider.value);
    priceSlider.addEventListener("change", (event) => {
        priceFilter = parseInt(priceSlider.value);
        priceValue.textContent = "$" + priceSlider.value;
        markerLayer.clearLayers();
        disabilityLayer.clearLayers();
        loadNewMarkers();
    });

    disabledCheckBox.addEventListener("change", (event) => {
        showDisabled = disabledCheckBox.checked;
        markerLayer.clearLayers();
        disabilityLayer.clearLayers();
        loadNewMarkers();

    });

    hatUrl = localStorage.getItem("hat");
    shoesUrl = localStorage.getItem("shoe");
    topUrl = localStorage.getItem("top");

    if (hatUrl || shoesUrl || topUrl){
        if (hatUrl){
            document.querySelector("#topRooMap").src= hatUrl;
        }
        if (topUrl){
            document.querySelector("#midRooMap").src= topUrl;
        }
        if (shoesUrl){
            document.querySelector("#bottomRooMap").src= shoesUrl;
        }
    }

    filterButton.addEventListener("click", (event) => {
        document.querySelector("#sidebar").style.display="flex";
        filterButton.style.display="none";
    });

    rooParkButton.addEventListener("click", (event) => {
        navigateClosest();
    });

    closeFilter.addEventListener("click", (event) => {
        document.querySelector("#sidebar").style.display="none";
        filterButton.style.display="flex";
    });

    const timeValue = document.querySelector("#timeValue");
    const timeSlider = document.querySelector("#time");
    timeValue.textContent = timeSlider.value + "hrs";
    timeFilter = parseInt(timeSlider.value);
    timeSlider.addEventListener("change", (event) => {
        timeFilter = parseInt(timeSlider.value);
        timeValue.textContent = timeSlider.value + "hrs";
        markerLayer.clearLayers();
        loadNewMarkers();
    });


    navigator.geolocation.getCurrentPosition((position) => {
        var marker = L.marker([position.coords.latitude, position.coords.longitude], { icon: customIcon }).addTo(locationLayer);
        userX = position.coords.latitude;
        userY = position.coords.longitude;
        locationRadius = L.circle([userX, userY], {
            radius: distanceFilter*1000,
            color: '#4f5d75',
            fillOpacity: 0.1}).addTo(locationLayer);
        getParks();
        getDisabled();
      });
      

});


function loadNewMarkers(){
    loadingFilterElement.style.opacity = "1";
    setTimeout(() => {
        if (!showDisabled){
            iterateRecordsParksFiltered();
        } else {
            iterateDisabledParksFiltered();
        }
        setTimeout(() => {loadingFilterElement.style.opacity = "0"}, 250);
    }, 0);
}


function getParks(){
    var data = {
        resource_id: "brisbane-parking-meters",
    };
    var allParksTest = localStorage.getItem("allParksLocal");
    if (!allParksTest){
        allParksTest = [];
        $.ajax({
            url: "https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/brisbane-parking-meters/records?limit=100&offset=" + currentOffset,
            data: data,
            dataType: "jsonp", 
            cache: true,
            success: function(data) {
                numberOfParks = data.total_count;
                allParks = allParks.concat(data.results);
                currentOffset += 100;
                
                if (currentOffset < numberOfParks){
                    getParks();
                } else {
                    loadNewMarkers(); 
                    localStorage.setItem("allParksLocal",  JSON.stringify(allParks));

                }
            }
        });
    } else{
        allParks = JSON.parse(allParksTest);
        loadNewMarkers(); 
        //console.log("SAVEDEMMMMM");
    }
}

function getDisabled(){
    var data = {
        resource_id: "disability-permit-parking-locations",
    };
    var disabilityTest = localStorage.getItem("disabilityParks");
    if (!disabilityTest){
        disabilityTest = [];
        $.ajax({
            url: "https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/disability-permit-parking-locations/records?limit=100&offset=" + disablityOffset,
            data: data,
            dataType: 'jsonp',
            cache: true,
            success: function(data) {
                numberOfDisabledParks = data.total_count;
                allDisabledParks = allDisabledParks.concat(data.results);
                disablityOffset += 100;

                if (disablityOffset < numberOfDisabledParks){
                    getDisabled(); 
                } else {
                    loadNewMarkers();
                    localStorage.setItem("disabilityParks", JSON.stringify(allDisabledParks));
                
                }
            }
        })
    } else {
        allDisabledParks = JSON.parse(disabilityTest);
        loadNewMarkers()
        //console.log("SAVE THEM AGAIN");
    }
}

function iterateRecordsParks(data) { 
    $.each(data, function(recordID, recordValue) {
        var recordLatitude = recordValue["latitude"];
        var recordLongitude = recordValue["longitude"];
        if (recordLatitude && recordLongitude) {
            var marker = L.marker([recordLatitude, recordLongitude]).addTo(markerLayer); 
            var popupText = recordValue["street"];
            marker.bindPopup(popupText).openPopup();
        }
    });
}

function iterateRecordsParksFiltered() { 
    bestDistance = 0;
    $.each(allParks, function(recordID, recordValue) {
        var recordLatitude = recordValue["latitude"];
        var recordLongitude = recordValue["longitude"];
        var distTemp;
        if (recordLatitude && recordLongitude) {
            distTemp = howFar(recordLatitude, recordLongitude);
            if(parseInt(recordValue["max_stay_hrs"]) >= timeFilter){
                if(parseFloat(recordValue["tar_rate_weekday"]) <= priceFilter){
                    if (withinRange(recordLatitude, recordLongitude)){
                        var marker = L.marker([recordLatitude, recordLongitude]).addTo(markerLayer); 
						if (recordValue["max_cap_chg"] != null){
							var popupText = "Meter No. " + recordValue["meter_no"] + "<br />" 
											+ "Price/hr (weekday): $" + recordValue["tar_rate_weekday"] + "<br />" 
											+ "Cap: $" + truncatePrices(recordValue["max_cap_chg"]) + "<br />" 
											+ "Max Stay: " + recordValue["max_stay_hrs"] + "hrs<br />" 
											+ "Distance from you: " + distTemp + "km"
                                            + "<br /><br /><a class=\"button small\" href=\"parking.html#" + recordValue["meter_no"] + "\">Park Details</a>"
                                            + "<br /><br /><div class=\"button small\" onclick=\"navigateSelected(" + recordValue["meter_no"] + ")\">Quick Navigate</div>";
						} else {
							var popupText = "Meter No. " + recordValue["meter_no"] + "<br />" 
											+ "Price/hr (weekday): $" + recordValue["tar_rate_weekday"] + "<br />" 
											+ "Max Stay: " + recordValue["max_stay_hrs"] + "hrs<br />" 
											+ "Distance from you: " + distTemp + "km"
                                            + "<br /><br /><a class=\"button small\" href=\"parking.html#" + recordValue["meter_no"] + "\">Park Details</a>"
                                            + "<br /><br /><div class=\"button small\" onclick=\"navigateSelected(" + recordValue["meter_no"] + ")\">Quick Navigate</div>";
						}
                        marker.bindPopup(popupText).openPopup();
                        if (bestDistance == 0){
                            bestDistance = distTemp;
                            bestSpot = recordValue["meter_no"];
                        } else {
                            if (distTemp < bestDistance){
                                bestDistance = distTemp;
                                bestSpot = recordValue["meter_no"];
                            }
                        }
                    }
                }
            }
        }
        
    });

}

function iterateDisabledParksFiltered() { 
    
    $.each(allDisabledParks, function(recordID, recordValue) {
        var recordLatitude = recordValue["latitude"];
        var recordLongitude = recordValue["longitude"];
        if (recordLatitude && recordLongitude) {
            if (withinRange(recordLatitude, recordLongitude)){
                var markerD = L.marker([recordLatitude, recordLongitude], { icon: dIcon }).addTo(disabilityLayer); 
                var popupTextD = "Zone id: " + recordValue["zone_id"] + "<br />" 
                                + "Parking Limit: " + recordValue["parking_limit"] + "<br />" 
                                + "Location: " + recordValue["objectid"] + " " + recordValue["street"].toLowerCase() + "<br />" 
                                + "Distance from you: " + howFar(recordLatitude, recordLongitude) +  "km"
                                + "<br /><br /><a class=\"button small\" href=\"parking.html#d" + recordValue["zone_id"] + "\">Park Details</a>"
                                + "<br /><br /><div class=\"button small\" onclick=\"navigateSelected(" + recordValue["zone_id"] + ")\">Quick Navigate</div>";
                markerD.bindPopup(popupTextD).openPopup();
            }
        }
    });
}

function withinRange(pointX, pointY){
    if (Math.sqrt((pointX-userX)*(pointX-userX)+(pointY-userY)*(pointY-userY)) < distanceFilter/111){
        return true;
    }
    return false;
}

function howFar(pointX, pointY){
    return (111 * Math.sqrt((pointX-userX)*(pointX-userX)+(pointY-userY)*(pointY-userY))).toFixed(2);
}

function truncatePrices(price) {
    let index = price.indexOf("/");
    if (index !== -1) {
      return price.substring(0, index);
    }
    return price;
  }

function navigateClosest(){
    var closestPark = allParks.filter(obj => {
        return obj.meter_no.toString() == bestSpot
      })
      if (closestPark){
        //hide sidebar
        document.querySelector("#sidebar").style.display = "none";
        //hide radius
        map.removeLayer(locationLayer);
        //hide markers
        map.removeLayer(markerLayer);
        //show exit button
        document.querySelector("#exitRouting").style.display = "block";
        route = L.Routing.control({
            waypoints: [
                L.latLng(userX, userY),
                L.latLng(closestPark[0].latitude, closestPark[0].longitude)
            ],
            router: L.Routing.mapbox(mapBoxKey)
        }).addTo(map);
    }
}

function navigateSelected(meter_no_selected){
    console.log(meter_no_selected);
    var selectedPark = allParks.filter(obj => {
        return obj.meter_no.toString() == meter_no_selected
      })
      if (selectedPark){
        //hide sidebar
        document.querySelector("#sidebar").style.display = "none";
        //hide radius
        map.removeLayer(locationLayer);
        //hide markers
        map.removeLayer(markerLayer);
        //show exit button
        document.querySelector("#exitRouting").style.display = "block";
        route = L.Routing.control({
            waypoints: [
                L.latLng(userX, userY),
                L.latLng(selectedPark[0].latitude, selectedPark[0].longitude)
            ],
            router: L.Routing.mapbox(mapBoxKey)
        }).addTo(map);
    }
}

function exitNavigation(){
    //show sidebar
    document.querySelector("#sidebar").style.display = "flex";
    //show radius
    map.addLayer(locationLayer);
    //show markers
    map.addLayer(markerLayer);
    //hide exit button
    document.querySelector("#exitRouting").style.display = "none";
    //delete route
    map.removeControl(route);
}