/**
 * Legacy Places classes, re-implemented on top of the Places API (New).
 *
 * The site was written against google.maps.places.Autocomplete,
 * AutocompleteService and PlacesService. Google no longer lets new projects
 * enable the legacy Places API, so with such a key every search box shows
 * "This page can't load Google Maps correctly" on the first keystroke.
 *
 * Rather than rewrite each page, these stand-ins keep the legacy shapes the
 * pages already consume - getPlace(), getPlacePredictions(), getDetails(),
 * formatted_address, geometry.location, address_components - and fetch from
 * AutocompleteSuggestion / Place underneath.
 */

const SEARCH_DEBOUNCE_MS = 250;
const MAX_SUGGESTIONS = 5;
const PLACE_FIELDS = ['id', 'displayName', 'formattedAddress', 'location', 'viewport', 'addressComponents', 'types'];

let installed = false;

const loadPlacesLibrary = async () => {
  if (typeof google.maps.importLibrary === 'function') {
    return google.maps.importLibrary('places');
  }
  return google.maps.places;
};

const toList = (value) => (Array.isArray(value) ? value : value ? [value] : []);

// Legacy `types` filters mapped to what the new API accepts. '(cities)' and
// '(regions)' were collections; 'geocode' / 'address' / 'establishment' have no
// equivalent filter and are dropped rather than rejected.
const mapLegacyTypes = (types) => {
  const mapped = toList(types).flatMap((type) => {
    if (type === '(cities)') return ['locality', 'administrative_area_level_3'];
    if (type === '(regions)') return ['locality', 'sublocality', 'postal_code', 'administrative_area_level_1', 'administrative_area_level_2'];
    if (['geocode', 'address', 'establishment'].includes(type)) return [];
    return [type];
  });
  return mapped.length ? [...new Set(mapped)].slice(0, 5) : undefined;
};

const buildSuggestionRequest = (input, options = {}) => {
  const request = { input };

  const countries = toList(options.componentRestrictions?.country).map((code) => String(code).toLowerCase());
  if (countries.length) request.includedRegionCodes = countries;

  const primaryTypes = mapLegacyTypes(options.types);
  if (primaryTypes) request.includedPrimaryTypes = primaryTypes;

  if (options.sessionToken) request.sessionToken = options.sessionToken;

  if (options.bounds) {
    if (options.strictBounds) request.locationRestriction = options.bounds;
    else request.locationBias = options.bounds;
  } else if (options.location && options.radius) {
    request.locationBias = { center: options.location, radius: Math.min(Number(options.radius), 50000) };
  }

  return request;
};

const toLegacyPrediction = (prediction) => ({
  description: prediction.text?.text || '',
  place_id: prediction.placeId,
  types: prediction.types || [],
  structured_formatting: {
    main_text: prediction.mainText?.text || prediction.text?.text || '',
    secondary_text: prediction.secondaryText?.text || '',
  },
  terms: [],
  matched_substrings: [],
});

const toLegacyPlace = (place) => ({
  place_id: place.id,
  name: place.displayName || '',
  formatted_address: place.formattedAddress || '',
  geometry: place.location ? { location: place.location, viewport: place.viewport || undefined } : undefined,
  address_components: (place.addressComponents || []).map((component) => ({
    long_name: component.longText,
    short_name: component.shortText,
    types: component.types || [],
  })),
  types: place.types || [],
});

const fetchPredictions = async (input, options) => {
  const { AutocompleteSuggestion } = await loadPlacesLibrary();
  const { suggestions = [] } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(
    buildSuggestionRequest(input, options),
  );
  return suggestions.map((suggestion) => suggestion.placePrediction).filter(Boolean);
};

const fetchPlace = async (placeId, sessionToken) => {
  const { Place } = await loadPlacesLibrary();
  const place = new Place({ id: placeId });
  await place.fetchFields({ fields: PLACE_FIELDS, ...(sessionToken ? { sessionToken } : {}) });
  return toLegacyPlace(place);
};

class CompatAutocompleteService {
  getPlacePredictions(request = {}, callback) {
    const input = String(request.input || '').trim();
    const promise = (input ? fetchPredictions(input, request) : Promise.resolve([]))
      .then((predictions) => {
        const legacy = predictions.map(toLegacyPrediction);
        callback?.(legacy, legacy.length ? 'OK' : 'ZERO_RESULTS');
        return { predictions: legacy };
      })
      .catch((error) => {
        console.warn('[places] autocomplete failed', error);
        callback?.([], 'UNKNOWN_ERROR');
        return { predictions: [] };
      });
    return promise;
  }
}

class CompatPlacesService {
  getDetails(request = {}, callback) {
    fetchPlace(request.placeId, request.sessionToken)
      .then((place) => callback?.(place, 'OK'))
      .catch((error) => {
        console.warn('[places] place details failed', error);
        callback?.(null, 'UNKNOWN_ERROR');
      });
  }
}

const DROPDOWN_STYLE = [
  'position:fixed', 'z-index:2147483000', 'background:#fff', 'border-radius:10px',
  'box-shadow:0 8px 24px rgba(15,23,42,.18)', 'overflow:hidden', 'font:13px/1.35 system-ui,sans-serif',
  'color:#0f172a', 'display:none',
].join(';');
const ITEM_STYLE = 'padding:9px 12px;cursor:pointer;border-top:1px solid #f1f5f9';

/// Drop-in for google.maps.places.Autocomplete: binds to an <input>, shows its
/// own suggestion list and fires 'place_changed' with getPlace() populated.
const createCompatAutocompleteClass = () => class CompatAutocomplete extends google.maps.MVCObject {
  constructor(input, options = {}) {
    super();
    this.input = input;
    this.options = { ...options };
    this.place = undefined;
    this.predictions = [];
    this.activeIndex = -1;
    this.requestId = 0;
    this.sessionToken = new google.maps.places.AutocompleteSessionToken();

    this.dropdown = document.createElement('div');
    this.dropdown.className = 'pac-container compat-pac-container';
    this.dropdown.setAttribute('style', DROPDOWN_STYLE);
    document.body.appendChild(this.dropdown);

    input.setAttribute('autocomplete', 'off');
    this.onInput = this.onInput.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.reposition = this.reposition.bind(this);
    input.addEventListener('input', this.onInput);
    input.addEventListener('keydown', this.onKeyDown);
    input.addEventListener('blur', this.onBlur);
  }

  getPlace() { return this.place; }
  getBounds() { return this.options.bounds; }
  getFields() { return this.options.fields; }
  setBounds(bounds) { this.options.bounds = bounds; }
  setComponentRestrictions(restrictions) { this.options.componentRestrictions = restrictions; }
  setFields(fields) { this.options.fields = fields; }
  setOptions(options = {}) { Object.assign(this.options, options); }
  setTypes(types) { this.options.types = types; }

  onInput() {
    const query = this.input.value.trim();
    clearTimeout(this.timer);
    if (query.length < 2) {
      this.close();
      return;
    }
    const requestId = ++this.requestId;
    this.timer = setTimeout(async () => {
      try {
        const predictions = await fetchPredictions(query, { ...this.options, sessionToken: this.sessionToken });
        if (requestId !== this.requestId) return;
        this.render(predictions.slice(0, MAX_SUGGESTIONS));
      } catch (error) {
        console.warn('[places] autocomplete failed', error);
        this.close();
      }
    }, SEARCH_DEBOUNCE_MS);
  }

  onKeyDown(event) {
    if (!this.predictions.length || this.dropdown.style.display === 'none') return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      this.highlight((this.activeIndex + step + this.predictions.length) % this.predictions.length);
    } else if (event.key === 'Enter') {
      // Legacy Autocomplete swallowed Enter while its list was open, so a
      // surrounding form was not submitted mid-search.
      event.preventDefault();
      this.select(Math.max(this.activeIndex, 0));
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  onBlur() {
    // Let a click on a suggestion land before the list disappears.
    setTimeout(() => this.close(), 150);
  }

  render(predictions) {
    this.predictions = predictions;
    this.activeIndex = -1;
    this.dropdown.replaceChildren(...predictions.map((prediction, index) => {
      const item = document.createElement('div');
      item.className = 'pac-item';
      item.setAttribute('style', ITEM_STYLE);
      const main = document.createElement('div');
      main.style.fontWeight = '600';
      main.textContent = prediction.mainText?.text || prediction.text?.text || '';
      const secondary = document.createElement('div');
      secondary.style.color = '#64748b';
      secondary.style.fontSize = '12px';
      secondary.textContent = prediction.secondaryText?.text || '';
      item.append(main, secondary);
      item.addEventListener('mousedown', (event) => {
        event.preventDefault();
        this.select(index);
      });
      item.addEventListener('mouseenter', () => this.highlight(index));
      return item;
    }));
    if (!predictions.length) {
      this.close();
      return;
    }
    this.dropdown.style.display = 'block';
    this.reposition();
    window.addEventListener('scroll', this.reposition, true);
    window.addEventListener('resize', this.reposition);
  }

  highlight(index) {
    this.activeIndex = index;
    [...this.dropdown.children].forEach((child, childIndex) => {
      child.style.background = childIndex === index ? '#f1f5f9' : '#fff';
    });
  }

  reposition() {
    if (!this.input.isConnected) {
      this.close();
      return;
    }
    const rect = this.input.getBoundingClientRect();
    this.dropdown.style.left = `${rect.left}px`;
    this.dropdown.style.top = `${rect.bottom + 4}px`;
    this.dropdown.style.width = `${Math.max(rect.width, 240)}px`;
  }

  close() {
    this.dropdown.style.display = 'none';
    this.predictions = [];
    this.activeIndex = -1;
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
  }

  async select(index) {
    const prediction = this.predictions[index];
    if (!prediction) return;
    clearTimeout(this.timer);
    this.requestId += 1;
    this.input.value = prediction.text?.text || '';
    this.close();
    try {
      this.place = await fetchPlace(prediction.placeId, this.sessionToken);
    } catch (error) {
      console.warn('[places] place details failed', error);
      this.place = { name: this.input.value };
    }
    // A session ends with the details call it paid for.
    this.sessionToken = new google.maps.places.AutocompleteSessionToken();
    google.maps.event.trigger(this, 'place_changed');
  }
};

/**
 * Swaps the legacy Places classes for the stand-ins above. Runs once, after the
 * Maps script has loaded, and only when the new API classes are present.
 */
export const installPlacesCompat = () => {
  if (installed || typeof window === 'undefined') return;
  const places = window.google?.maps?.places;
  if (!places?.AutocompleteSuggestion || !places?.Place) return;

  installed = true;
  const replace = (name, value) => {
    try {
      Object.defineProperty(places, name, { value, configurable: true, writable: true });
    } catch (error) {
      console.warn(`[places] could not replace ${name}`, error);
    }
  };
  replace('Autocomplete', createCompatAutocompleteClass());
  replace('AutocompleteService', CompatAutocompleteService);
  replace('PlacesService', CompatPlacesService);
};
