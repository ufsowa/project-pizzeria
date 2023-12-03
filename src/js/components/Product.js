import {select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js'

class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;     
      thisProduct.dom = {}; 
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initAmoutWidget();
      thisProduct.initOrderForm();
    }

    renderInMenu(){
      const thisProduct = this;
      const menuList = document.querySelector(select.containerOf.menu); 
      const productHTML = templates.menuProduct(thisProduct.data);
      thisProduct.dom.element = utils.createDOMFromHTML(productHTML); 
      //menuList.insertAdjacentHTML('beforeend', productHTML);
      menuList.appendChild(thisProduct.dom.element);
    }

    resetMenu(){
      const thisProduct = this;

      const productHTML = templates.menuProduct(thisProduct.data);
      const productElement = utils.createDOMFromHTML(productHTML); 
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      activeProduct.replaceWith(productElement);
      thisProduct.dom.element = productElement; 
     
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initAmoutWidget();
      thisProduct.initOrderForm();
    }

    getElements(){
      const thisProduct = this;

      thisProduct.dom.accordionTrigger = thisProduct.dom.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.dom.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.dom.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.dom.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.dom.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.dom.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;
      thisProduct.dom.accordionTrigger.addEventListener('click', function(event){
        event.preventDefault();

        //restart all products
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        for (let activeElement of activeProducts) {
          activeElement != thisProduct.dom.element && activeElement.classList.remove(classNames.menuProduct.wrapperActive);
        }
        //active selected product
        thisProduct.dom.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initAmoutWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      })
    }

    initOrderForm(){
      const thisProduct = this;
      thisProduct.processOrder(); //  init order
      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCard();
      });

      for (let input of thisProduct.dom.formInputs) {
        input.addEventListener('change', function(event){
          event.preventDefault();
          thisProduct.processOrder();
        });
      }
    }

    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      const basePrice = thisProduct.data.price;
      let totalPrice = basePrice;
    
      // iterate over all supported params categories 
      for ( let paramID in thisProduct.data.params) {
        // handle missing option category in the form
        if (!Object.prototype.hasOwnProperty.call(formData, paramID)) break;
        //  iterate over all options within category
        for ( let option in thisProduct.data.params[paramID].options) {
          const optionItem = thisProduct.data.params[paramID].options[option];
          const selectedOption = formData[paramID].includes(option)
          optionItem.selected = selectedOption;     // mark as selected
          // update total price when
          if(selectedOption) {                      // option is selected
            if (!optionItem.default) totalPrice += optionItem.price;  // is extra
          } else {                                  // option is not selected 
            if (optionItem.default) totalPrice -= optionItem.price;  // is default
          }
          // update visualization
          let imageClass = '.' + paramID + '-' + option;
          const imageElement = thisProduct.dom.imageWrapper.querySelector(imageClass)
          if (imageElement) {
            selectedOption ? imageElement.classList.add(classNames.menuProduct.imageVisible) :
                        imageElement.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
      //  multiply by amount
      thisProduct.priceSingle = totalPrice;
      totalPrice *= thisProduct.amountWidget.value;
      thisProduct.dom.priceElem.innerHTML = totalPrice;     
    }

    prepareCartProductParams() {
      const thisProduct = this;
      const selectedParams = {};
      for ( let paramID in thisProduct.data.params) {
        if (!Object.prototype.hasOwnProperty.call(selectedParams, paramID)) {
          selectedParams[paramID] = {
            label: thisProduct.data.params[paramID].label,
            options: {},
          }  
        }
        for ( let option in thisProduct.data.params[paramID].options) {
          const optionItem = thisProduct.data.params[paramID].options[option];
          if (optionItem.selected){
            if (!Object.prototype.hasOwnProperty.call(selectedParams[paramID].options, option)) {
              selectedParams[paramID].options[option] = optionItem.label;
            } 
          }
        }
      }
      return selectedParams;
    }

    addToCard() {
      const thisProduct = this;
      //app.cart.add(thisProduct.prepareProductSummary());
    
      const event = new CustomEvent('add-to-cart', {
          bubbles: true,
          detail: thisProduct.prepareProductSummary(),
      });

      thisProduct.dom.element.dispatchEvent(event);

      thisProduct.resetMenu();
    }

    prepareProductSummary() {
      const thisProduct = this;
      const productSummary = {};

      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = productSummary.priceSingle * productSummary.amount;
      productSummary.params = thisProduct.prepareCartProductParams();

      return productSummary;
    }
  }

  export default Product;