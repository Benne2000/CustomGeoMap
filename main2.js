class GeoMapWidget extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._shadowRoot.innerHTML = `<div id="map" style="width: 100%; height: 100%;"></div>`;
    this._map = null;
    this._geoJsonLayer = null;
    this._data = null;
    this._plzDimension = "PLZ";
    this._valueMeasure = "Wert";
  }

  // Initialisierung nach dem Laden
  connectedCallback() {
    this._map = L.map(this._shadowRoot.getElementById("map")).setView([51.1657, 10.4515], 6); // Deutschland-Zentrum
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(this._map);
  }

  // Datenbindung aus SAC
  onCustomWidgetBeforeUpdate(changedProps) {
    if (changedProps.plzDimension) {
      this._plzDimension = changedProps.plzDimension;
    }
    if (changedProps.valueMeasure) {
      this._valueMeasure = changedProps.valueMeasure;
    }
    if (changedProps.data) {
      this._data = changedProps.data.data;
      this.updateMap();
    }
  }

  // Hauptfunktion zur Verarbeitung und Darstellung
  updateMap() {
    if (!this._data || !Array.isArray(this._data)) return;

    // Beispiel: GeoJSON laden (kann auch extern geladen werden)
    fetch("https://benne2000.github.io/CustomGeoMap/plz.geojson")
      .then(response => response.json())
      .then(geojson => {
        const enrichedFeatures = geojson.features.map(feature => {
          const plz = feature.properties.plz;
          const match = this._data.find(row => row[this._plzDimension]?.displayValue === plz);
          const value = match ? parseFloat(match[this._valueMeasure]?.rawValue || 0) : 0;
          feature.properties.value = value;
          return feature;
        });

        if (this._geoJsonLayer) {
          this._map.removeLayer(this._geoJsonLayer);
        }

        this._geoJsonLayer = L.geoJSON(enrichedFeatures, {
          style: feature => ({
            fillColor: this.getColor(feature.properties.value),
            weight: 1,
            opacity: 1,
            color: "white",
            fillOpacity: 0.7
          }),
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`PLZ: ${feature.properties.plz}<br>Wert: ${feature.properties.value}`);
          }
        }).addTo(this._map);
      });
  }

  // Farbskala basierend auf Wert
  getColor(value) {
    return value > 1000 ? "#800026" :
           value > 500  ? "#BD0026" :
           value > 200  ? "#E31A1C" :
           value > 100  ? "#FC4E2A" :
           value > 50   ? "#FD8D3C" :
           value > 20   ? "#FEB24C" :
           value > 10   ? "#FED976" :
                         "#FFEDA0";
  }
}

customElements.define("geo-map-widget", GeoMapWidget);
