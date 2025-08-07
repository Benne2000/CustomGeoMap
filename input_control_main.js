class CustomInputControl extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const textColor = this.getAttribute('textColor') || '#000000';
    const backgroundColor = this.getAttribute('backgroundColor') || '#ffffff';
    const borderColor = this.getAttribute('borderColor') || '#cccccc';
    const fontSize = this.getAttribute('fontSize') || '14px';
    const optionsRaw = this.getAttribute('options') || 'Option 1,Option 2,Option 3';
    const options = optionsRaw.split(',');

    this.render(textColor, backgroundColor, borderColor, fontSize, options);
  }

  render(textColor, backgroundColor, borderColor, fontSize, options) {
    const style = `
      <style>
        select {
          color: ${textColor};
          background-color: ${backgroundColor};
          border: 1px solid ${borderColor};
          font-size: ${fontSize};
          padding: 5px;
          border-radius: 4px;
          width: 100%;
        }
        option {
          color: ${textColor};
          background-color: ${backgroundColor};
        }
      </style>
    `;

    const select = document.createElement('select');
    options.forEach(opt => {
      const option = document.createElement('option');
      option.textContent = opt.trim();
      select.appendChild(option);
    });

    this.shadowRoot.innerHTML = style;
    this.shadowRoot.appendChild(select);
  }
}

customElements.define('custom-input-control', CustomInputControl);
