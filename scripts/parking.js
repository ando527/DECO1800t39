var parkingMap;
var markerLayer;
var locationLayer;
var occupancyTime = [];
var allParks = [];
var allDisabledParks = [];
var currentOffset = 0;
var disabilityOffset = 0;
var occupancyOffset = 0;
var hash;
var park = [];
var userX;
var userY;
var lat;
var long;
var mapBoxKey = "pk.eyJ1IjoiYW5kbzUyNyIsImEiOiJjbTFwbmJyaXEwNmIwMm5xMnFoOGd5dDdrIn0.3EvqnTYY5gIlOKehtLG9xQ";
var navigated = false;
var route;

const customIcon = L.icon({
    iconUrl: 'images/location.png',
    iconSize: [15, 15],
    iconAnchor: [7, 7],
    popupAnchor: [0, 0]
});

$(document).ready(function () {
    getParks();
    getDisabled();
    
    document.querySelector("#navigate").addEventListener("click", navigateTo);

    if (window.location.hash) {
        hash = window.location.hash.substring(1);
        if (hash.includes("d")){
            hash = hash.replace(/d/g, "")
            park = allDisabledParks.filter(obj => obj.zone_id.toString() === hash);
            if (park.length) {
                lat = park[0]["latitude"];
                long = park[0]["longitude"];
                document.querySelector("#parkName").innerHTML = park[0]["street"];
                document.querySelector("#maxPark").innerHTML = "Unlimited";
                document.querySelector("#parkCost").innerHTML = "$0/hr";
                parkingMap = L.map('parkingMap').setView([lat, long], 16);
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(parkingMap);
    
                markerLayer = L.layerGroup().addTo(parkingMap);
                locationLayer = L.layerGroup().addTo(parkingMap);
                L.marker([lat, long]).addTo(markerLayer);
                
                navigator.geolocation.getCurrentPosition((position) => {
                    userX = position.coords.latitude;
                    userY = position.coords.longitude;
                    L.marker([userX, userY], { icon: customIcon }).addTo(locationLayer);
                    if (userX && userY) {
                        document.querySelector("#distanceFromYou").innerHTML = "Distance From You: " + howFar(lat, long) + " kms";
                    }
                });
            } else {
                alert("No park found here");
            }
            document.querySelector("#popTimes").remove();
        } else {
            park = allParks.filter(obj => obj.meter_no.toString() === hash);
            if (park.length) {
                lat = park[0]["latitude"];
                long = park[0]["longitude"];
                document.querySelector("#parkName").innerHTML = park[0]["loc_desc"];
                document.querySelector("#maxPark").innerHTML = park[0]["max_stay_hrs"] + " hrs";
                document.querySelector("#parkCost").innerHTML = "$" + park[0]["tar_rate_weekday"] + "/hr";
                parkingMap = L.map('parkingMap').setView([lat, long], 16);
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(parkingMap);
    
                markerLayer = L.layerGroup().addTo(parkingMap);
                locationLayer = L.layerGroup().addTo(parkingMap);
                L.marker([lat, long]).addTo(markerLayer);
                
                navigator.geolocation.getCurrentPosition((position) => {
                    userX = position.coords.latitude;
                    userY = position.coords.longitude;
                    L.marker([userX, userY], { icon: customIcon }).addTo(locationLayer);
                    if (userX && userY) {
                        document.querySelector("#distanceFromYou").innerHTML = "Distance From You: " + howFar(lat, long) + " kms";
                    }
                });
                getBusyTimes();
            } else {
                alert("No park found here");
            }
        }
        
    } else {
        alert("No park found here");
    }
});

function howFar(pointX, pointY) {
    return (111 * Math.sqrt((pointX - userX) * (pointX - userX) + (pointY - userY) * (pointY - userY))).toFixed(2);
}

function getParks() {
    var data = { resource_id: "brisbane-parking-meters" };
    var allParksTest = localStorage.getItem("allParksLocal");
    
    if (!allParksTest) {
        $.ajax({
            url: "https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/brisbane-parking-meters/records?limit=100&offset=" + currentOffset,
            data: data,
            dataType: "jsonp",
            cache: true,
            success: function (data) {
                var numberOfParks = data.total_count;
                allParks = allParks.concat(data.results);
                currentOffset += 100;

                if (currentOffset < numberOfParks) {
                    getParks();
                } else {
                    localStorage.setItem("allParksLocal", JSON.stringify(allParks));
                }
            }
        });
    } else {
        allParks = JSON.parse(allParksTest);
    }
}

function getDisabled() {
    var data = { resource_id: "disability-permit-parking-locations" };
    var disabilityTest = localStorage.getItem("disabilityParks");

    if (!disabilityTest) {
        $.ajax({
            url: "https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/disability-permit-parking-locations/records?limit=100&offset=" + disabilityOffset,
            data: data,
            dataType: 'jsonp',
            cache: true,
            success: function (data) {
                var numberOfDisabledParks = data.total_count;
                allDisabledParks = allDisabledParks.concat(data.results);
                disabilityOffset += 100;

                if (disabilityOffset < numberOfDisabledParks) {
                    getDisabled();
                } else {
                    localStorage.setItem("disabilityParks", JSON.stringify(allDisabledParks));
                }
            }
        });
    } else {
        allDisabledParks = JSON.parse(disabilityTest);
    }
}

function getBusyTimes() {
    hash = window.location.hash.substring(1);
    park = allParks.filter(obj => obj.meter_no.toString() === hash);
    if (park.length === 0) {
        console.error("No park data available to fetch busy times.");
        document.querySelector("#popTimes").innerHTML = "<p>No park data available.</p>";
        return;
    }

    const mobileZone = park[0]["mobile_zone"];
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const formattedDate = currentDate.toISOString().split('T')[0];

    var data = {
        resource_id: "parking-occupancy-forecasting",
        filters: JSON.stringify({
            mobile_zone: mobileZone,
            hour: currentHour,
            date: formattedDate
        }),
    };

        $.ajax({
            url: `https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/parking-occupancy-forecasting/records?where=date%20%3D%20date'${formattedDate}'%20and%20mobile_zone%20%3D%20${mobileZone}&limit=24`,
            data: data,
            dataType: 'jsonp',
            cache: true,
            success: function (data) {
                    displayOccupancy(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error fetching data: ", textStatus, errorThrown);
                document.querySelector("#popTimes").innerHTML = "<p>Error fetching data.</p>";
            }
        });
    }

function displayOccupancy(occupancyData) {
    var currentDate = new Date();
    var currentHour = currentDate.getHours();

    var start = currentHour - 4;
    var end = currentHour + 4

    var filteredData = occupancyData.results.filter(item => item.hour >= start && item.hour <= end).sort((a, b) => a.hour - b.hour); 

    const graphContainter = document.querySelector("#popTimes");
    graphContainter.innerHTML = "";

    function formatHour(hour) {
        const period = hour >= 12? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}${period}`;
    }

    filteredData.forEach(item => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("bar-wrapper");
        
        const occupancyLabel = document.createElement("span");
        occupancyLabel.textContent = item.occupancy_pred;
        occupancyLabel.classList.add("occupancy-label");
        
        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${item.occupancy_pred * 3}vh`;
        bar.style.width = "20px";

        if (item.hour == currentHour) {
            bar.classList.add("current-hour")
        }

        const hourLabel = document.createElement("span");
        hourLabel.classList.add("hour-label");
        hourLabel.textContent = formatHour(item.hour);

        wrapper.appendChild(occupancyLabel);
        wrapper.appendChild(bar);
        wrapper.appendChild(hourLabel);

        graphContainter.appendChild(wrapper);
    })
}

function navigateTo(){
    if (!navigated){
        route = L.Routing.control({
            waypoints: [
                L.latLng(userX, userY),
                L.latLng(lat, long)
            ],
            router: L.Routing.mapbox(mapBoxKey)
        }).addTo(parkingMap);
        document.querySelector("#navigate").textContent = "Exit Navigation";
        navigated = true;
    } else {
        parkingMap.removeControl(route);
        document.querySelector("#navigate").textContent = "Navigate!";
        navigated = false;
    }
}