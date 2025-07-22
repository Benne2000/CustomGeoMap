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
      const map = L.map(mapContainer).setView([49.4, 8.7], 9);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      // 🔢 PLZ-Werte inkl. Heidelberg und Umgebung
      const plzWerte = {
        "69115": Math.floor(Math.random() * 2000),
        "69117": Math.floor(Math.random() * 2000),
        "69118": Math.floor(Math.random() * 2000),
        "69120": Math.floor(Math.random() * 2000),
        "69121": Math.floor(Math.random() * 2000),
        "69123": Math.floor(Math.random() * 2000),
        "69214": Math.floor(Math.random() * 2000),
        "69226": Math.floor(Math.random() * 2000),
        "69234": Math.floor(Math.random() * 2000),
        "68519": Math.floor(Math.random() * 2000),
        "69469": Math.floor(Math.random() * 2000),
        "69245": Math.floor(Math.random() * 2000),
        "69493": Math.floor(Math.random() * 2000),
        "69151": Math.floor(Math.random() * 2000)
      };

      // 🎨 Farbskala-Funktion
      const getColor = value => {
        return value > 1500 ? "#08306b" :
               value > 1000 ? "#2171b5" :
               value > 500  ? "#6baed6" :
               value > 100  ? "#c6dbef" :
                              "#f7fbff";
      };

      // 📍 Standorte in und um Heidelberg
      const standorte = [
        { name: "HD-Zentrum", lon: 8.694, lat: 49.409 },
        { name: "Wieblingen", lon: 8.620, lat: 49.405 },
        { name: "Kirchheim", lon: 8.650, lat: 49.375 },
        { name: "Leimen", lon: 8.693, lat: 49.340 },
        { name: "Schwetzingen", lon: 8.570, lat: 49.377 }
      ];

      fetch('https://raw.githubusercontent.com/Benne2000/CustomGeoMap/main/BaWue.geojson')
        .then(res => res.json())
        .then(data => {
          const layer = L.geoJSON(data, {
            style: feature => {
              const plz = feature.properties.plz || feature.properties.PLZ || "";
              const value = plzWerte[plz] || 0;
              return {
                fillColor: getColor(value),
                color: "white",
                weight: 1,
                fillOpacity: 0.8
              };
            },
            onEachFeature: (feature, layer) => {
              const plz = feature.properties.plz || feature.properties.PLZ || "";
              const value = plzWerte[plz] || "Keine Daten";
              layer.bindPopup(`PLZ: ${plz}<br>Wert: ${value}`);
            }
          }).addTo(map);

          map.fitBounds(layer.getBounds());

          // 📌 Standortmarker hinzufügen
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
