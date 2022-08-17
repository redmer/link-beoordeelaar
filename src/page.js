import {
  html,
  Component,
} from "https://unpkg.com/htm/preact/standalone.module.js";

export default class SinglePage extends Component {
  render(props, state) {
    const repo = `redmer/link-beoordeelaar`;
    const help =
      props.config?.help ?? "https://rdmr.eu/link-beoordeelaar/help-nl";

    return html`<div id="link-beoordelaar">
      <${PageHeader} repo=${repo} help=${help} />
      <main class="app">${props.children}</main>
      <${PageFooter} diagnostics=${state} />
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
      <a target="_blank" href="${props.help}">HELP</a>
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
