
class BaseWidget {
    constructor(wrapperElement, initialValue){
        const thisWidget = this;
        thisWidget.dom = {};
        thisWidget.currentValue = initialValue;
        thisWidget.dom.wrapper = wrapperElement;
    }

    get value() {
        const thisWidget = this;

        return thisWidget.currentValue;
    }

    set value(value){
        const thisWidget = this;

        const newValue = thisWidget.parseValue(value);

        if(newValue !== thisWidget.currentValue
            && thisWidget.isValid(newValue)){
            thisWidget.currentValue = newValue;
            thisWidget.announce();
        }

        thisWidget.renderValue();
    }

    setValue(value){
        const thisWidget = this;

        thisWidget.value = value;
    }

    parseValue(value){
        return parseInt(value);
    }

    isValid(value){
        return !isNaN(value);
    }

    renderValue(){
        const thisWidget = this;

        thisWidget.dom.wrapper.innerHTML = thisWidget.value;
    }

    announce(){
        const thisWidget = this;

        const event = new CustomEvent('updated', {
            bubbles: true,
        });

        thisWidget.dom.wrapper.dispatchEvent(event);
    }

}

export default BaseWidget;