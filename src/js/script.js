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
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
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

    initCart: function() {
      const thisApp = this;
      const cartElement = document.querySelector(select.containerOf.cart);

      thisApp.cart = new cart(cartElement);
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
      thisApp.initCart();
    },
  };

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
      thisProduct.element = utils.createDOMFromHTML(productHTML); 
      console.log(thisProduct);
      //menuList.insertAdjacentHTML('beforeend', productHTML);
      menuList.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;
    
      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;
      thisProduct.dom.accordionTrigger.addEventListener('click', function(event){
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
      thisProduct.amountWidget = new amountWidget(thisProduct.dom.amountWidgetElem);
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
      console.log('your order: ', basePrice, formData);
    
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
      console.log('Final / base price: ', totalPrice, ' / ', basePrice); 
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
      app.cart.add(thisProduct.prepareProductSummary());
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

  class amountWidget {
    constructor (element){
      const thisWidget = this;
      thisWidget.element = element;      

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value ?
        thisWidget.input.value :
        settings.amountWidget.defaultValue);
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

      const event = new CustomEvent('updated', {
        bubbles: true,
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class cart {

    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
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
       })

    }

    add(productData) {
      const thisCart = this;
      const cartProductElement = utils.createDOMFromHTML(templates.cartProduct(productData));      
      thisCart.dom.productList.appendChild(cartProductElement);

      thisCart.products.push(new cartProduct(productData, cartProductElement));
      thisCart.update();
    }

    remove(removedProduct) {
      const thisCart = this;
      console.log('remove order: ', removedProduct);
    
      thisCart.products = thisCart.products.filter(function(product) {
        return product != removedProduct;
      });
      removedProduct.dom.wrapper.remove();
      thisCart.update();
    
    }

    update() {
      const thisCart = this;
      const defaultDeliveryFee = settings.cart.defaultDeliveryFee;

      thisCart.totalNumber = 0;
      thisCart.totalPrice = 0;
      thisCart.subtotalPrice = 0;
      thisCart.deliveryFee = 0;

      if (this.products.length > 0) thisCart.deliveryFee = defaultDeliveryFee;
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
  }

  class cartProduct {
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

      console.log('Cart product: ', thisCartProduct);
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

      thisCartProduct.amountWidget = new amountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

        console.log(thisCartProduct);
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
        console.log('edit');
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
  }

  app.init();
}
