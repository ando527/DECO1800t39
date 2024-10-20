var shoesUrl;
var topUrl;
var hatUrl;
var balance = 0;
var owned = [];
var lookingAt = "";

const productMapping = {
    "shoes": "Sneakers",
    "slippers": "Slippers",
    "jetShoes": "Jet Shoes!",
    "boots": "Ugg Boots",
    "jetpack": "Robot Suit/Jet Pack",
    "jacket": "Dinner Jacket",
    "formal": "Formal Shirt",
    "tshirt": "T-Shirt",
    "singlet": "Singlet",
    "earHoop": "Hoop Earring",
    "headBand": "Sweat Band",
    "diamondEarring": "Diamond Earring",
    "baseballCap": "Baseball Cap",
    "bucketHatSide": "Bucket Hat",
    "headphone": "Headphones"
}

const productPrices = {
    "shoes": 30,
    "slippers": 20,
    "boots": 40,
    "jetShoes": 100,
    "jetpack": 200,
    "jacket": 40,
    "formal": 30,
    "tshirt": 30,
    "earHoop": 20,
    "singlet": 20,
    "headBand": 25,
    "diamondEarring": 50,
    "baseballCap": 20,
    "bucketHatSide": 20,
    "headphone": 60
}

function exitCheckout(){
    document.querySelector('.checkout').style.display = "none";
    document.querySelector('.checkout').style.opacity = 0;
    document.body.classList.remove('no-scroll');
}

function buyItem(){
    if (lookingAt == ""){
        return;
    }
    
    if (balance >= productPrices[lookingAt]){
        balance -= productPrices[lookingAt];
        owned.push(lookingAt);
        unlockItem(lookingAt);
        localStorage.setItem("owned", JSON.stringify(owned));
        document.querySelector(".balance").innerHTML = balance;
        localStorage.setItem("balance", balance);
    }

    lookingAt = "";
    exitCheckout();
}

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

function loadTop(e){
    if (owned.includes(e.dataset.top) || e.dataset.top == "roo_mid"){
        document.querySelector("#topImg").src= "images/tops/" + e.dataset.top + ".png";
        localStorage.setItem("top", ("images/tops/" + e.dataset.top + ".png"));
    } else {
        document.querySelector('.productName').textContent = productMapping[e.dataset.top];
        document.querySelector('.productPrice').textContent = "" + productPrices[e.dataset.top];
        document.querySelector('.productImage').src = `images/tops/${e.dataset.top}.png`;
        lookingAt = e.dataset.top;
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

function loadHat(e){
    if (owned.includes(e.dataset.hat) || e.dataset.top == "roo_top"){
    document.querySelector("#hatImg").src= "images/hats/" + e.dataset.hat + ".png";
    localStorage.setItem("hat", ("images/hats/" + e.dataset.hat + ".png"));
    } else {
        document.querySelector('.productName').textContent = productMapping[e.dataset.hat];
        document.querySelector('.productPrice').textContent = "" + productPrices[e.dataset.hat];
        document.querySelector('.productImage').src = `images/hats/${e.dataset.hat}.png`;
        lookingAt = e.dataset.hat;
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

$(document).ready(function(){
    $('.indivAccessorySlider').slick({
      dots: false,              // Show navigation dots
      infinite: true,           // Infinite looping
      speed: 500,               // Transition speed
      slidesToShow: 3,          // Number of slides to show
      adaptiveHeight: true      // Adjust height based on content
    });

    hatUrl = localStorage.getItem("hat");
    shoesUrl = localStorage.getItem("shoe");
    topUrl = localStorage.getItem("top");

    if (hatUrl || shoesUrl || topUrl){
        if (hatUrl){
            document.querySelector("#hatImg").src= hatUrl;
        }
        if (topUrl){
            document.querySelector("#topImg").src= topUrl;
        }
        if (shoesUrl){
            document.querySelector("#shoesImg").src= shoesUrl;
        }
    }

    balance = localStorage.getItem("balance");

    if (balance){
        document.querySelector(".balance").innerHTML = balance;
    } else {
        balance = 0;
        localStorage.setItem("balance", balance);
    }

    owned = localStorage.getItem("owned");
    if (owned){
        owned = JSON.parse(owned);
        for (item of owned){
            unlockItem(item);
            console.log(item);
        }
    } else {
        owned = []
        localStorage.setItem("owned", JSON.stringify(owned));
    }

  });

  function unlockItem(item) {
    let thumbs = document.querySelectorAll(`.${item}`);
    thumbs.forEach(thumb => {
        thumb.textContent = "Owned";
        thumb.classList.add('bought');
    });
    console.log(thumbs);
}
