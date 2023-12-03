import {select, templates, classNames, settings} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {

    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
    }

    resetCart(){
      const thisCart = this;

      thisCart.dom.wrapper.classList.remove(classNames.cart.wrapperActive);

      thisCart.dom.productList.innerHTML = "";
      thisCart.dom.address.value = "";
      thisCart.dom.phone.value = "";

      thisCart.products = [];
      thisCart.update();
    }

    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);

      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    }

    initActions() {
      const thisCart = this;
      
      thisCart.update();

      thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
        event.preventDefault();

        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function() {
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('removed', function(event) {
        thisCart.remove(event.detail.cartProduct);
      });

       thisCart.dom.form.addEventListener('submit', function(event){
          event.preventDefault();
          thisCart.submitOrder();
       });
    }

    add(productData) {
      const thisCart = this;
      const cartProductElement = utils.createDOMFromHTML(templates.cartProduct(productData));      
      thisCart.dom.productList.appendChild(cartProductElement);

      thisCart.products.push(new CartProduct(productData, cartProductElement));
      thisCart.update();
    }

    remove(productToRemove) {
      const thisCart = this;
      console.log('remove order: ', productToRemove);
    
      thisCart.products = thisCart.products.filter(function(product) {
        return product != productToRemove;
      });
      productToRemove.dom.wrapper.remove();
      thisCart.update();
    
    }

    update() {
      const thisCart = this;
      const defaultDeliveryFee = settings.cart.defaultDeliveryFee;

      thisCart.totalNumber = 0;
      thisCart.totalPrice = 0;
      thisCart.subtotalPrice = 0;
      thisCart.deliveryFee = 0;

      if (thisCart.products.length > 0) thisCart.deliveryFee = defaultDeliveryFee;
      for (let product of thisCart.products) {
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      for (let totalPriceElement of thisCart.dom.totalPrice) {
        totalPriceElement.innerHTML = thisCart.totalPrice;
      }
    }

    submitOrder(){
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;

      const orderedProducts = thisCart.prepareCartProducts();

      if (orderedProducts.length === 0) return;

      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: orderedProducts,
      };

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      };
        
      fetch(url, requestOptions)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(response){
          console.log('Order success: ', response);
          thisCart.resetCart();
        });
    }

    prepareCartProducts(){
      const thisCart = this;
      const cartProducts = [];

      for (let product of thisCart.products){
        cartProducts.push(product.getData());
      }
      return cartProducts;    
    }
  }

export default Cart;