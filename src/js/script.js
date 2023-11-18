/* global utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  const app = {
    initMenu: function(){
      const thisApp = this;

      console.log('thisApp.data: ', thisApp.data);

      for ( let product in thisApp.data.products) {
        new Product(product, thisApp.data.products[product]);
      }
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;      
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
    }

    renderInMenu(){
      const thisProduct = this;
      const menuList = document.querySelector(select.containerOf.menu); 
      const productHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(productHTML); 
      console.log(thisProduct);
      //menuList.insertAdjacentHTML('beforeend', productHTML);
      menuList.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    }

    initAccordion(){
      const thisProduct = this;
      thisProduct.accordionTrigger.addEventListener('click', function(event){
        const clickedElement = this;
        console.log('clicked element: ', clickedElement);
        event.preventDefault();

        //restart all products
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        for (let activeElement of activeProducts) {
          activeElement != thisProduct.element && activeElement.classList.remove(classNames.menuProduct.wrapperActive);
        }
        //active selected product
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm(){
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function(event){
          event.preventDefault();
          thisProduct.processOrder();
        });
      }
    }

    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      const basePrice = thisProduct.data.price;
      let totalPrice = basePrice;
      console.log('your order: ', basePrice, formData);
      // check all supported params categories 
      for ( let paramID in thisProduct.data.params) {
//        console.log('category: ', category, formData.hasOwnProperty(category));
        if (!Object.prototype.hasOwnProperty.call(formData, paramID)) break;  // missing option category in the form
        for ( let option in thisProduct.data.params[paramID].options) {
//          console.log('option: ', option, formData[category]);
            const optionItem = thisProduct.data.params[paramID].options[option];
            // update total price for
            if(formData[paramID].includes(option)) { // option is selected
              if (!optionItem.default) totalPrice += optionItem.price;  // is extra
//                console.log('added: ', totalPrice, optionItem);
            } else {                                  // option is not selected 
              if (optionItem.default) totalPrice -= optionItem.price;  // is default
//                console.log('removed: ', totalPrice, optionItem);
          }
        }
      }
      console.log('Final / base price: ', totalPrice, ' / ', basePrice); 
      thisProduct.priceElem.innerHTML = totalPrice;     
    }
  }

  app.init();
}
