# Parkaroo

ParkaRoo is a user-first parking app made for Brisbane, Australia. Developed as part of the UQ DECO1800 Group project, this is the final iteration of our web app.
![parkarooScreenshot](https://github.com/user-attachments/assets/b98e6882-a1b7-4ee6-aff1-e9f732179c5d)

## Page Structure

This web-app has 3 main pages and one subpage. They are:
- Home page (Map)
    - Individual Page for each Park
- Profile page (Profile)
- Roo Customisation page (YouRoo)

## Explanation of Front-End only implementation
For this project, we decided to use a Javascript only approach, computing everything on the Front-End and not using any PHP or Back-end technologies.

We decided that for the features we were implementing, a Javascript-only solution would not hinder the user's experience, and this allowed us to drastically decrease the complexity of the code-base, which in turn, gave us more time to develop some extra features that would be most probably out of scope for a first-year application.

For majority of the features that needed 'back-end' esque functionality, localStorage was used. This includes:
- Clothing items owned
- Current Balance
- Name
- Address
- Profile Picture
- Caching API calls to reduce load on BCC API Servers.
- Preferences for distance/price priority

## API's used
1. Parking — Meter locations [Link](https://data.brisbane.qld.gov.au/explore/dataset/brisbane-parking-meters/table/?sort=objectid&disjunctive.suburb&disjunctive.max_stay_hrs&disjunctive.tar_zone)
2. Parking — Occupancy forecasting [Link](https://data.brisbane.qld.gov.au/explore/dataset/parking-occupancy-forecasting/information/)
3. Parking — Disability Permit Parking locations [Link](https://data.brisbane.qld.gov.au/explore/dataset/disability-permit-parking-locations/information/)

## Code Breakdown

### Map Initialisation
Using Leaflet.js, we are creating a few different map layers to display to the user.
- Tile layer - used for showing the actual map
- Location layer - used for displaying the users location as a small dot, and a radius around the dot that matches the distance slider value
- Parks Layer - This shows all of the parks
- Disabled layer - This layer shows all the disabled parks.
- Routing layer - This is used to show directions to a parking spot

By having all of this data on separate layers, we can show and hide layers as we need to display different data to the user.
```javascript
map = L.map('map').setView([-27.47, 153.02], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
markerLayer = L.layerGroup().addTo(map);
disabilityLayer = L.layerGroup().addTo(map);
locationLayer = L.layerGroup().addTo(map);
routingLayer = L.layerGroup().addTo(map);

```

### API Loading
To load the API into the web-app, we use the following code. This was partly borrowed from some of the code tutorials in the practicals for this course. We are also caching the results, so that a refresh of the API data is not needed every load of the page. The data that we are using is not prone to change much, so there is no risk of providing stale data.
```javascript
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
    }
}

```

### Filtering Parks
This is one of the more meaty functions int eh codebase, and displays parks that are within a radius of the users location, along with hitting the criteria set for stay time, price and disabled/not disabled parking.
```javascript
function iterateRecordsParksFiltered() { 
    bestDistance = 0;
    $.each(allParks, function(recordID, recordValue) {
        var recordLatitude = recordValue["latitude"];
        var recordLongitude = recordValue["longitude"];
        var distTemp;
        if (recordLatitude && recordLongitude) {
            if(parseInt(recordValue["max_stay_hrs"]) >= timeFilter){
                if(parseFloat(recordValue["tar_rate_weekday"]) <= priceFilter){
					distTemp = howFar(recordLatitude, recordLongitude);
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
                        marker.bindPopup(popupText);//.openPopup();
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

```

### Navigating to a park
The following function is the code behind the "Roo Park" feature. This finds the closest park (as the crow flies) and navigates the user there using the MapBox API.
```javascript
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
    addToBalance(10);
    notification(10);
}
```

### Purchasing items
There are three of these loadItem functions as seen below, loadShoe(e), loadHat(e) and loadTop(e). The 'e' that gets passed is the element that is clicked from within the clothing options panel. Each of these HTML elements has a custom data-attribute value with it's unique clothing identifier. The HTML code block of shoes can be seen below the Javascript function.
```javascript
function loadShoe(e){
    if (owned.includes(e.dataset.shoe) || e.dataset.shoe == "roo_bottom"){
        document.querySelector("#shoesImg").src= "images/shoes/" + e.dataset.shoe + ".png";
        localStorage.setItem("shoe", ("images/shoes/" + e.dataset.shoe + ".png"));
    } else {
        document.querySelector('.productName').textContent = productMapping[e.dataset.shoe];
        document.querySelector('.productPrice').textContent = "" + productPrices[e.dataset.shoe];
        document.querySelector('.productImage').src = `images/shoes/${e.dataset.shoe}.png`;
        lookingAt = e.dataset.shoe;
        if (productPrices[lookingAt] > balance){
            document.querySelector('.checkoutButton').classList.add('greyedOut');
            document.querySelector('.checkoutButton').textContent = "Can't Afford these yet...";
        } else {
            document.querySelector('.checkoutButton').classList.remove('greyedOut');
            document.querySelector('.checkoutButton').textContent = "Buy this item!";
        }
        document.querySelector('.checkout').style.display = "flex";
        document.querySelector('.checkout').style.opacity = 1;
        document.body.classList.add('no-scroll');
    }
}
```
```xml
<div class="accessory clear" data-shoe="roo_bottom" onClick="loadShoe(this)"><span>&#8377</span>0</div>
<div class="accessory slippers" data-shoe="slippers" onClick="loadShoe(this)"><span>&#8377</span>20</div>
<div class="accessory shoes" data-shoe="shoes" onClick="loadShoe(this)"><span>&#8377</span>30</div>
<div class="accessory boots" data-shoe="boots" onClick="loadShoe(this)"><span>&#8377</span>40</div>
<div class="accessory jetShoes" data-shoe="jetShoes" onClick="loadShoe(this)"><span>&#8377</span>100</div>
```
## References/Libraries used
### Leaflet.js
Leaflet.js was used to create the maps on both the main page, and the individual park pages.
### MapBox API
Leaflet.js has a routing feature that we used for navigating the user to specific parking spots. This feature needs the use of an API to compute the routes needed, and we chose to use Map Box. 
### Geoapify
On the profile page, we have an address field, and we are using geoapify to check valid addresses are entered, as well as providing an autocomplete feature to the address field. The code used was largely from [this tutorial](https://apidocs.geoapify.com/samples/autocomplete/autocomplete-tutorial/).

## License

[GNU v3](https://www.gnu.org/licenses/gpl-3.0.en.html)
