import { classNames, settings } from "../settings.js";

class Table {
    constructor(element){
        const thisTable = this;

        thisTable.dom = {};
        thisTable._reserved = false;
        thisTable._selected = false;

        thisTable.init(element);
    }

    init(wrapper){
        const thisTable = this;

        thisTable.dom.wrapper = wrapper;

        thisTable.id = parseTableId(thisTable.dom.wrapper);
        
        // thisTable.dom.wrapper.addEventListener('click', function(event){
        //     event.preventDefault();

        //     if(!thisTable.reserved){
        //         const updateEvent = new CustomEvent('reserved', {
        //             bubbles: true,
        //             detail: thisTable.id,
        //         });

        //         thisTable.dom.wrapper.dispatchEvent(updateEvent);
        //     }
        // });
    }

    set reserved(value){
        const thisTable = this;

        thisTable._reserved = value;
        thisTable.render();
    }

    get reserved(){
        const thisTable = this;

        return thisTable._reserved;
    }

    set selected(value){
        const thisTable = this;

        if(thisTable.selected && value === true){
            thisTable._selected = false;
        } else {
            thisTable._selected = value;
        }
        console.log('render selected')
        thisTable.render();
    }

    get selected(){
        const thisTable = this;

        return thisTable._selected;
    }

    render(){
        const thisTable = this;

        if(thisTable.reserved){
            thisTable.dom.wrapper.classList.add(classNames.booking.tableBooked);
        } else {
            thisTable.dom.wrapper.classList.remove(classNames.booking.tableBooked);
        }

        if(thisTable.selected){
            console.log('add style: ', classNames.booking.tableSelected)
            thisTable.dom.wrapper.classList.add(classNames.booking.tableSelected);
        } else {
            console.log('del style: ', classNames.booking.tableSelected)
            thisTable.dom.wrapper.classList.remove(classNames.booking.tableSelected);
        }
    }

}

export function parseTableId(htmlElement){
    let tableId = htmlElement.getAttribute(settings.booking.tableIdAttribute);
    if(!isNaN(tableId)){
        tableId = parseInt(tableId);
    }
    return tableId;
}

export default Table;