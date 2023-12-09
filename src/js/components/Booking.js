import { classNames, select, settings, templates } from "../settings.js";
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
        thisBooking.getData();
    }

    initElements(){
        const thisBooking = this;

        thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
        thisBooking.dom.form = document.querySelector(select.booking.form);
        thisBooking.dom.formSubmit = document.querySelector(select.booking.formSubmit);
        thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);

        thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
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

        thisBooking.dom.container.addEventListener('updated',  function(){
            console.log('booking updated');
            thisBooking.updateDOM();
        });
    }

    initActions(){
        const thisBooking = this;

        thisBooking.dom.form.addEventListener('submit', function(event){
            event.preventDefault();
            console.log('stop booking')
         });
    }

    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
        
        const querParams = {
            bookings: [
                startDateParam,
                endDateParam,                        
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,        
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                startDateParam,
                endDateParam,
            ],
        };

        const urls = {
            bookings:        settings.db.url + '/' + settings.db.bookings
                                            + '?' + querParams.bookings.join('&'),
            eventsCurrent:  settings.db.url + '/' + settings.db.events
                                            + '?' + querParams.eventsCurrent.join('&'),
            eventsRepeat:   settings.db.url + '/' + settings.db.events
                                            + '?' + querParams.eventsRepeat.join("&"),
        };

        Promise.all([
            fetch(urls.bookings),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ]
        ).then(function(responseAll){
            const bookingsResp = responseAll[0];
            const eventsCurrentResp = responseAll[1];
            const eventsRepeatResp = responseAll[2];
            return Promise.all([
                bookingsResp.json(),
                eventsCurrentResp.json(),
                eventsRepeatResp.json(),
            ]);
        })
        .then(function([bookings, eventsCurrent, eventsRepeat]){
            thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
            thisBooking.updateDOM();
        });

    }

    parseData(bookings, eventsCurrent, eventsRepeat){
        const thisBooking = this;

        thisBooking.booked = {};

        console.log('bookings: ', bookings)
        console.log('events: ', eventsCurrent)
        console.log('repeats: ', eventsRepeat)

        for (let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }
        for (let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }
        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;
        for (let item of eventsRepeat){
            if(item.repeat == 'daily'){
                console.log('repeat for: ', item);
                for(let loopDate = minDate; loopDate <= maxDate; loopDate=utils.addDays(loopDate, 1)){
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }
        console.log(thisBooking.booked);

    }

    makeBooked(date, hour, duration, table){
        const thisBooking = this;

        if(!thisBooking.booked[date]){
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){

            if(!thisBooking.booked[date][hourBlock]){
                thisBooking.booked[date][hourBlock] = [];
            }
            if(thisBooking.booked[date][hourBlock].includes(table)){
                console.warn('Table over booked for:\n', table, date, hourBlock);
                console.log(thisBooking.booked)
            }
            thisBooking.booked[date][hourBlock].push(table);
        }
    }

    updateDOM(){
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;

        if(!thisBooking.booked[thisBooking.date] || !thisBooking.booked[thisBooking.date][thisBooking.hour]){
            allAvailable = true;
        }

        for(let table of thisBooking.dom.tables){
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if(!isNaN(tableId)){
                tableId = parseInt(tableId);
            }
            console.log('check table:', table, thisBooking.date, thisBooking.hour);
            if(!allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ){
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
    }

}

export default Booking;