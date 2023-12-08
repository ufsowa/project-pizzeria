import { select, templates } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js"
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
    constructor(){
        const thisBooking = this;

        console.log(thisBooking)

        thisBooking.dom = {};
        thisBooking.render();
        thisBooking.initElements();
        thisBooking.initActions();
        thisBooking.initWidgets();
    }

    initElements(){
        const thisBooking = this;

        thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
        thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
        thisBooking.dom.form = document.querySelector(select.booking.form);
        thisBooking.dom.formSubmit = document.querySelector(select.booking.formSubmit);
    }

    render(){
        const thisBooking = this;
        thisBooking.dom.container = document.querySelector(select.containerOf.booking);
        const bookingHTML = templates.bookingWidget();
        thisBooking.dom.element = utils.createDOMFromHTML(bookingHTML);
        thisBooking.dom.container.appendChild(thisBooking.dom.element);
    }

    initWidgets(){
        const thisBooking = this;

        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker)

        thisBooking.dom.peopleAmount.addEventListener('updated', function(){
            console.log('update people')
        });

        thisBooking.dom.hoursAmount.addEventListener('updated', function(){
            console.log('update hours')
        });

        thisBooking.dom.datePicker.addEventListener('updated',  function(){
            console.log('select date')
        });

        thisBooking.dom.hourPicker.addEventListener('updated',  function(){
            console.log('select time')
        });
    }

    initActions(){
        const thisBooking = this;

        thisBooking.dom.form.addEventListener('submit', function(event){
            event.preventDefault();
            console.log('stop booking')
         });
    }

}

export default Booking;