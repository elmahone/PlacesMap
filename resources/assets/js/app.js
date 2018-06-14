import moment from 'moment';
import Utils from './utils';
import { LoginScreen } from './LoginScreen';
import { Main } from './Main';

export default class App {
  constructor() {
    this.nav        = document.querySelector('nav');
    this.container  = document.querySelector('#container');
    this.footer     = document.querySelector('footer');
    this.user       = null;
    this.map        = null;
    this.allPlaces  = null;
    new LoginScreen(this);
  }
  _onLogin(user) {
    this.user             = user;
    this.user.favourites  = user.favourites.map((place) => place.id);
    this.user.places      = user.places.map((place) => place.id);

    this._initMain();
  }
  _initMain() {
    new Main(this);
  }
}
new App();