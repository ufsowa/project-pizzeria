/* global utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
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
      thisProduct.initAmoutWidget();
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
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
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

    initAmoutWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new amountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      })
    }

    initOrderForm(){
      const thisProduct = this;
      thisProduct.processOrder(); //  init order
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
    
      // iterate over all supported params categories 
      for ( let paramID in thisProduct.data.params) {
        // handle missing option category in the form
        if (!Object.prototype.hasOwnProperty.call(formData, paramID)) break;
        //  iterate over all options within category
        for ( let option in thisProduct.data.params[paramID].options) {
          const optionItem = thisProduct.data.params[paramID].options[option];
          const selectedOption = formData[paramID].includes(option)
          // update total price when
          if(selectedOption) {                      // option is selected
            if (!optionItem.default) totalPrice += optionItem.price;  // is extra
          } else {                                  // option is not selected 
            if (optionItem.default) totalPrice -= optionItem.price;  // is default
          }
          // update visualization
          let imageClass = '.' + paramID + '-' + option;
          const imageElement = thisProduct.imageWrapper.querySelector(imageClass)
          if (imageElement) {
            selectedOption ? imageElement.classList.add(classNames.menuProduct.imageVisible) :
                        imageElement.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
      //  multiply by amount
      totalPrice *= thisProduct.amountWidget.value;
      console.log('Final / base price: ', totalPrice, ' / ', basePrice); 
      thisProduct.priceElem.innerHTML = totalPrice;     
    }
  }

  class amountWidget {
    constructor (element){
      const thisWidget = this;
      thisWidget.element = element;      
      console.log('myWidget: ', thisWidget);

      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.input = element.querySelector(select.widgets.amount.input);
      thisWidget.lessBtn = element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.moreBtn = element.querySelector(select.widgets.amount.linkIncrease);
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.lessBtn.addEventListener('click', function(event){
        event.preventDefault(); 
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.moreBtn.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);

      if ( !isNaN(newValue) && newValue !== thisWidget.value) {
        if ( settings.amountWidget.defaultMax >= newValue &&
             settings.amountWidget.defaultMin <= newValue )     
          thisWidget.value = newValue      
      }

      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }

    announce(){
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }

  }

  app.init();
}
