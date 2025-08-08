(function () {
  class LeafletMap extends HTMLElement {
    constructor() {
      super();
      this._map = null;
      this._markers = [];
      this._resizeObserver = null;
      this._leafletReady = false;
    }

    connectedCallback() {
      this.style.display = "block";
      if (!this.style.height) this.style.height = "400px";

      this.innerHTML = `<div id="map" style="width:100%;height:100%;position:absolute;top:0;left:0;"></div>`;

      this._resizeObserver = new ResizeObserver(() => {
        if (this._map) {
          setTimeout(() => this._map.invalidateSize(), 100);
        }
      });
      this._resizeObserver.observe(this);

      this._waitForVisibleSize().then(() => this._loadLeaflet().then(() => this._initMap()));
    }

    disconnectedCallback() {
      if (this._resizeObserver) this._resizeObserver.disconnect();
    }

    _waitForVisibleSize() {
      return new Promise(resolve => {
        const check = () => {
          const rect = this.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    }

    _loadLeaflet() {
      if (window.L) return Promise.resolve(); // schon geladen

      return new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    _initMap() {
      const mapDiv = this.querySelector("#map");
      this._map = L.map(mapDiv).setView([51.1657, 10.4515], 6); // Deutschland-Zentrum

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this._map);

      // WICHTIG: invalidateSize nach Initialisierung
      setTimeout(() => this._map.invalidateSize(), 300);
    }

    onCustomWidgetResize() {
      if (this._map) {
        setTimeout(() => this._map.invalidateSize(), 100);
      }
    }

    onCustomWidgetBeforeUpdate(changedProps) {}

    onCustomWidgetAfterUpdate(changedProps) {
      if (!this._map || !changedProps.data) return;

      const data = changedProps.data;
      const latIndex = data.metadata.feeds.lat.values[0];
      const lonIndex = data.metadata.feeds.lon.values[0];
      const labelIndex = data.metadata.feeds.label.values[0];

      // Alte Marker entfernen
      this._markers.forEach(m => m.remove());
      this._markers = [];

      const bounds = [];

      data.data.forEach(row => {
        const lat = parseFloat(row[latIndex]);
        const lon = parseFloat(row[lonIndex]);
        const label = row[labelIndex];

        if (!isNaN(lat) && !isNaN(lon)) {
          const marker = L.marker([lat, lon]).addTo(this._map);
          marker.bindPopup(label);
          this._markers.push(marker);
          bounds.push([lat, lon]);
        }
      });

      if (bounds.length > 0) {
        this._map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }

  // WICHTIG: Widget sofort registrieren
  customElements.define("leaflet-map", LeafletMap);
})();
