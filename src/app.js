import {
  html,
  Component,
} from "https://unpkg.com/htm/preact/standalone.module.js";

export class PropertiesTable extends Component {
  static defaultProps = {
    subject: [],
    keys: [],
  };

  render(props, state) {
    return html`
      <dl class="subject-properties measure-wide">
        ${Object.entries(props.subject).map(([key, rawvalue]) => {
          // If there are allowed-keys, then skip if key is in them
          if (props.keys.length > 0 && props.keys.indexOf(key) == -1)
            return html``;
          // If the value is None, N/A, etc., skip
          if (["", undefined, null].indexOf(rawvalue) != -1) return html``;
          const value = String(rawvalue);
          return html`
            <div class="keep-together kv-pair">
              <dt scope="row">${key}</dt>
              <dd><code>${value}</code></dd>
            </div>
          `;
        })}
      </dl>
    `;
  }
}

export class AnswerOption extends Component {
  static defaultProps = {
    options: [{ name: "yes" }, { name: "no" }],
  };

  render(props, state) {
    const answers = props.options;
    return html`
      <form>
        <div class="option-list">
          ${answers.map((answer) => {
            return html` <label class="option" id="opt-${answer.value}">
              <input type="radio" name="opt" value="${answer.value}" />
              <h2 class="option-title">${answer.name}</h2>
              <p class="option-description">${answer.description}</p>
            </label>`;
          })}
        </div>
      </form>
    `;
  }
}

/** The PageFrame provides the header, main, footer of the app.
 *
 * From configuration
 */
export class PageFrame extends Component {
  render(props, state) {
    const repo = `redmer/link-beoordeelaar`;
    const help = props.config
      ? props.config.help
      : "https://rdmr.eu/link-beoordeelaar/help-nl";

    return html`
      <header class="colophon">
        <div>
          <a target="_blank" href="https://github.com/${repo}"> ${repo} </a>
        </div>
        <div>
          <a target="_blank" href="${help}">HELP</a>
        </div>
      </header>
      <main class="app">${props.children}</main>
      <footer class="diagnostics">
        <details open>
          <summary>Diagnostica</summary>
          <code id="debug-diagnostics">${JSON.stringify(props.config)}</code>
        </details>
      </footer>
    `;
  }
}

export class App extends Component {
  async componentWillMount() {
    try {
      // Concept: in query-request, payload=abc1234 contains a
      // base64-encoded url to a session configuration JSON
      const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
      });

      const sessionKey = params.session;
      if (!sessionKey)
        throw new Error("Provide session URL in query parameter");

      const configFileUrl = atob(sessionKey);
      this.setState({ configurationURL: configFileUrl });

      const configDict = await this.getConfiguration({
        url: configFileUrl,
      });

      this.setState({ configuration: configDict });
    } catch (err) {
      console.error(err);
      this.setState({
        message: html`Could not load configuration: ${err.message}`,
      });
    }
  }

  async getConfiguration({ url }) {
    console.info(`Discovered configuration file at: ${url}`);
    const response = await fetch(new URL(url));
    return JSON.parse(await response.text());
  }

  render(props, state) {
    return html`<div id="link-beoordelaar">
      <${PageFrame} config=${state.configuration}>
        <header class="measure"> 
          <h1>Beoordeel</h1>
          <p>
            Beoordeel de link geopend in de popup door op een van de opties
            te klikken. Als je het beoordelen moet onderbreken, kun je op deze
            computer in deze browser binnen een week doorgaan.
          </p>
          <p>${state.message}</p>
        </header>
        <main class="options-container">
          <${AnswerOption} options=${state.configuration?.answerOptions} />
        </main>
        <footer>
          <${PropertiesTable} subject=${state.configuration?.subjects[5]} />
        </footer>
      </${PageFrame}>
    </div>`;
  }
}
