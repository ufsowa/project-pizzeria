import { select, templates } from '../settings.js';
import utils from '../utils.js';

class HomePage{
    constructor(){
        const thisPage = this;

        thisPage.dom = {};

        thisPage.render();
    }

    render(){
        const thisPage = this;

        thisPage.dom.container = document.querySelector(select.containerOf.homePage);
        const htmlElement = templates.homePage();
        thisPage.dom.element = utils.createDOMFromHTML(htmlElement);
        thisPage.dom.container.appendChild(thisPage.dom.element);

    }
}

export default HomePage;