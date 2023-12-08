import {select, settings} from '../settings.js';
import BaseWidget from './BasicWidget.js';


class AmountWidget extends BaseWidget {
    constructor (element){
      super(element, settings.amountWidget.defaultValue);

      const thisWidget = this;

      thisWidget.getElements();
      thisWidget.setValue(thisWidget.dom.input.value ?
        thisWidget.dom.input.value :
        settings.amountWidget.defaultValue);
      thisWidget.initActions();
    }

    getElements() {
      const thisWidget = this;

      thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
      thisWidget.dom.lessBtn = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.dom.moreBtn = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
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

    isValid(value){
      return !isNaN(value)
        && settings.amountWidget.defaultMax >= value
        && settings.amountWidget.defaultMin <= value;  
    }

    renderValue(){
      const thisWidget = this;
      thisWidget.dom.input.value = thisWidget.value;
    }
  }

export default AmountWidget;