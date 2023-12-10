import { classNames, select, settings, templates } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js"
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";
import Table, { parseTableId } from "./Table.js";
import Alert from "./Alert.js";

class Booking {
    constructor(){
        const thisBooking = this;

        console.log(thisBooking)

        thisBooking.dom = {};
        thisBooking.tables = [];
        thisBooking.selectedTableId = undefined;
        thisBooking.date = undefined;
        thisBooking.hour = undefined;
        thisBooking.duration = undefined;
        thisBooking.starters = [];

        thisBooking.render();
        thisBooking.getData();

        console.log('*** Booking initiated ***');
        console.log(thisBooking);
    }

    render(){
        const thisBooking = this;
        thisBooking.dom.container = document.querySelector(select.containerOf.booking);
        const bookingHTML = templates.bookingWidget();
        thisBooking.dom.element = utils.createDOMFromHTML(bookingHTML);
        thisBooking.dom.container.appendChild(thisBooking.dom.element);

        thisBooking.initElements();
        thisBooking.initActions();
        thisBooking.initWidgets();
        thisBooking.initTables();
    }

    initElements(){
        const thisBooking = this;

        thisBooking.dom.widget = document.querySelector(select.booking.widget);
        thisBooking.dom.peopleAmount = thisBooking.dom.widget.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.widget.querySelector(select.booking.hoursAmount);
        thisBooking.dom.form = thisBooking.dom.widget.querySelector(select.booking.form);
        thisBooking.dom.formSubmit = thisBooking.dom.form .querySelector(select.booking.formSubmit);
        thisBooking.dom.tables = thisBooking.dom.form.querySelectorAll(select.booking.tables);
        thisBooking.dom.room = thisBooking.dom.form .querySelector(select.booking.room);
        thisBooking.dom.options = thisBooking.dom.form.querySelector(select.booking.options);
        thisBooking.dom.orderConfirm = thisBooking.dom.form.querySelector(select.booking.orderConfirm);
        thisBooking.dom.inputs = thisBooking.dom.form.querySelectorAll(select.all.formInputs);

        thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);    
    }

    initTables(){
        const thisBooking = this;

        for(let table of thisBooking.dom.tables){
            thisBooking.tables.push(new Table(table));
        }

        thisBooking.dom.room.addEventListener('click', function(event){
            event.preventDefault();
            
            const clickedElement = event.target;
            
            if(!clickedElement.classList.contains(classNames.booking.table)) return;
            if(clickedElement.classList.contains(classNames.booking.tableBooked)) {
                // display alert
                event.stopPropagation();
                thisBooking.dom.widget.appendChild(new Alert('Table is booked'));
                return;
            }

            thisBooking.selectedTableId = parseTableId(clickedElement);
            console.log('selected: ', thisBooking.selectedTableId);

            thisBooking.updateSelectedDOM(thisBooking.selectedTableId);
        });

        thisBooking.dom.room.addEventListener('selectedUpdated', function(event){
            const clickedTableId = event.detail.tableId;
            const selected = event.detail.selected;

            if(thisBooking.selectedTableId === clickedTableId) {
                thisBooking.selectedTableId = selected ? clickedTableId : undefined;
            }
            console.log('mark as selected: ', clickedTableId, selected, thisBooking.selectedTableId);
        });

    }

    updateSelectedDOM(selectedTableId = undefined){   
        const thisBooking = this;

        for(let table of thisBooking.tables){
            console.log('table: ',table.reserved, table)
            if(table.id === selectedTableId){
                table.selected = true;
            } else {
                table.selected = false;
            }
        }
    }

    initWidgets(){
        const thisBooking = this;

        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker)

        thisBooking.duration = thisBooking.hoursAmountWidget.value;
        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = thisBooking.hourPicker.value;
        thisBooking.ppl = thisBooking.peopleAmountWidget.value;

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
            console.log('select hour')
        });

        thisBooking.dom.container.addEventListener('updated',  function(){
            console.log('booking updated');
            thisBooking.duration = thisBooking.hoursAmountWidget.value;
            thisBooking.date = thisBooking.datePicker.value;
            thisBooking.hour = thisBooking.hourPicker.value;
            thisBooking.ppl = thisBooking.peopleAmountWidget.value;

            thisBooking.updateDOM();
            thisBooking.updateSelectedDOM();
        });
    }

    initActions(){
        const thisBooking = this;

        for(let input of thisBooking.dom.inputs){
            input.addEventListener('keypress', function(event){
            //  block enter to submit booking
            if(event.keyCode === 13){
                event.preventDefault();
                event.stopPropagation();
            }
         });
        }

        thisBooking.dom.options.addEventListener('click', function(event){
            const clickedElement = event.target;


            if(    clickedElement.tagName === 'INPUT'
                && clickedElement.type === 'checkbox'
                && clickedElement.name === 'starter'
            ){
                const starterName = clickedElement.value;
                const starterIndex = thisBooking.starters.indexOf(starterName);

                if (clickedElement.checked && !(starterIndex >= 0)) {
                    thisBooking.starters.push(starterName);
                } else {
                    thisBooking.starters.splice(starterIndex, 1);
                }
            }
        });

        thisBooking.dom.orderConfirm.addEventListener('change', function(event){
            event.preventDefault();
            event.stopPropagation();
            const clickedElement = event.target;
  
            console.log('update confirm: ', event);

            if(    clickedElement.tagName === 'INPUT'){
                console.log('type: ', clickedElement.name);
                if(clickedElement.name === 'address')
                    thisBooking.address = clickedElement.value;
            
                if(clickedElement.name === 'phone')
                    thisBooking.phone = clickedElement.value;   
            }

            console.log('booking: ',thisBooking)
        });


        thisBooking.dom.orderConfirm.addEventListener('click', function(event){
            event.preventDefault();
            event.stopPropagation();

            const clickedElement = event.target;

            if(clickedElement.tagName === 'BUTTON'){
                console.log('send booking: ', event);
                thisBooking.sendBooking();
            }
        });
    }

    sendBooking(){
        const thisBooking = this;

        if(!thisBooking.selectedTableId){
            console.log('Alert no table selectes')
            thisBooking.dom.widget.appendChild(new Alert('Table was not selected'));
            return;
        }

        const url = settings.db.url + '/' + settings.db.bookings;
        const payload = thisBooking.getBooking();
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify(payload),
        };

        fetch(url, requestOptions)
            .then(function(rawResponse){
                return rawResponse.json();
            })
            .then(function(response){
                console.log('Order success: ', response);
                thisBooking.makeBooked( response.date,
                                        response.hour,
                                        response.duration,
                                        response.table);
                thisBooking.updateDOM();
                thisBooking.updateSelectedDOM();
                thisBooking.clearBooking();
            });
   }

    getBooking(){
        const thisBooking = this;

        return {
            date: thisBooking.date,
            hour: thisBooking.hour,
            duration: parseInt(thisBooking.duration), 
            table: parseInt(thisBooking.selectedTableId),
            ppl: parseInt(thisBooking.ppl),
            starters: thisBooking.starters,
            phone: thisBooking.phone,
            address: thisBooking.address,
        };
    }

    clearBooking(){
        const thisBooking = this;

        thisBooking.selectedTableId = undefined;
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

        for (let timeBlock = 0; timeBlock < duration; timeBlock++){
            let hourBlock = startHour + timeBlock*0.5; 
            if(!thisBooking.booked[date][hourBlock]){
                thisBooking.booked[date][hourBlock] = [];
            }
            if(thisBooking.checkHourBooked(date,hourBlock,table)){
                console.warn('Table over booked for:\n', table, date, hourBlock);
                console.log(thisBooking.booked)
            }
            thisBooking.booked[date][hourBlock].push(table);
        }
    }

    checkHourBooked(date, hour, table = undefined){
        const thisBooking = this;

     //   console.log('check: ', date, hour, table);

        if(!thisBooking.booked[date]){
    //       console.log('true date')
            return false;
        }

        if(!thisBooking.booked[date][hour]){
    //        console.log('true hour')
            return false;
        }

        if(!table){
            return true;
        } else {
            if(thisBooking.booked[date][hour].includes(table)){
    //            console.log('true table')
                return true;
            } else {
                return false;
            }
        }
    }

    checkTimeRangeBooked(date, startHour, duration, table = undefined){
        const thisBooking = this;

        for (let block = 0; block < duration; block++){
            let hour = startHour + block*0.5; 
            if(thisBooking.checkHourBooked(date,hour,table)){
                console.log('range occupied', date, hour, table);
                return true
            }
        }
        console.log('range free');
        return false;
    }

    updateDOM(){
        const thisBooking = this;
        console.log('update booking');
        const date = thisBooking.date;
        const startHour = utils.hourToNumber(thisBooking.hour);
        const duration = thisBooking.duration;

        let allAvailable = false;
        
        if(!thisBooking.checkTimeRangeBooked(date, startHour, duration)){
            allAvailable = true;
        }
        console.log('available: ', allAvailable);

        for(let table of thisBooking.tables){
            console.log('check table:', table.id, thisBooking.date, startHour, duration);
            if(!allAvailable
                &&
                thisBooking.checkTimeRangeBooked(date, startHour, duration, table.id)
            ){
                table.reserved = true;
            } else {
                table.reserved = false;
            }
        }

        console.log('reserved: ', thisBooking.booked);
    }

}

export default Booking;