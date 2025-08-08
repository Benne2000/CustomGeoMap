class GeoMapWidget extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._shadowRoot.innerHTML = `<div id="map" style="width: 100%; height: 100%;"></div>`;
    this._map = null;
    this._geoJsonLayer = null;
    this._geo = null; // Cache für GeoJSON
    this._myDataSource = null;

    // Konfig: Name des GeoJSON-Properties, das die PLZ trägt
    this._plzPropertyName = "plz";
  }

  connectedCallback() {
    // Hinweis: Falls Leaflet nicht global verfügbar ist, ggf. hier laden.
    // Wir gehen davon aus, dass L vorhanden ist.
    this._map = L.map(this._shadowRoot.getElementById("map")).setView([51.1657, 10.4515], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(this._map);

    // Erste Darstellung, falls Daten später kommen.
    this._ensureGeo().then(() => this._renderLayer(new Map()));
  }

  onCustomWidgetResize() {
    if (this._map) this._map.invalidateSize();
  }

  // Properties aus dem Manifest (optional)
  onCustomWidgetBeforeUpdate(changedProps) {
    if (changedProps.plzPropertyName) {
      this._plzPropertyName = changedProps.plzPropertyName;
      this._updateFromDataBinding(); // neu rendern mit neuem Property-Namen
    }
  }

  // SAC-Datenbindung: wird vom SAC Runtime gesetzt
  set myDataSource(dataBinding) {
    this._myDataSource = dataBinding;
    this._updateFromDataBinding();
  }

  async _updateFromDataBinding() {
    if (!this._myDataSource || this._myDataSource.state !== "success") return;

    // Keys der Feeds (Dimension/Kennzahl), so wie bei deinem ECharts-Beispiel
    const dimKey = this._myDataSource.metadata?.feeds?.dimensions?.values?.[0];
    const measureKey = this._myDataSource.metadata?.feeds?.measures?.values?.[0];
    if (!dimKey || !measureKey) return;

    const rows = Array.isArray(this._myDataSource.data) ? this._myDataSource.data : [];

    // Map: PLZ (Label) -> aggregierter Wert
    const valueByPlz = new Map();
    for (const row of rows) {
      const plzLabel = row[dimKey]?.label != null ? String(row[dimKey].label).trim() : null;
      const raw = row[measureKey]?.raw != null ? Number(row[measureKey].raw) : 0;
      if (!plzLabel) continue;

      // Aggregation (Summe), falls mehrere Zeilen je PLZ
      const current = valueByPlz.get(plzLabel) ?? 0;
      valueByPlz.set(plzLabel, current + raw);
    }

    await this._ensureGeo();
    this._renderLayer(valueByPlz);
  }

  async _ensureGeo() {
    if (this._geo) return;
    const resp = await fetch("https://raw.githubusercontent.com/Benne2000/CustomGeoMap/main/BaWue.geojson");
    this._geo = await resp.json();
  }

  _renderLayer(valueByPlz) {
    if (!this._map || !this._geo) return;

    // Enriched FeatureCollection erzeugen (mutationsfrei)
    const features = this._geo.features.map(f => {
      const plz = f.properties?.[this._plzPropertyName] != null
        ? String(f.properties[this._plzPropertyName]).trim()
        : "";
      const value = valueByPlz.get(plz) ?? 0;
      return {
        ...f,
        properties: {
          ...f.properties,
          value
        }
      };
    });

    if (this._geoJsonLayer) {
      this._map.removeLayer(this._geoJsonLayer);
    }

    this._geoJsonLayer = L.geoJSON({ type: "FeatureCollection", features }, {
      style: feature => ({
        fillColor: this._getColor(feature.properties.value),
        weight: 1,
        opacity: 1,
        color: "white",
        fillOpacity: 0.7
      }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          `PLZ: ${feature.properties[this._plzPropertyName] ?? "-"}<br>` +
          `Wert: ${feature.properties.value}`
        );
      }
    }).addTo(this._map);
  }

  _getColor(value) {
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
