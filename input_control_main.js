class CustomInputControl extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const valuesRaw = this.getAttribute('dimensionValues') || '[]';
    let values = [];

    try {
      values = JSON.parse(valuesRaw);
    } catch (e) {
      console.warn('Ungültiges JSON für dimensionValues:', valuesRaw);
    }

    this.render(values);
  }

  render(values) {
    const style = `
      <style>
        select {
          padding: 6px 10px;
          font-size: 14px;
          border-radius: 4px;
          border: 1px solid #d0d0d0;
          background-color: #ffffff;
          color: #1a73e8;
          font-family: "72", Arial, sans-serif;
          width: 100%;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><polygon points='0,0 12,0 6,8' fill='%231a73e8'/></svg>");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 12px;
          padding-right: 32px;
        }

        select:focus {
          outline: none;
          border-color: #1a73e8;
          box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
        }

        option {
          background-color: #ffffff;
          color: #1a73e8;
        }
      </style>
    `;

    const select = document.createElement('select');
    values.forEach(val => {
      const option = document.createElement('option');
      option.textContent = val;
      select.appendChild(option);
    });

    this.shadowRoot.innerHTML = style;
    this.shadowRoot.appendChild(select);
  }
}

customElements.define('custom-input-control', CustomInputControl);
