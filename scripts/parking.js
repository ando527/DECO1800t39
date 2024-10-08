var parkingMap;
var parkingLocation;
var parkingName;
var parkingPrice;
var parkingDistance;
var markerLayer;
var currentOffset = 0;
var disablityOffset = 0;
var occupancyOffset = 0;
var hash;
var park;
var userX;
var userY;
var locationLayer;

const customIcon = L.icon({
    iconUrl: 'images/location.png',
    iconSize: [15, 15],
    iconAnchor: [7, 7],
    popupAnchor: [0, 0]
});

$( document ).ready(function() {


    
    

    
      getParks();
      getDisabled();

    if(window.location.hash) {
        hash = window.location.hash.substring(1);
        park = allParks.filter(obj => {
            return obj.meter_no.toString() == hash
          })
          if (park){
            var lat = park[0]["latitude"];
            var long = park[0]["longitude"];
            
            document.querySelector("#maxPark").innerHTML = park[0]["max_stay_hrs"] + "hrs";
            document.querySelector("#parkCost").innerHTML = "$" + park[0]["tar_rate_weekday"] + "/hr";
            parkingMap = L.map('parkingMap').setView([lat, long], 13);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(parkingMap);

            markerLayer = L.layerGroup().addTo(parkingMap);
            locationLayer = L.layerGroup().addTo(parkingMap);
            L.marker([park[0]["latitude"], park[0]["longitude"]]).addTo(markerLayer); 
            navigator.geolocation.getCurrentPosition((position) => {
                userX = position.coords.latitude;
                userY = position.coords.longitude;
                L.marker([position.coords.latitude, position.coords.longitude], { icon: customIcon }).addTo(locationLayer);
                if (userX && userY){
                    document.querySelector("#distanceFromYou").innerHTML = "Distance From You:" + howFar(park[0]["latitude"], park[0]["longitude"]) + "kms";
                }
            });
        }
      } else {
        alert("No park found here");
      }

});

function howFar(pointX, pointY){
    return (111 * Math.sqrt((pointX-userX)*(pointX-userX)+(pointY-userY)*(pointY-userY))).toFixed(2);
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
                    localStorage.setItem("allParksLocal",  JSON.stringify(allParks));
                }
            }
        });
    } else{
        allParks = JSON.parse(allParksTest);
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
                    localStorage.setItem("disabilityParks", JSON.stringify(allDisabledParks));
                }
            }
        })
    } else {
        allDisabledParks = JSON.parse(disabilityTest);
    }
}

function getBusyTimes() {
    var data = {
        resource_id: "parking-occupancy-forecasting"
    };
    var busyTest = localStorage.getItem("occupancyForecast");
    if (!busyTest){
        busyTest = [];
        $.ajax({
            url: "https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/parking-occupancy-forecasting/records?limit=100&offset=" + occupancyOffset,
            data: data,
            dataType: 'jsonp',
            cache: true,
            success: function(data) {
                numberofOccupancies = data.total_count;
                occupancyTime = busyTest.concat(data.results)
                occupancyOffset += 100;

                if (occupancyOffset < numberofOccupancies) {
                    getBusyTimes()
                } else {
                    localStorage.setItem("occupancyForecase", JSON.stringify(occupancyTime))
                }
            }
        })
    } else {
        occupancyTime = JSON.parse(busyTest)
    }
}
