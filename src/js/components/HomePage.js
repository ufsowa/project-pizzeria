import { select, templates } from '../settings.js';
import utils from '../utils.js';

class HomePage{
    constructor(){
        const thisPage = this;

        thisPage.dom = {};

        thisPage.render();
        thisPage.initElements();
        thisPage.initActions();
        thisPage.initCarusel();
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
        thisPage.dom.carousel = thisPage.dom.container.querySelector(select.homePage.carousel);
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
            });
        }
    }

    initCarusel(){
        const thisPage = this;

        const carouselElement = thisPage.dom.carousel;
      //  eslint-disable-next-line no-undef
        new Flickity(carouselElement, {
            cellAlign: 'center',
            contain: true,
            autoPlay: 3000,
        })

    }
}

export default HomePage;