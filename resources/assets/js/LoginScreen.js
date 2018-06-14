import Utils from './utils';

export class LoginScreen {
  constructor(parent) {
    this.parent = parent;
    // Generate DOM
    this._render();

    this.loginForm      = document.querySelector('#login-form');
    this.usernameInput  = document.querySelector('#username');

    // this._login('Sydnie');
    this._bindActions();
  }

  _bindActions() {
    this.loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this._login(this.usernameInput.value);
    });
  }

  _login(username) {
    Utils.basicFetch('login', 'POST', { username })
    .then((data) => {
      this._unrender();
      this.parent._onLogin(data);
    }, (failedData) => {
      console.log('Login failed try refreshing the page!');
      console.log(failedData);
    });
  }

  _render() {
    this.parent.nav.innerHTML = '<ul><li><b>Places Map</b></li></ul>';
    this.parent.footer.innerHTML = '';

    const login = Utils.toNode(`
    <div id="login">
      <div id="login-container">
        <form id="login-form">
          <label for="username"><h1>Who are you ?</h1></label>
          <input id="username" class="input big" type="text" name="map_username" placeholder="Username" required/>
          <input id="login-button" class="button big" type="submit" value="OK"/>
        </form>
      </div>
    </div>`);
    this.parent.container.appendChild(login);
  }
  _unrender() {
    this.parent.nav.innerHTML       = '';
    this.parent.footer.innerHTML    = '';
    this.parent.container.innerHTML = '';
  }
}