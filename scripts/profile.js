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
    addressBox = document.querySelector("#autocomplete-container");
    nameBox = document.querySelector("#nameBox");
    parkingCheck = document.querySelector("#parkingCheck");
    distanceCheck = document.querySelector("#distanceCheck");
    nameText = document.querySelector("#profileName");
    profilePic = document.querySelector("#profilePhoto");
    savedProfileImage = localStorage.getItem("profilePic");
    address = localStorage.getItem("address");
    profileName = localStorage.getItem("name");
    parkingPriority = localStorage.getItem("parkingPriority");
    distancePriority = localStorage.getItem("distancePriority");
  
    if (parkingPriority){
        parkingCheck.checked = parkingPriority == 'true';

    }
    if (distancePriority){
        distanceCheck.checked = distancePriority == 'true';
    }
    if (profileName){
        nameText.innerHTML = profileName;
        nameBox.value = profileName;
    } else {
        nameBox.placeholder = 'Enter a Name';
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

    addressAutocomplete(document.getElementById("autocomplete-container"), (data) => {
        console.log('Selected option:', data);
      });

});

function updateAddress(){
    localStorage.setItem("address", addressBox.value);
    localStorage.setItem("parkingPriority", parkingCheck.checked);
    localStorage.setItem("distancePriority", distanceCheck.checked);
    localStorage.setItem("name", nameBox.value);
    nameText.innerHTML = nameBox.value;
}

function addressAutocomplete(containerElement, callback, options = {}) {
    // Create the input element
    const inputElement = document.createElement('input');
    inputElement.setAttribute('type', 'text');

    window.addressBox = inputElement;

    if (address == undefined || !address || address == 'undefined'){
        inputElement.setAttribute('placeholder', options.placeholder || 'Enter an address');
    } else {
        inputElement.setAttribute('value', address);
    }
    containerElement.appendChild(inputElement);
  
    let currentPromiseReject;
    let currentItems;
    let focusedItemIndex = -1;
  
    // Add input field clear button
    const clearButton = document.createElement('div');
    clearButton.classList.add('clear-button');
    clearButton.innerHTML = '&times;';
    clearButton.addEventListener('click', () => {
      inputElement.value = '';
      clearButton.classList.remove('visible');
      closeDropDownList();
      callback(null);
    });
    containerElement.appendChild(clearButton);
  
    inputElement.addEventListener('input', function () {
      const currentValue = this.value;
      if (!currentValue) {
        clearButton.classList.remove('visible');
        return;
      }
  
      clearButton.classList.add('visible');
  
      if (currentPromiseReject) {
        currentPromiseReject({
          canceled: true,
        });
      }
  
      closeDropDownList();
  
      const promise = new Promise((resolve, reject) => {
        currentPromiseReject = reject;
        const apiKey = '47f523a46b944b47862e39509a7833a9';
        let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(currentValue)}&limit=5&apiKey=${apiKey}`;
  
        if (options.type) {
          url += `&type=${options.type}`;
        }
  
        fetch(url)
          .then(response => {
            if (response.ok) {
              response.json().then(data => resolve(data));
            } else {
              response.json().then(data => reject(data));
            }
          })
          .catch(err => reject(err));
      });
  
      promise.then(data => {
        currentItems = data.features;
  
        const autocompleteItemsElement = document.createElement('div');
        autocompleteItemsElement.setAttribute('class', 'autocomplete-items');
        containerElement.appendChild(autocompleteItemsElement);
  
        currentItems.forEach((feature, index) => {
          const itemElement = document.createElement('div');
          itemElement.innerHTML = feature.properties.formatted;
          itemElement.addEventListener('click', () => {
            inputElement.value = currentItems[index].properties.formatted;
            callback(currentItems[index]);
            closeDropDownList();
          });
          autocompleteItemsElement.appendChild(itemElement);
        });
      }).catch(err => {
        if (!err.canceled) {
          console.log(err);
        }
      });
    });
  
    inputElement.addEventListener('keydown', function (e) {
      const autocompleteItemsElement = containerElement.querySelector('.autocomplete-items');
      if (autocompleteItemsElement) {
        const itemElements = autocompleteItemsElement.getElementsByTagName('div');
        if (e.keyCode === 40) {
          e.preventDefault();
          focusedItemIndex = focusedItemIndex !== itemElements.length - 1 ? focusedItemIndex + 1 : 0;
          setActive(itemElements, focusedItemIndex);
        } else if (e.keyCode === 38) {
          e.preventDefault();
          focusedItemIndex = focusedItemIndex !== 0 ? focusedItemIndex - 1 : itemElements.length - 1;
          setActive(itemElements, focusedItemIndex);
        } else if (e.keyCode === 13) {
          e.preventDefault();
          if (focusedItemIndex > -1) {
            itemElements[focusedItemIndex].click();
          }
        }
      }
    });
  
    document.addEventListener('click', function (e) {
      if (e.target !== inputElement) {
        closeDropDownList();
      }
    });
  
    function setActive(items, index) {
      if (!items || !items.length) return;
  
      for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('autocomplete-active');
      }
  
      items[index].classList.add('autocomplete-active');
      inputElement.value = currentItems[index].properties.formatted;
      callback(currentItems[index]);
    }
  
    function closeDropDownList() {
      const autocompleteItemsElement = containerElement.querySelector('.autocomplete-items');
      if (autocompleteItemsElement) {
        containerElement.removeChild(autocompleteItemsElement);
      }
      focusedItemIndex = -1;
    }
  }
  