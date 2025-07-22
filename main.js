(function () {
  let template = document.createElement('template');
  template.innerHTML = `
    <style>
      #map {
        height: 100%;
        width: 100%;
      }
    </style>
    <div id="map"></div>
  `;

  class GeoMapWidget extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: 'open' });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
      // Leaflet laden
      if (!window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => this.initializeMap();

        this._shadowRoot.appendChild(link);
        this._shadowRoot.appendChild(script);
      } else {
        this.initializeMap();
      }
    }

    initializeMap() {
      const mapContainer = this._shadowRoot.getElementById('map');
      const map = L.map(mapContainer).setView([50.64, 6.25], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);

      // Beispiel-Polygon
      const polygon = {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [6.25, 50.636],
            [6.26, 50.637],
            [6.27, 50.635],
            [6.25, 50.636]
          ]]
        }
      };

      L.geoJSON(polygon, {
        style: { color: "blue", weight: 2, fillOpacity: 0.4 }
      }).addTo(map);
    }
  }

  customElements.define('geo-map-widget', GeoMapWidget);
})();
