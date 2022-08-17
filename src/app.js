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
    options: [],
  };

  render(props, state) {
    const answers = props.options;
    return html`
      <div class="option-list">
        ${answers.map((answer) => {
          return html` <button
            type="submit"
            class="option"
            id="opt-${answer.value}"
            value=${answer.value}
          >
            <h2 class="option-title">${answer.name}</h2>
            <p class="option-description">${answer.description}</p>
          </button>`;
        })}
      </div>
    `;
  }
}

export class QuestionnaireApp extends Component {
  async componentWillMount() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });

    const sessionKey = params.session;
    if (!sessionKey)
      throw new Error(
        "1753c02d-503b-4422-8a5e-2e8464cadf17: no session URL provided"
      );

    const configFileUrl = atob(sessionKey);
    this.setState({ configurationURL: configFileUrl });

    try {
      // Fetch and parse from URL
      const configDict = await this.getConfiguration({
        url: configFileUrl,
      });

      this.setState({ configuration: configDict });
    } catch (err) {
      this.setState({
        message: html`<code>c0095f9e-f9cb-4cbc-aefd-d88ef94e5e37</code> Could
          not load configuration: ${err.message}`,
      });
      console.error(err);
    }
  }

  async getConfiguration({ url }) {
    console.info(`Fetching configuration file at: ${url}`);
    const response = await fetch(new URL(url));
    return JSON.parse(await response.text());
  }

  chooseOption(event) {
    event.preventDefault();
    console.log(`Fire -chooseOption by ${event.submitter.value}`);
  }

  render(props, state) {
    return html` <header class="measure">
        <h1>Beoordeel</h1>
        <p>
          Beoordeel de link geopend in de popup door op een van de opties te
          klikken. Als je het beoordelen moet onderbreken, kun je op deze
          computer in deze browser binnen een week doorgaan.
        </p>
        <p>${state.message}</p>
      </header>
      <main class="options-container">
        <form onSubmit=${this.chooseOption}>
          <${AnswerOption} options=${state.configuration?.answerOptions} />
        </form>
      </main>
      <footer>
        <${PropertiesTable} subject=${state.configuration?.subjects[4]} />
      </footer>`;
  }
}
