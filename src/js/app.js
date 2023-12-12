import {settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import API from './service.js';
import Navigation from './components/Navigation.js';
import Booking from './components/Booking.js';
import HomePage from './components/HomePage.js';

const app = {
  initMenu: function(){
      const thisApp = this;
      thisApp.data = {};

      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse:', parsedResponse);
        
          thisApp.data.products = parsedResponse;

          for ( let product in thisApp.data.products) {
            new Product(thisApp.data.products[product].id, thisApp.data.products[product]);
          }
        });

        console.log('thisApp.data: ', JSON.stringify(thisApp.data));
  },

  initCart: function(){
      const thisApp = this;
      const cartElement = document.querySelector(select.containerOf.cart);

      thisApp.cart = new Cart(cartElement);

      const productListElement = document.querySelector(select.containerOf.menu);
      productListElement.addEventListener('add-to-cart', function(event){
        thisApp.cart.add(event.detail);
      });
  },

  initService: function(){
      const thisApp = this;

      thisApp.API = new API();
  },

  initNavigation: function(){
    new Navigation();
  },

  initBooking: function(){
    new Booking();
  },

  initHomePage(){
    new HomePage();
  },

  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('settings:', settings);

    thisApp.initNavigation();
    thisApp.initService();
    thisApp.initHomePage();
    thisApp.initMenu();
    thisApp.initCart();
    thisApp.initBooking();
  },
}; 

app.init();

