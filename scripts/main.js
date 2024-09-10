$( document ).ready(function() {
    var map = L.map('map').setView([-27.47, 153.02], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var marker = L.marker([-27.4959193, 153.0117005]).addTo(map);

    var data = {
        resource_id: "brisbane-parking-meters",
    };

    $.ajax({
        url: "https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/brisbane-parking-meters/records?limit=100",
        data: data,
        dataType: "jsonp", 
        cache: true,
        success: function(data) {
            iterateRecords(data, map); 
        }
    });
});

function iterateRecords(data, map) { 
    console.log(data); 

    $.each(data.results, function(recordID, recordValue) {
        console.log(recordValue);

        var recordLatitude = recordValue["latitude"];
        var recordLongitude = recordValue["longitude"];

        if (recordLatitude && recordLongitude) {
            var marker = L.marker([recordLatitude, recordLongitude]).addTo(map); 
            var popupText = "";
            marker.bindPopup(popupText).openPopup();
        }
    });
}
