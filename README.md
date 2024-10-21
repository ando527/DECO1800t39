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

## Code Breakdown

### Map Initialisation

### API Loading

### Filtering Parks

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
