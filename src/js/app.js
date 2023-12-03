import {settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import API from './service.js';

const app = {
    initMenu: function(){
      const thisApp = this;

      console.log('thisApp.data: ', thisApp.data);

      for ( let product in thisApp.data.products) {
        new Product(thisApp.data.products[product].id, thisApp.data.products[product]);
      }
    },

    initData: function(){
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
          thisApp.initMenu();
        });

        console.log('thisApp.data: ', JSON.stringify(thisApp.data));
    },

    initCart: function() {
      const thisApp = this;
      const cartElement = document.querySelector(select.containerOf.cart);

      thisApp.cart = new Cart(cartElement);

      const productListElement = document.querySelector(select.containerOf.menu);
      productListElement.addEventListener('add-to-cart', function(event){
        thisApp.cart.add(event.detail);
      });
    },

    initService: function() {
      const thisApp = this;

      thisApp.API = new API();
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('settings:', settings);
  

      thisApp.initService();
      thisApp.initData();
      thisApp.initCart();
    },
  }; 

app.init();

