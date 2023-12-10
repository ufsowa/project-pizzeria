import { templates, select } from "../settings.js";
import utils from "../utils.js";

class Alert {
    constructor(message){
        const thisAlert = this;

        thisAlert.data = {};
        thisAlert.dom = {};

        thisAlert.init(message);
        thisAlert.initActions();
 
        return thisAlert.dom.element;
    }

    init(message){
        const thisAlert = this;

        thisAlert.data.message = message;

        const alertHTML = templates.alertTpl(thisAlert.data);
        thisAlert.dom.element = utils.createDOMFromHTML(alertHTML);
    }

    initActions(){
        window.addEventListener('click', function(event){
            event.preventDefault();
            const alertsElements = document.querySelectorAll(select.alerts);

            for(let alertNode of alertsElements){
                alertNode.parentNode.removeChild(alertNode);
            }
        });
    }
}

export default Alert;