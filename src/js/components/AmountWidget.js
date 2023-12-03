import {select, settings} from '../settings.js';


class AmountWidget {
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

export default AmountWidget;