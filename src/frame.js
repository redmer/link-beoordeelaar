import {
  html,
  Component,
} from "https://unpkg.com/htm/preact/standalone.module.js";

export default class Frame extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  /** @param {Error} error */
  static getDerivedStateFromError(error) {
    console.log("called -getDerivedStateFromError");
    return {
      hasError: true,
      errorCode: error.name,
      errorMessage: error.message,
      error: error,
    };
  }

  render(props, state) {
    const repo = `redmer/link-beoordeelaar`;
    const help =
      props.config?.help ?? "https://rdmr.eu/link-beoordeelaar/help/enduser/nl";

    if (state.hasError) {
      return html`<div id="link-beoordelaar">
        <${PageHeader} repo=${repo} help=${help} />
        <main class="app">
          <header class="measure">
            <h1>Error</h1>
            <h2>${state.errorCode}</h2>
            <p>${state.errorMessage}</p>
          </header>
        </main>
        <${PageFooter} diagnostics=${state.error} />
      </div>`;
    }

    return html`<div id="link-beoordelaar">
      <${PageHeader} repo=${repo} help=${help} />
      <main class="app">${this.props.children}</main>
      <${PageFooter} diagnostics=${console.logs} />
    </div>`;
  }
}

function PageHeader(props) {
  return html`<header class="colophon">
    <div>
      <a target="_blank" href="https://github.com/${props.repo}">
        ${props.repo}
      </a>
    </div>
    <div>
      <a target="_blank" href=${props.help}>HELP</a>
    </div>
  </header>`;
}

function PageFooter(props) {
  return html`
    <footer class="diagnostics">
      <details closed>
        <summary>Diagnostica</summary>
        <code id="debug-diagnostics">${JSON.stringify(props.diagnostics)}</code>
      </details>
    </footer>
  `;
}
