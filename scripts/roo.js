var shoesUrl;
var topUrl;
var hatUrl;
var balance = 0;

function loadShoe(e){
    document.querySelector("#shoesImg").src= "images/shoes/" + e.dataset.shoe + "_shoes.png";
    localStorage.setItem("shoe", ("images/shoes/" + e.dataset.shoe + "_shoes.png"));
}

function loadTop(e){
    document.querySelector("#topImg").src= "images/tops/" + e.dataset.top + ".png";
    localStorage.setItem("top", ("images/tops/" + e.dataset.top + ".png"));
}

function loadHat(e){
    document.querySelector("#hatImg").src= "images/hats/" + e.dataset.hat + ".png";
    localStorage.setItem("hat", ("images/hats/" + e.dataset.hat + ".png"));
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

  });

