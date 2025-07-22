(function () {
  let template = document.createElement('template');
  template.innerHTML = `
    <style>
      #map {
        height: 100%;
        width: 100%;
        position: relative;
        z-index: 0;
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
      const map = L.map(mapContainer).setView([49.4, 8.7], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      // Fest definierte PLZ-Werte rund um Heidelberg
      const plzWerte = {
        "69115": 1800,
        "69117": 1200,
        "69118": 800,
        "69120": 300,
        "69121": 50,
        "69214": 1500,
        "69226": 900,
        "69234": 400
      };

      // Farbskala
      const getColor = value => {
        return value > 1500 ? "#08306b" :
               value > 1000 ? "#2171b5" :
               value > 500  ? "#6baed6" :
               value > 100  ? "#c6dbef" :
                              "#f7fbff";
      };

      // Standort-Marker rund um Heidelberg
      const standorte = [
        { name: "Universität Heidelberg", lon: 8.674, lat: 49.417 },
        { name: "Hauptbahnhof HD", lon: 8.690, lat: 49.398 },
        { name: "Altstadt", lon: 8.708, lat: 49.414 },
        { name: "Leimen", lon: 8.693, lat: 49.340 },
        { name: "Schwetzingen", lon: 8.570, lat: 49.377 }
      ];

      // GeoJSON laden + einfügen
      fetch('https://raw.githubusercontent.com/Benne2000/CustomGeoMap/main/BaWue.geojson')
        .then(res => res.json())
        .then(data => {
          const layer = L.geoJSON(data, {
            style: feature => {
              const plz = (feature.properties.plz || "").trim();
              const value = plzWerte[plz] || 0;
              return {
                fillColor: getColor(value),
                color: "white",
                weight: 1,
                fillOpacity: 0.8
              };
            },
            onEachFeature: (feature, layer) => {
              const plz = (feature.properties.plz || "").trim();
              const value = plzWerte[plz] || "Keine Daten";
              layer.bindPopup(`PLZ: ${plz}<br>Wert: ${value}`);
            }
          }).addTo(map);

          map.fitBounds(layer.getBounds());

          // Marker setzen
          standorte.forEach(s => {
            const marker = L.circleMarker([s.lat, s.lon], {
              radius: 6,
              color: "red",
              fillColor: "red",
              fillOpacity: 0.9
            }).addTo(map);
            marker.bindPopup(s.name);
          });
        });
    }
  }

  customElements.define('geo-map-widget', GeoMapWidget);
})();
