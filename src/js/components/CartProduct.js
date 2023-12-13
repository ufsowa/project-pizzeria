import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js'

  class CartProduct {
    constructor(productData, productElement) {
      const thisCartProduct = this;

      thisCartProduct.id = productData.id;
      thisCartProduct.name = productData.name;
      thisCartProduct.params = productData.params;
      thisCartProduct.priceSingle = productData.priceSingle;
      thisCartProduct.amount = productData.amount;
      thisCartProduct.price = productData.price;

      thisCartProduct.getElements(productElement);
      thisCartProduct.initAmoutWidget();
      thisCartProduct.initActions();
    }

    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmoutWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      })
    }

    initActions() {
      const thisCartProduct = this;

      thisCartProduct.dom.remove.addEventListener('click', function(event) {
        event.preventDefault();
        thisCartProduct.remove();
      });
      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      })
    }

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('removed', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      })
    
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    getData(){
      const thisCartProduct = this;
      return {
        id: thisCartProduct.id,
        name: thisCartProduct.name,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        params: thisCartProduct.prepareParams(),
      };
    }

    prepareParams(){
      const thisCartProduct = this;
      const orderedParams = {};
      for (let paramID in thisCartProduct.params){
        orderedParams[paramID] = [];
        for (let option in thisCartProduct.params[paramID].options){
          orderedParams[paramID].push(option);
        }
      }
      return orderedParams;
    }
  }

  export default CartProduct;