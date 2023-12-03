import {settings} from './settings.js';

class API {
    constructor(){
      const thisAPI = this;
  
      thisAPI.baseURL = settings.db.url;
    }
  }

  export default API;