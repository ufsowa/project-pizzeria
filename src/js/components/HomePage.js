import { select, templates } from '../settings.js';
import utils from '../utils.js';

class HomePage{
    constructor(){
        const thisPage = this;

        thisPage.dom = {};

        thisPage.render();
        thisPage.initElements();
        thisPage.initActions();

        console.log("*** init landing page ***");
        console.log(thisPage);
    }

    render(){
        const thisPage = this;

        thisPage.dom.container = document.querySelector(select.containerOf.homePage);
        const htmlElement = templates.homePage();
        thisPage.dom.element = utils.createDOMFromHTML(htmlElement);
        thisPage.dom.container.appendChild(thisPage.dom.element);
    }

    initElements(){
        const thisPage = this;

        thisPage.dom.links = thisPage.dom.container.querySelectorAll(select.homePage.links);
    }

    initActions(){
        const thisPage = this;

        for(let link of thisPage.dom.links){
            link.addEventListener('click', function(event){
                event.preventDefault();

                const clickedElement = event.currentTarget;
                const redirectToPage = clickedElement.getAttribute('href').replace('#', '');

                const redirectEvent = new CustomEvent('redirect', {
                    bubbles: true,
                    detail: {
                        pageId: redirectToPage,
                    }
                })

                thisPage.dom.container.dispatchEvent(redirectEvent);

                console.log(clickedElement);
            });
        }
    }
}

export default HomePage;