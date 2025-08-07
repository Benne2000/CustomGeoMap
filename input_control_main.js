class CustomInputControl extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const style = `
      <style>
        :host {
          display: inline-block;
          font-family: Arial, sans-serif;
        }

        select {
          padding: 8px 12px;
          font-size: 14px;
          border-radius: 6px;
          border: 1px solid #000000;
          background-color: #000000;
          color: #b41821;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><polygon points='0,0 12,0 6,8' fill='%23b41821'/></svg>");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 12px;
          padding-right: 32px;
          transition: box-shadow 0.3s ease;
        }

        select:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(180, 24, 33, 0.4);
        }

        select:hover {
          box-shadow: 0 0 0 2px rgba(180, 24, 33, 0.2);
        }

        option {
          background-color: #000000;
          color: #b41821;
        }
      </style>
    `;

    const dropdown = `
      <select>
        <option value="">Bitte wählen</option>
        <option value="eins">Option 1</option>
        <option value="zwei">Option 2</option>
        <option value="drei">Option 3</option>
      </select>
    `;

    this.shadowRoot.innerHTML = `${style}${dropdown}`;
  }
}

customElements.define('custom-input-control', CustomInputControl);
