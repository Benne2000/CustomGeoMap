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
  const map = L.map(mapContainer).setView([48.5, 9], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // GeoJSON laden
  fetch('https://raw.githubusercontent.com/Benne2000/CustomGeoMap/main/BaWue.geojson')
    .then(res => res.json())
    .then(data => {
      const layer = L.geoJSON(data, {
        style: {
          color: "darkgreen",
          weight: 1,
          fillOpacity: 0.4
        }
      }).addTo(map);

      map.fitBounds(layer.getBounds());
    });

  // Beispiel-Polygon (optional)
  const polygon = {
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [9.0, 48.3],
        [9.1, 48.3],
        [9.1, 48.4],
        [9.0, 48.4],
        [9.0, 48.3]
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
