import Utils from './utils';

export class Main {
  constructor(parent) {
    this.parent         = parent;

    this.map            = null;
    this.mapMarkers     = []; // All Marker instances that are on the map
    this.infoWindows    = []; // All InfoWindow instances that are on the map
    this.renderedPlaces = []; // All the places that are rendered on the map currently
    this.allPlaces      = []; // All the places in the system
    this.allKeywords    = []; // Active keywords that are used for filtering
    this.activeKeywords = []; // Active keywords that are used for filtering

    this._render();

    // Nav bar links
    this.favouritesLink = document.querySelector('#favourites-link');
    this.searchLink     = document.querySelector('#search-link');
    this.filterLink     = document.querySelector('#filter-link');
    this.myPlacesLink   = document.querySelector('#my-places-link');

    // Checkbox for toggling open places
    this.toggleOpen     = document.querySelector('#toggle-open');
    this.onlyOpen       = false;

    // Footer elements
    this.menuType       = null; // null, 'filter', 'search', 'favourites', 'myPlaces'
    this.footerContent  = document.querySelector('#footer-content');
    this.menuToggle     = document.querySelector('#menu-toggle');
    this.footerHeader   = document.querySelector('#footer-header');
    this.searchContainer= document.querySelector('#search-container');
    this.mapPlaces      = document.querySelector('#map-places');

    // Activate event listeners last
    this._bindActions();
  }
  _bindActions() {
    this.menuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      this.footerContent.classList.add('hidden');
      this.footerHeader.innerHTML = '';
      this.mapPlaces.innerHTML = '';
      this.menuType = null;
    });

    this.myPlacesLink.addEventListener('click', (e) => {
      e.preventDefault();
      if(this.menuType === 'myPlaces') return;
      this._setUpMyMenu(Utils.findPlaces(this.allPlaces, this.parent.user.places));
      this.footerHeader.innerHTML = '<h1>My Places</h1>';
      this.menuType = 'myPlaces';
      this.footerContent.classList.remove('hidden');
    });

    this.favouritesLink.addEventListener('click', (e) => {
      e.preventDefault();
      if(this.menuType === 'favourites') return;
      this._setUpMyMenu(Utils.findPlaces(this.allPlaces, this.parent.user.favourites));
      this.footerHeader.innerHTML = '<h1>Favourites</h1>';
      this.menuType = 'favourites';
      this.footerContent.classList.remove('hidden');
    });

    this.searchLink.addEventListener('click', (e) => {
      e.preventDefault();
      if(this.menuType === 'search') return;
      this._setUpSearchMenu();
      this.footerHeader.innerHTML = '<h1>Search</h1>';
      this.menuType = 'search';
      this.footerContent.classList.remove('hidden');
    });

    this.filterLink.addEventListener('click', (e) => {
      e.preventDefault();
      if(this.menuType === 'filter') return;
      this._setUpFilterMenu();
      this.footerHeader.innerHTML = '<h1>Filter by a keyword</h1>';
      this.menuType = 'filter';
      this.footerContent.classList.remove('hidden');
    })

    this.toggleOpen.addEventListener('change', ({target}) => {
      if(!this.map) return;
      this.onlyOpen = target.checked;
      this._placeMarkers(this.map);
    });
  }

  // Map setup
  _initMap() {
    const options = {
      center: {
        lat: 60.1693688,
        lng: 24.9277736,
      },
      zoom: 5,
      disableDefaultUI: true,
    };
    const map = new google.maps.Map(document.querySelector('#map'), options);
    map.addListener('click', (data) => {
      const { marker, infowindow } = this._newMarker(data.latLng.lat(), data.latLng.lng(), map);
      map.setZoom(8);
      map.panTo(marker.getPosition());
      this.mapMarkers.push(marker);
      this.infoWindows.push(infowindow);
    });
    this.renderedPlaces = this.allPlaces;
    this._placeMarkers(map);
    return map;
  }
  _placeMarkers(map) {
    Utils.removeMarkers(this.mapMarkers, map);
    this.mapMarkers = [];
    this.infoWindows = [];
    let places = this.renderedPlaces;
    if(this.onlyOpen) {
      places = places.filter((place) => Utils.isOpen(place.opening_time, place.closing_time));
    }
    const filteredPlaces = places;
    for (const place of filteredPlaces) {
      const { marker, infowindow } = this._placeMarker(map, place);
      this.mapMarkers.push(marker);
      this.infoWindows.push(infowindow);
    }
    this._addMarkerListeners(map);
  }

  // Map actions
  _newMarker(lat, lng, map) {
    Utils.closeWindows(this.infoWindows);
    const marker = new google.maps.Marker({
      position: {lat, lng},
      map,
      title: 'Click for info',
    });
    let infoContent = Utils.markerInfoForm({
      lat: lat,
      long: lng,
      user_id: this.parent.user.id
    }, this.parent.user, this.allKeywords);

    const infowindow = new google.maps.InfoWindow({content: infoContent});
    infowindow.open(map, marker);
    infowindow.addListener('domready', () => {
      const elements = Utils.getInfoWindowElements();

      // Add listeners to the form
      if(!elements.form.dataset.hasListener) {
        elements.form.dataset.hasListener = true;
        elements.form.addEventListener('submit', (e) => {
          e.preventDefault();
          this._submitForm(elements, e.target.elements, elements.deleteBtn);
        });
        elements.deleteBtn.addEventListener('click', () => { marker.setMap(null) });
        elements.newKeywordBtn.addEventListener('click', () => {
          this._newKeywordListener(elements);
        });
        elements.addKeywordBtn.addEventListener('click', () => {
          this._addKeyworListener(elements);
        });
      }
    });
    marker.addListener('click', () => {
      Utils.closeWindows(this.infoWindows);
      Utils.panAndZoom(map, marker.getPosition(), 8);
      infowindow.open(map, marker);
    });
    return { marker, infowindow };
  }
  _placeMarker(map, data) {
    const marker = new google.maps.Marker({
      position: {lat: data.lat, lng: data.long},
      map,
      title: 'Click for info',
      placeId: data.id
    });
    let infoContent = null;
    if(Utils.canEdit(data, this.parent.user)) {
      infoContent = Utils.markerInfoForm(data, this.parent.user, this.allKeywords);
    } else {
      infoContent = Utils.markerInfoText(data, this.parent.user);
    }
    const infowindow = new google.maps.InfoWindow({content: infoContent});

    return { marker, infowindow };
  }
  _addMarkerListeners(map) {
    for (let i = 0; i < this.mapMarkers.length; i++) {
      const marker      = this.mapMarkers[i];
      const infowindow  = this.infoWindows[i];
      marker.addListener('click', () => {
        Utils.closeWindows(this.infoWindows);
        Utils.panAndZoom(map, marker.getPosition(), 8);
        infowindow.open(map, marker);

        infowindow.addListener('domready', () => {
          // InfoWindow elements
          const elements = Utils.getInfoWindowElements();

          if(elements.form && !elements.form.dataset.hasListener) {
            elements.form.dataset.hasListener = true;
            elements.form.addEventListener('submit', (e) => {
              e.preventDefault();
              this._submitForm(elements, e.target.elements);
            });
            elements.deleteBtn.addEventListener('click', () => {
              this._deletePlace(elements.idElem.value);
              this.mapMarkers.splice(i, 1);
              this.infoWindows.splice(i, 1);
              marker.setMap(null);
            });

            elements.newKeywordBtn.addEventListener('click', () => {
              this._newKeywordListener(elements, elements.idElem.value);
            });
            elements.addKeywordBtn.addEventListener('click', () => {
              this._addKeyworListener(elements);
            });
            for (const checkbox of elements.checkboxes) {
              checkbox.addEventListener('change', ({target}) => {
                this._checkboxListener(elements, target);
              })
            }
          }
          elements.favouriteBtn.addEventListener('click', ({target}) => {
            this._favouritePlace(elements.idElem.value, target.dataset.isFavourite);
          });
        });
      });
    }
  }
  _submitForm(infoElements, elements) {
    const isEditForm = !!infoElements.idElem.value;
    let place = {};
    const ignoredButtons = document.querySelector('.buttons').children.length;
    for (let i = 0; i < elements.length - ignoredButtons; i++) {
      if(elements[i].name) place[elements[i].name] = elements[i].value;
    }
    this._savePlace(place, (data) => {
      if(isEditForm) {
          this.allPlaces = Utils.removeObjFromArray(this.allPlaces, 'id', data.id);
      } else {
        infoElements.idElem.value = data.id;
        this.parent.user.places.push(data.id);
      }
      this.allPlaces.push(data);
      this._onChange();
    });
  }
  _checkboxListener(infoElements, checkbox) {
    let keys = infoElements.keywordsElem.value.split(',');
    if (checkbox.checked) {
      keys.push(checkbox.value);
    } else {
      keys.splice(keys.indexOf(checkbox.value), 1);
    }
    infoElements.keywordsElem.value = keys;
  }
  _newKeywordListener(infoElements, placeId = null) {
    this._newKeyword({
      label: infoElements.newKeywordText.value,
      place_id: placeId,
    }, (keyword) => {
      this.allKeywords.push(keyword);
      const checkbox = Utils.addCheckbox(keyword, infoElements);
      checkbox.addEventListener('change', ({target}) => {
        this._checkboxListener(infoElements, target);
      });
    });
  }
  _addKeyworListener(infoElements) {
    let selected = infoElements.keywordSelect.value;
    selected = this.allKeywords.find((keyword) => keyword.id == selected);

    const checkbox = Utils.addCheckbox(selected, infoElements);
    checkbox.addEventListener('change', ({target}) => {
      this._checkboxListener(infoElements, target);
    });

    for (let i = 0; i < infoElements.keywordSelect.length; i++) {
      if(infoElements.keywordSelect.options[i].value == infoElements.keywordSelect.value) {
        infoElements.keywordSelect.remove(i);
      }
    }
  }

  // Set up footer menu
  _setUpMyMenu(places) {
    this.mapPlaces.innerHTML        = '';
    this.searchContainer.innerHTML  = '';
    this.activeKeywords = [];
    this.renderedPlaces             = places;
    this._createPlaceItems();
    this._placeMarkers(this.map);
  }
  _setUpSearchMenu() {
    this.mapPlaces.innerHTML        = '';
    this.searchContainer.innerHTML  = '';
    this.activeKeywords             = [];
    this.renderedPlaces             = this.allPlaces;
    this._placeMarkers(this.map);
    this._createSearchForm();

  }
  _setUpFilterMenu() {
    this.mapPlaces.innerHTML        = '';
    this.searchContainer.innerHTML  = '';
    this._getAllKeywords(()=>{
      this._createKeywordItems();
    });
  }
  _createPlaceItems() {
    for (const place of this.renderedPlaces) {
      let element = Utils.createPlaceItem(place);
      this.mapPlaces.appendChild(element);
      element.addEventListener('click', ({target}) => {
        const targetId = Number(target.dataset.placeId);
        this._clickPlaceItem(targetId);
      });
    }
  }
  _clickPlaceItem(placeId) {
    const targetPlace = this.renderedPlaces.find((place) => place.id === placeId);
    const latLng = {
      lat: targetPlace.lat,
      lng: targetPlace.long,
    }
    this.map.setZoom(8);
    this.map.panTo(latLng);
  }
  _createSearchForm() {
    const element = Utils.toNode(`
    <form id="search-form">
      <input id="search-field" type="text" class="input big" placeholder="Search" />
      <input type="submit" class="button big" value="OK" />
    </form>`);
    this.searchContainer.appendChild(element);
    element.addEventListener('submit', (e) => {
      e.preventDefault();
      this._searchPlaces();
    });
  }
  _createKeywordItems() {
    for (const keyword of this.allKeywords) {
      let element = Utils.createKeywordItem(keyword);
      this.mapPlaces.appendChild(element);
      element.addEventListener('click', ({target}) => {
        const targetId = Number(target.dataset.keywordId);
        this._clickKeywordItem(targetId, target);
      });
    }
  }
  _clickKeywordItem(keyword, element) {
    const keyIndex = this.activeKeywords.indexOf(keyword);
    if(keyIndex !== -1) {
      this.activeKeywords.splice(keyIndex, 1);
      element.classList.remove('active');
      // If no more filters -> show all places again
      if(!this.activeKeywords.length) this.renderedPlaces = this.allPlaces;
    } else {
      element.classList.add('active');
      this.activeKeywords.push(keyword);
    }
    if(this.activeKeywords.length) {
      this.renderedPlaces = this.allPlaces.filter((place) => {
        return place.keyword.find((placeKeyword) => {
          return this.activeKeywords.find((key) => placeKeyword.id === key);
        });
      });
    }
    this._placeMarkers(this.map);

  }
  _onChange() {
    if (this.menuType === 'myPlaces') {
      this._setUpMyMenu(Utils.findPlaces(this.allPlaces, this.parent.user.places));
    } else if (this.menuType === 'favourites') {
      this._setUpMyMenu(Utils.findPlaces(this.allPlaces, this.parent.user.favourites));
    } else if (this.menuType === 'search') {
      this._setUpSearchMenu();
    } else {
      this._placeMarkers(this.map);
    }
  }

  // Database queries
  _getAllPlaces() {
    Utils.basicFetch('places', 'GET')
    .then((data) => {
      this.allPlaces = data;
      this.renderedPlaces = this.allPlaces;
      this._getAllKeywords(()=>{
        this.map = this._initMap();
      });
    }, (failedData) => {
      console.log('Error loading places on the map. Try refreshing-');
      console.log(failedData);
      this.map = this._initMap();
    })
  }
  _searchPlaces() {
    let searchTerm = document.querySelector('#search-field').value;
    searchTerm     = searchTerm.split(' ').join('%20');
    let url         = `place/search/${searchTerm}`;
    if(!searchTerm.length) url = 'places';
    Utils.basicFetch(url, 'GET')
    .then((data) => {
      this.renderedPlaces = data;
      this.mapPlaces.innerHTML = '';
      this._createPlaceItems();
      this._placeMarkers(this.map);

    }, (failedData) => {
      console.log(failedData);
    });
  }
  _getAllKeywords(done) {
    Utils.basicFetch('keywords', 'GET')
    .then((data) => {
      this.allKeywords = data;
      done();
    }, (failedData) => {
      console.log(failedData);
    });
  }
  _savePlace(place, done) {
    let method = 'POST';
    let url = 'newPlace';
    if(place.id) {
      method = 'PUT';
      url = `editPlace/${place.id}`
    }
    Utils.basicFetch(url, method, place)
    .then((data) => {
      data.lat      = Number(data.lat);
      data.long     = Number(data.long);
      data.user_id  = Number(data.user_id);
      done(data);
    }, (failedData) => {
      console.log(failedData);
    });
  }
  _deletePlace(placeId) {
    Utils.basicFetch(`places/${placeId}`, 'DELETE')
    .then(() => {
      Utils.removeObjFromArray(this.allPlaces, 'id', placeId);
      this.parent.user.places.splice(this.parent.user.places.indexOf(placeId), 1);
      this.parent.user.favourites.splice(this.parent.user.favourites.indexOf(placeId), 1);

      this._onChange();
    }, (failedData) => {
      console.log(failedData);
    })
  }
  _favouritePlace(placeId, remove) {
    let url = 'newFavourite';
    let method = 'POST';
    let data = {
      place_id: Number(placeId),
      user_id: this.parent.user.id,
    }
    if(remove === 'true') {
      url = `deleteFavourite`;
    }
    Utils.basicFetch(url, method, data)
    .then((res) => {
      if(remove === 'true') {
        this.parent.user.favourites.splice(this.parent.user.favourites.indexOf(placeId), 1);
      } else {
        this.parent.user.favourites.push(res.place_id);
      }
      this._onChange();
    }, (failedData) => {
      console.log(failedData);
    });


  }
  _newKeyword(keyword, done) {
    Utils.basicFetch(`newKeyword`, 'POST', keyword)
    .then((res) => {
      done(res);
    }, (failedData) => {
      console.log(failedData);
    })
  }

  // Rendering
  _render() {
    const nav = Utils.toNode(`
    <ul>
      <li><a href="#" id="search-link"><strong>Search</strong></a></li>
      <li><a href="#" id="filter-link"><strong>Filter</strong></a></li>
      <li><a href="#" id="my-places-link"><strong>My places</strong></a></li>
      <li><a href="#" id="favourites-link"><strong>Favourites</strong></a></li>
    </ul>`);
    const main = Utils.toNode(`
    <div id="main-content">
      <div id="show-open"><label>Only show open places <input type="checkbox" id="toggle-open" /></label></div>
      <div id="map"></div>
    </div>`);
    const footer = Utils.toNode(`
    <div id="footer-content" class="hidden">
      <div id="menu-toggle" class="footer-row">
        <a href="#">CLOSE</a>
      </div>
      <div id="footer-header" class="footer-row">
      </div>
      <div id="search-container" class="footer-row"></div>
      <div id="map-places" class="footer-row"></div>
    </div>`);


    this.parent.container.appendChild(main);
    this.parent.nav.appendChild(nav);
    this.parent.footer.appendChild(footer);

    this._getAllPlaces();
  }
  _unrender() {
    this.parent.nav.innerHTML       = '';
    this.parent.container.innerHTML = '';
    this.parent.footer.innerHTML    = '';
  }
}