var address;
var profileName;
var parkingPriority;
var distancePriority;
var savedProfileImage;

var addressBox;
var parkingCheck;
var distanceCheck;
var nameText;
var profilePic;


$( document ).ready(function() {
    addressBox = document.querySelector("#addressBox");
    parkingCheck = document.querySelector("#parkingCheck");
    distanceCheck = document.querySelector("#distanceCheck");
    nameText = document.querySelector("#profileName");
    profilePic = document.querySelector("#profilePhoto");
    savedProfileImage = localStorage.getItem("profilePic");
    address = localStorage.getItem("address");
    profileName = localStorage.getItem("name");
    parkingPriority = localStorage.getItem("parkingPriority");
    distancePriority = localStorage.getItem("distancePriority");

    if (address){
        addressBox.value = address;
    }
    if (parkingPriority){
        parkingCheck.checked = parkingPriority;

    }
    if (distancePriority == "on"){
        distanceCheck.checked = distancePriority;
    }
    if (profileName){
        nameText.value = profileName;
    }
    if (savedProfileImage){
        profilePic.src = savedProfileImage;
    }

    document.getElementById('fileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageDataUrl = e.target.result;
                localStorage.setItem('profilePic', imageDataUrl);
                profilePic.src = imageDataUrl;
            };
            reader.readAsDataURL(file);
        } else {
            alert('womp womp');
        }
    });

});

function updateAddress(){
    localStorage.setItem("address", addressBox.value);
    localStorage.setItem("parkingPriority", parkingCheck.checked);
    localStorage.setItem("distancePriority", distanceCheck.checked);
}