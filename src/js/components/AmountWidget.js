import {select, settings} from '../settings.js';


class AmountWidget {
    constructor (element){
      const thisWidget = this;
      thisWidget.element = element;

      thisWidget.dom = {};

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.dom.input.value ?
        thisWidget.dom.input.value :
        settings.amountWidget.defaultValue);
      thisWidget.initActions();
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.dom.input = element.querySelector(select.widgets.amount.input);
      thisWidget.dom.lessBtn = element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.dom.moreBtn = element.querySelector(select.widgets.amount.linkIncrease);
    }

    initActions(){
      const thisWidget = this;

      thisWidget.dom.input.addEventListener('change', function(event) {
        console.log('change: ', event)
        event.preventDefault();
        thisWidget.setValue(thisWidget.dom.input.value);
      });
      thisWidget.dom.input.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
        console.log('enter: ', event)
        event.preventDefault();
        thisWidget.setValue(thisWidget.dom.input.value);
        }
      });
      thisWidget.dom.lessBtn.addEventListener('click', function(event){
        event.preventDefault(); 
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.dom.moreBtn.addEventListener('click', function(event) {
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

      thisWidget.dom.input.value = thisWidget.value;
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

export default AmountWidget;