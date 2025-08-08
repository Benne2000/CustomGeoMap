(() => {
  const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    if (window.__leafletLoading) return window.__leafletLoading;

    window.__leafletLoading = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = LEAFLET_CSS;
      css.crossOrigin = "anonymous";
      document.head.appendChild(css);

      const script = document.createElement("script");
      script.src = LEAFLET_JS;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = () => reject("Leaflet konnte nicht geladen werden.");
      document.head.appendChild(script);
    });

    return window.__leafletLoading;
  }

  class GeoMapWidget extends HTMLElement {
    constructor() {
      super();
      this._map = null;
      this._layer = null;
      this._geo = null;
      this._plzPropertyName = "plz";
      this._dataSource = null;
    }

    connectedCallback() {
      this.style.display = "block";
      this.style.position = "relative";
      if (!this.style.height) this.style.height = "400px";

      this.innerHTML = `<div id="map" style="width:100%;height:100%;position:absolute;top:0;left:0;"></div>`;
      loadLeaflet().then(() => this._initMap());
    }

    onCustomWidgetResize() {
      if (this._map) this._map.invalidateSize();
    }

    onCustomWidgetBeforeUpdate(changedProps) {
      if (changedProps.plzPropertyName) {
        this._plzPropertyName = changedProps.plzPropertyName;
        this._updateLayer();
      }
    }

    set myDataSource(binding) {
      this._dataSource = binding;
      this._updateLayer();
    }

    async _initMap() {
      const container = this.querySelector("#map");
      this._map = L.map(container).setView([49.4, 8.7], 10);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18
      }).addTo(this._map);

      await this._loadGeoJSON();
      this._updateLayer();
    }

    async _loadGeoJSON() {
      if (this._geo) return;
      const res = await fetch("https://raw.githubusercontent.com/Benne2000/CustomGeoMap/main/BaWue.geojson", {
        cache: "no-store"
      });
      this._geo = await res.json();
    }

    _updateLayer() {
      if (!this._map || !this._geo) return;

      if (!this._dataSource || this._dataSource.state !== "success") {
        this._updateLayerWithoutData();
        return;
      }

      const dim = this._dataSource.metadata?.feeds?.dimensions?.values?.[0];
      const meas = this._dataSource.metadata?.feeds?.measures?.values?.[0];
      if (!dim || !meas) return;

      const values = new Map();
      for (const row of this._dataSource.data || []) {
        const plz = String(row[dim]?.label || "").trim().replace(/^0+/, "");
        const val = Number(row[meas]?.raw || 0);
        if (plz) values.set(plz, (values.get(plz) || 0) + val);
      }

      const features = this._geo.features.map(f => {
        const plz = String(f.properties?.[this._plzPropertyName] || "").trim().replace(/^0+/, "");
        const value = values.get(plz) || 0;
        return {
          ...f,
          properties: { ...f.properties, value }
        };
      });

      if (this._layer) this._map.removeLayer(this._layer);
      this._layer = L.geoJSON({ type: "FeatureCollection", features }, {
        style: f => ({
          fillColor: this._color(f.properties.value),
          weight: 1,
          color: "white",
          fillOpacity: 0.7
        }),
        onEachFeature: (f, layer) => {
          layer.bindPopup(`PLZ: ${f.properties[this._plzPropertyName]}<br>Wert: ${f.properties.value}`);
        }
      }).addTo(this._map);

      this._map.fitBounds(this._layer.getBounds());
    }

    _updateLayerWithoutData() {
      if (!this._map || !this._geo) return;

      if (this._layer) this._map.removeLayer(this._layer);
      this._layer = L.geoJSON(this._geo, {
        style: {
          fillColor: "#cccccc",
          weight: 1,
          color: "#666",
          fillOpacity: 0.5
        },
        onEachFeature: (f, layer) => {
          layer.bindPopup(`PLZ: ${f.properties?.[this._plzPropertyName] || "?"}`);
        }
      }).addTo(this._map);

      this._map.fitBounds(this._layer.getBounds());
    }

    _color(v) {
      return v > 1000 ? "#800026" :
             v > 500  ? "#BD0026" :
             v > 200  ? "#E31A1C" :
             v > 100  ? "#FC4E2A" :
             v > 50   ? "#FD8D3C" :
             v > 20   ? "#FEB24C" :
             v > 10   ? "#FED976" : "#FFEDA0";
    }
  }

  if (!customElements.get("geo-map-widget")) {
    customElements.define("geo-map-widget", GeoMapWidget);
  }
})();
