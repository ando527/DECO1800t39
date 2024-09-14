
function loadShoe(e){
    document.querySelector("#shoesImg").src= "images/shoes/" + e.dataset.shoe + "_shoes.png";
}

function loadTop(e){
    document.querySelector("#topImg").src= "images/tops/" + e.dataset.top + "_top.png";
}

function loadHat(e){
    document.querySelector("#hatImg").src= "images/hats/" + e.dataset.hat + ".png";
}

$(document).ready(function(){
    $('.indivAccessorySlider').slick({
      dots: false,              // Show navigation dots
      infinite: true,           // Infinite looping
      speed: 500,               // Transition speed
      slidesToShow: 3,          // Number of slides to show
      adaptiveHeight: true      // Adjust height based on content
    });
  });