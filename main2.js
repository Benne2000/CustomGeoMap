(function () {
  class LeafletMap extends HTMLElement {
    constructor() {
      super();
      this._map = null;
      this._markers = [];
      this._resizeObserver = null;
      this._lastData = null;
      this._initialized = false;
    }

    connectedCallback() {
      if (this._initialized) return;
      this._initialized = true;

      this.style.display = "block";
      if (!this.style.height) this.style.height = "400px";
      this.innerHTML = `<div id="map" style="width:100%;height:100%;position:absolute;top:0;left:0;"></div>`;

      this._resizeObserver = new ResizeObserver(() => {
        if (this._map) {
          this._map.invalidateSize();
        }
      });
      this._resizeObserver.observe(this);

      this._initializeMap();
    }

    disconnectedCallback() {
      if (this._resizeObserver) this._resizeObserver.disconnect();
    }

    async _initializeMap() {
      try {
        await this._loadLeaflet();

        const mapDiv = this.querySelector("#map");
        this._map = L.map(mapDiv).setView([51.1657, 10.4515], 6);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this._map);

        setTimeout(() => this._map.invalidateSize(), 300);

        if (this._lastData) {
          this.onCustomWidgetAfterUpdate({ data: this._lastData });
        }
      } catch (error) {
        console.error("Fehler beim Initialisieren der Karte:", error);
      }
    }

    _loadLeaflet() {
      if (window.L) return Promise.resolve();

      return new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => {
          console.log("Leaflet erfolgreich geladen.");
          resolve();
        };
        script.onerror = () => {
          console.error("Leaflet konnte nicht geladen werden.");
          reject(new Error("Leaflet load failed"));
        };
        document.head.appendChild(script);
      });
    }

    onCustomWidgetResize() {
      if (this._map) {
        this._map.invalidateSize();
      }
    }

    onCustomWidgetBeforeUpdate(changedProps) {}

    onCustomWidgetAfterUpdate(changedProps) {
      if (!this._map || !changedProps.data) return;
      this._lastData = changedProps.data;

      const data = changedProps.data;
      const latIndex = data.metadata.feeds.lat.values[0];
      const lonIndex = data.metadata.feeds.lon.values[0];
      const labelIndex = data.metadata.feeds.label.values[0];

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

  // WICHTIG: Sofortige Registrierung
  try {
    customElements.define("leaflet-map", LeafletMap);
    console.log("Widget 'leaflet-map' erfolgreich registriert.");
  } catch (e) {
    console.error("Fehler bei der Widget-Registrierung:", e);
  }
})();
