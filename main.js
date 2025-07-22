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
      const map = L.map(mapContainer).setView([48.5, 9], 7);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      // Farbskala für PLZ-Werte
      const plzWerte = {
"60227": 16,
"60322": 1352,
"60425": 111,
"60427": 112,
"60439": 809,
"60489": 49,
"60699": 3,
"60721": 1,
"61440": 1907,
"62329": 5,
"63075": 432,
"63110": 47,
"63579": 113,
"64711": 59,
"65934": 14,
"66919": 4,
"67269": 75,
"68167": 10,
"69194": 114,
"69226": 16,
"71093": 63,
"72116": 17,
"72489": 13,
"74053": 97,
"74259": 76,
"76530": 3,
"78126": 14,
"78253": 19,
      };

      const getColor = value => {
        return value > 1500 ? "#08306b" :
               value > 1000 ? "#2171b5" :
               value > 100  ? "#6baed6" :
               value > 50   ? "#c6dbef" :
                             "#f7fbff";
      };

      // Baden-Württemberg-Polygon laden
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

          // Standort-Marker
          const standorte = [
            { name: "636", lon: 49.4067344, lat: 8.6585 },
            { name: "638", lon: 49.243990, lat: 7.00371 },
            { name: "642", lon: 48.482, lat: 8.4121 },
            { name: "649", lon: 47.751, lat: 8.883 }
          ];

          standorte.forEach(s => {
            const marker = L.circleMarker([s.lat, s.lon], {
              radius: 6,
              color: "red",
              fillColor: "red",
              fillOpacity: 0.8
            }).addTo(map);
            marker.bindPopup(s.name);
          });

          // PLZ-Flächen einfärben (wenn verfügbar)
fetch('https://raw.githubusercontent.com/Benne2000/CustomGeoMap/main/BaWue.geojson')
  .then(res => res.json())
  .then(data => {
    const layer = L.geoJSON(data, {
      style: feature => {
        const plz = feature.properties.PLZ;
        const value = plzWerte[plz] || 0;
        return {
          fillColor: getColor(value),
          color: "white",
          weight: 1,
          fillOpacity: 0.7
        };
      },
      onEachFeature: (feature, layer) => {
        const plz = feature.properties.PLZ;
        const value = plzWerte[plz] || "Keine Daten";
        layer.bindPopup(`PLZ: ${plz}<br>Wert: ${value}`);
      }
    }).addTo(map);

    map.fitBounds(layer.getBounds());
  });
        });
    }
  }

  customElements.define('geo-map-widget', GeoMapWidget);
})();
