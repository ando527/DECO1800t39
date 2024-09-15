var allParks = [];
var numberOfParks = 200; //initial high value so the code runs the first fetch
var keepPulling = true;
var currentOffset = 0;
var disablityOffset = 0;
var map;
var markerLayer;
var disabilityLayer;
var userX;
var userY;
var distanceFilter;
var timeFilter;
var loadingFilterElement;

const customIcon = L.icon({
    iconUrl: 'images/location.png',
    iconSize: [15, 15],
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
    loadingFilterElement = document.querySelector('#loadingFilter');
    //getParks();

    const distanceValue = document.querySelector("#distanceValue");
    const distanceSlider = document.querySelector("#distance");
    distanceValue.textContent = distanceSlider.value + "km";
    distanceFilter = parseInt(distanceSlider.value);
    distanceSlider.addEventListener("change", (event) => {
        distanceFilter = parseInt(distanceSlider.value);
        distanceValue.textContent = distanceSlider.value + "km";
        markerLayer.clearLayers();
        loadNewMarkers();
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
        getParks();
      });
      

});


function loadNewMarkers(){
    loadingFilterElement.style.opacity = "1";
    setTimeout(() => {
        iterateRecordsParksFiltered();
        iterateDisabledParksFiltered();
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
        console.log("SAVEDEMMMMM");
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
                allDisabledParks = allDisabledParks.concat(data.results)
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
        console.log("SAVE THEM AGAIN");
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
    
    $.each(allParks, function(recordID, recordValue) {
        var recordLatitude = recordValue["latitude"];
        var recordLongitude = recordValue["longitude"];
        if (recordLatitude && recordLongitude) {
            if(parseInt(recordValue["max_stay_hrs"]) >= timeFilter){
                if (withinRange(recordLatitude, recordLongitude)){
                    var marker = L.marker([recordLatitude, recordLongitude]).addTo(markerLayer); 
                    var popupText = recordValue["meter_no"];
                    marker.bindPopup(popupText).openPopup();
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
                var marker = L.marker([recordLatitude, recordLongitude]).addTo(disabilityLayer); 
                var popupText = recordValue["zone_id"];
                marker.bindPopup(popupText).openPopup();
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
