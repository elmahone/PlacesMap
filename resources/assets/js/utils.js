import moment from 'moment';

function windowKeywords(canEdit, placeKeywords = null, allKeywords = null) {
  if(canEdit) {

    let availableKeywords = allKeywords;
    let checkboxes = '';

    if (placeKeywords) {
      checkboxes = placeKeywords
        .map((pk) => `<label class="keyword-label">${pk.label}<input type="checkbox" class="keyword-checkbox" value="${pk.id}" checked/></label>`).join('');

      availableKeywords = allKeywords.filter((keyword) => {
        return !placeKeywords.find((pk) => pk.id === keyword.id);
      });
    }

    const keywordOptions = availableKeywords
      .map((keyword) => `<option value="${keyword.id}">${keyword.label}</option>`).join('');

    return `
    <div id="checkbox-row" class="info-row">
      ${checkboxes}
    </div>
    <div class="info-row">
      <select id="keyword-select">
        ${keywordOptions}
      </select>
      <button id="add-keyword" type="button">Add</button>
    </div>
    <div class="info-row">
      <input id="new-keyword-text" type="text" placeholder="New keyword"/>
      <button id="new-keyword-button" type="button">Create</button>
    </div>`;

  } else {
    let words = '';
    for (const keyword of placeKeywords) {
      words += `<p>${keyword.label}</p>`;
    }
    return words;
  }
}

export default class Utils {
  static getCSRF() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  }

  /**
   * Check if a place is open or not
   * @param {String} openingTime Opening time of a place | example: '10:00'
   * @param {String} closingTime Closing time of a place | example: '22:00'
   * @returns {boolean}
   */
  static isOpen(openingTime, closingTime) {
    let isOpen = false;
    const currentTime = moment().format('HH:mm');
    if(currentTime >= openingTime && currentTime < closingTime) {
      isOpen = true;
    }
    return isOpen;
  }

  static isFavourite(placeId, user) {
    return !!user.favourites.find((favourite) => favourite === placeId);
  }

  static canEdit(place, user) {
    return place.user_id === user.id;
  }
  /**
   * Remove an object with given key from array of objects.
   * Example delete object(s) with id === 3: removeObjFromArray(array,'id',3);
   * @param {Array} array  Array of objects
   * @param {String} objectKey  Target key that is to be compared
   * @param {*} value Delete objects with this value
   * @returns {Array} New array without deleted objects
   */
  static removeObjFromArray(array, objectKey, value) {
    array.forEach((obj, i) => {
      if (obj[objectKey] === value) {
        array.splice(i, 1);
      }
    });
    return array;
  }
  static findPlaces(array, placeIds) {
    let foundPlaces = [];
    for (const id of placeIds) {
      foundPlaces.push(array.find((place) => place.id === id))
    }
    return foundPlaces;
  }
  /**
   * Fetch request with most options filled
   * @param {String} path fetch path
   * @param {String} method GET | POST | PUT | DELETE
   * @param {Object} data post or put data
   */
  static basicFetch(path, method, data = null) {
    const options = {
      method,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': this.getCSRF(),
      },
    }
    if (method === 'POST' || method === 'PUT') {
      options.body = JSON.stringify(data);
    }
    return new Promise((resolve, reject) => {
      fetch(`/api/${path}`, options)
      .then((res) => {
        if(!res.ok) {
          return reject(res);
        }
        return res.json();
      }).then((data) => resolve(data));
    });
  }

  /**
   * HTML Must be in wrapped in a single element
   * @param {String} string HTML string
   */
  static toNode(string) {
    const div = document.createElement('div');
    div.innerHTML = string;
    return div.childNodes[1];
  }

  static createPlaceItem(place) {
    return this.toNode(`
    <div class="footer-item" data-place-id="${place.id}">
      <h3 class="place-title">${place.title}</h3>
      <p class="place-desc">${place.description}</p>
      <p class="place-open">${place.opening_time + ' - '+ place.closing_time}</p>
      <p class="place-open">${this.isOpen(place.opening_time, place.closing_time) ? 'Open now!' : 'Closed now'}</p>
    </div>`);
  }

  static createKeywordItem(keyword) {
    return this.toNode(`
    <div class="footer-item keyword" data-keyword-id="${keyword.id}">
      <h3 class="keyword-label">${keyword.label}</h3>
    </div>`);
  }

  static addCheckbox(keyword, elements) {
    const checkbox = this.toNode(`
    <label class="keyword-label">${keyword.label}
      <input type="checkbox" class="keyword-checkbox" value="${keyword.id}" checked/>
    </label>`);
    elements.checkboxRow.appendChild(checkbox);
    let words = elements.keywordsElem.value.split(',');
    words = words.filter((word) => !!word);
    words.push(keyword.id);
    elements.keywordsElem.value = words;

    return checkbox;
  }

  /**
   * Create a edit or new place form
   * @param {Object} place
   * @param {Object} user User that is logged in
   * @param {Array} keywords Array of keyword objects
   */
  static markerInfoForm(place, user, keywords) {
    if(!place.keyword) place.keyword = [];
    let favouriteBtn = '';
    if(place.id && this.isFavourite(place.id, user)) {
      favouriteBtn = `<button id="favourite-button" type="button" class="button" data-is-favourite="true">Unfavourite</button>`;
    } else if(place.id && !this.isFavourite(place.id, user)) {
      favouriteBtn = `<button id="favourite-button" type="button" class="button" data-is-favourite="false">Favourite</button>`
    }

    return Utils.toNode(`
    <form id="place-form">
      <input type="hidden" name="id" value="${place.id || ''}"/>
      <input type="hidden" name="user_id" value="${place.user_id}"/>
      <input type="hidden" id="place-keywords" name="keywords" value="${place.keyword.map((pk)=>pk.id)}"/>
      <p class="info-help-text">Basic data</p>
      <div class="info-row">
        <input type="text" class="input" name="title" placeholder="Title" value="${place.title || ''}" required/>
      </div>
      <div class="info-row">
        <textarea  class="input" name="description" placeholder="Description..." rows="3" required>${place.description || ''}</textarea>
      </div>
      <p class="info-help-text">Open hours</p>
      <div class="info-row">
        <input type="text" class="input" name="opening_time" placeholder="From"
          pattern="[0-2][0-9]:[0-9][0-9]" title="Enter time with HH:mm format" value="${place.opening_time || ''}" required/>
        <input type="text" class="input" name="closing_time" placeholder="To"
          pattern="[0-9][0-9]:[0-9][0-9]" title="Enter time with HH:mm format" value="${place.closing_time || ''}" required/>
      </div>
      <p class="info-help-text">Coordinates</p>
      <div class="info-row">
        <input type="text" class="input" name="lat" placeholder="Latitude" value="${place.lat}" required/>
        <input type="text" class="input" name="long" placeholder="Longitude" value="${place.long}" required/>
      </div>
      <p class="info-help-text">Keywords</p>
        ${windowKeywords(true, place.keyword, keywords)}
      </div>
      <div class="buttons">
        <input type="submit" class="button green" value="Save" />
        <button type="button" id="delete-button" class="button red">Delete</button>
        ${favouriteBtn}
      </div>
    </form>
    `);
  }

  static markerInfoText(place, user) {
    let favouriteBtn = '';
    if(place.id && this.isFavourite(place.id, user)) {
      favouriteBtn = `<button id="favourite-button" type="button" class="button" data-is-favourite="true">Unfavourite</button>`;
    } else if(place.id && !this.isFavourite(place.id, user)) {
      favouriteBtn = `<button id="favourite-button" type="button" class="button" data-is-favourite="false">Favourite</button>`
    }
    return Utils.toNode(`
    <div id="place-info">
      <input type="hidden" name="id" value="${place.id}"/>
      ${favouriteBtn}
      <h2>${place.title}</h2>
      <p>${place.description}</p>
      <b>Open hours</b>
      <p>${place.opening_time} – ${place.closing_time}</p>
      <b>Latitude</b>
      <p>${place.lat}</p>
      <b>Longitude</b>
      <p>${place.long}</p>
      <b>Created by</b>
      <p>${place.user.username} (${moment(place.created_at).format('DD.MM.YYYY HH:mm')})</p>
      <b>Keywords</b>
      ${windowKeywords(false, place.keyword)}
    </div>
    `);
  }

  /**
   * Create a new google maps marker
   * @param {Number} lat Latitude coordinates
   * @param {Number} lng Longitude coordinates
   * @param {Map} map Google maps instance
   * @param {Object} user User who is logged in
   * @param {Array} infoWindows array of InfoWindows
   */

  static panAndZoom(map, position, zoom) {
    map.setZoom(zoom);
    map.panTo(position);
  }
  static closeWindows(infowindows) {
    if(infowindows) {
      for (const infowindow of infowindows) {
        infowindow.close();
      }
    }
  }
  static removeMarkers(markers) {
    if(markers.length) {
      for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
    }
  }
  static getInfoWindowElements() {
    let elements = {}
    elements.form           = document.querySelector('#place-form') || null;
    elements.idElem         = document.querySelector('#place-form>input[name="id"]') || document.querySelector('#place-info>input[name="id"]');
    elements.deleteBtn      = document.querySelector('#delete-button') || null;
    elements.favouriteBtn   = document.querySelector('#favourite-button') || null;
    elements.newKeywordText = document.querySelector('#new-keyword-text') || null;
    elements.newKeywordBtn  = document.querySelector('#new-keyword-button') || null;
    elements.keywordSelect  = document.querySelector('#keyword-select') || null;
    elements.addKeywordBtn  = document.querySelector('#add-keyword') || null;
    elements.keywordsElem   = document.querySelector('#place-keywords') || null;
    elements.checkboxRow    = document.querySelector('#checkbox-row') || null;
    elements.checkboxes     = document.querySelectorAll('.keyword-checkbox') || null;

    return elements;
  }

}