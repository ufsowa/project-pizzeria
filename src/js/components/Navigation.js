import { select, classNames} from '../settings.js';

class Navigation {
    constructor(){
        const thisNav = this;

        thisNav.dom = {};
        thisNav.pages = [];

        thisNav.getElements();
        thisNav.initPages();
        thisNav.initActions();

        console.log('Nav: ', thisNav);
    }

    getElements(){
        const thisNav = this;

        thisNav.dom.pages = document.querySelector(select.containerOf.pages).children;
        thisNav.dom.links = document.querySelectorAll(select.nav.links);
    }

    initActions(){
        const thisNav = this;

        for(let link of thisNav.dom.links){
            link.addEventListener('click', function(event){
                const clickedElement = this;
                event.preventDefault();

                const pageId = clickedElement.getAttribute('href').replace('#', '');
                thisNav.activatePage(pageId);

                window.location.hash = '#/' + pageId;
            });
        }
    }

    initPages(){
        const thisNav = this;
        const pageIdFromHash = window.location.hash.replace('#/', '');
        const defaultPageId = thisNav.dom.pages[0].id;

        for(let page of thisNav.dom.pages){
            thisNav.pages.push(page.id);
        }

        if(thisNav.pages.includes(pageIdFromHash)){
            thisNav.activatePage(pageIdFromHash);
        } else {
            thisNav.activatePage(defaultPageId);
            window.location.hash = '#/' + defaultPageId;      
        }
    }

    activatePage(pageId){
        const thisNav = this;
        console.log('Activate: ', pageId);

        for(let page of thisNav.dom.pages){
            page.classList.toggle(classNames.pages.active, page.id === pageId);
        }

        for(let link of thisNav.dom.links){
            link.classList.toggle(classNames.nav.active,
                link.getAttribute('href') === '#' + pageId);
        }
    }
}

export default Navigation;