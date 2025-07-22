(function () {
  let template = document.createElement('template');
  template.innerHTML = `
    <style>
      #map {
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }

      .legend {
        position: absolute;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
        background: white;
        padding: 10px;
        border: 1px solid #999;
        font-family: sans-serif;
        font-size: 12px;
        line-height: 18px;
        color: #333;
      }

      .legend i {
        width: 18px;
        height: 18px;
        float: left;
        margin-right: 8px;
        opacity: 0.8;
      }
    </style>
    <div id="map"></div>
    <div class="legend" id="legend"></div>
  `;

  class GeoMapWidget extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: 'open' });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
      this.map = null;
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
      this.map = L.map(mapContainer).setView([49.4, 8.7], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(this.map);

      const plzWerte = {
"68129": 84,
"68159": 14,
"68161": 40,
"68163": 795,
"68165": 39,
"68167": 1321,
"68169": 2090,
"68198": 135,
"68205": 54,
"68207": 1,
"68219": 1604,
"68223": 12,
"68227": 21,
"68229": 760,
"68236": 523,
"68239": 339,
"68245": 64,
"68256": 144,
"68259": 624,
"68289": 185,
"68290": 107,
"68305": 3867,
"68307": 36,
"68309": 6183,
"68353": 1754,
"68425": 430,
"68519": 570,
"68523": 5,
"68526": 22766,
"68535": 435494,
"68536": 954,
"68540": 78,
"68542": 2256,
"68549": 105,
"68557": 7,
"68569": 80,
"68623": 51,
"68703": 150,
"68723": 1416352,
"68724": 103,
"68726": 281,
"68732": 10,
"68736": 4459,
"68743": 38,
"68753": 1457,
"68758": 11,
"68766": 839,
"68775": 6743,
"68780": 13,
"68782": 1192,
"68786": 283,
"68789": 24750,
"68799": 754,
"68804": 0,
"68835": 15,
"69100": 85,
"69103": 35,
"69110": 42,
"691112": 49,
"691115": 265,
"691117": 18,
"691118": 4,
"69112": 113454,
"69113": 343,
"69114": 8127,
"69115": 8801477,
"69116": 8104,
"69117": 617393,
"69118": 1802160,
"69119": 442,
"69120": 849129,
"69121": 1361200,
"69122": 507,
"69123": 9210716,
"69124": 1720550,
"69125": 650,
"69126": 896468,
"69127": 612,
"69128": 1456,
"69129": 403,
"69132": 15,
"69143": 10,
"69145": 12,
"69146": 93,
"69151": 282017,
"69152": 547,
"69155": 214,
"69158": 17,
"69159": 1005,
"69168": 151656,
"69169": 216,
"69181": 754754,
"69182": 3273,
"69189": 146,
"69190": 69662,
"69191": 22,
"69198": 139872,
"69202": 14,
"69204": 31,
"69205": 111,
"69206": 13,
"69207": 788665,
"69210": 12,
"69212": 2001,
"692123": 204,
"69213": 173,
"69214": 1163140,
"69215": 836,
"69217": 28,
"69221": 628533,
"69223": 705,
"69224": 3653,
"69225": 329,
"69226": 40636,
"69227": 311,
"69230": 1300,
"69231": 1195,
"69232": 236,
"69234": 16527,
"69237": 33,
"69239": 26818,
"69241": 28,
"69242": 890,
"69245": 21980,
"69250": 181744,
"69251": 3273,
"69252": 612,
"69253": 5453,
"69254": 1071,
"69255": 182,
"69256": 5059,
"69257": 39290,
"69258": 9,
"69259": 36531,
"69260": 28,
"69265": 12,
"69270": 6527,
"69290": 31,
"69303": 9,
"693258": 13,
"69332": 160,
"69345": 46,
"69398": 12,
"69401": 13,
"69412": 27176,
"69422": 9,
"69424": 4,
"69427": 40,
"69429": 421,
"69433": 175,
"69434": 7028,
"69436": 80,
"69437": 714,
"69438": 745,
"69469": 8698,
"69483": 4359,
"69488": 684,
"69489": 27,
"69493": 3106,
"69507": 15,
"69509": 49,
"69517": 67,
"69518": 43,
"69587": 99,
"69678": 6,
"69760": 162,
"69789": 85,
"69915": 39,
"70199": 10,
"70372": 314,
"71552": 43,
"72250": 47,
"73460": 120,
"74046": 118,
"74076": 53,
"74211": 23,
"74235": 227,
"74252": 171,
"74388": 207,
"74391": 40
      };

      const getColor = value => {
        return value > 10000 ? "#08306b" :
               value > 5000 ? "#2171b5" :
               value > 1000  ? "#6baed6" :
               value > 100  ? "#c6dbef" :
                              "#f7fbff";
      };

      const standorte = [
        { name: "BAUHAUS Heidelberg", lon: 8,658504592784, lat: 49.406734419428 }
      ];

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
          }).addTo(this.map);

          this.map.fitBounds(layer.getBounds());

          standorte.forEach(s => {
            const marker = L.circleMarker([s.lat, s.lon], {
              radius: 6,
              color: "red",
              fillColor: "red",
              fillOpacity: 0.9
            }).addTo(this.map);
            marker.bindPopup(s.name);
          });

          // Legende aufbauen
          const legendContainer = this._shadowRoot.getElementById('legend');
          legendContainer.innerHTML = `
            <strong>Wert (PLZ)</strong><br>
            <i style="background:#08306b"></i> > 1500<br>
            <i style="background:#2171b5"></i> > 1000<br>
            <i style="background:#6baed6"></i> > 500<br>
            <i style="background:#c6dbef"></i> > 100<br>
            <i style="background:#f7fbff"></i> ≤ 100
          `;
        });

      // Map-Größe bei Widget-Resize aktualisieren
      const resizeObserver = new ResizeObserver(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      });
      resizeObserver.observe(this._shadowRoot.host);
    }
  }

  customElements.define('geo-map-widget', GeoMapWidget);
})();
