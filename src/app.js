/// <reference path="types/configuration.d.ts" />
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

  keyboardSelect(event) {
    event.preventDefault();
    console.log(`keyboard select`);
  }

  mnemonic(index) {
    return [
      "f",
      "j",
      "x",
      "5",
      "6",
      "7",
      "d",
      "k",
      "r",
      "u",
      "e",
      "i",
      "1",
      "2",
      "9",
      "0",
    ][index];
  }

  render(props, state) {
    const answers = props.options;
    return html`
      <div class="option-list">
        ${answers.map((answer, n) => {
          return html`<${AnswerOptionButton}
            value=${answer.value}
            name=${answer.name}
            description=${answer.description}
            mnemonic=${this.mnemonic(n)}
          />`;
        })}
      </div>
    `;
  }
}

function AnswerOptionButton(props) {
  return html`<button
    type="submit"
    class="option"
    id="opt-${props.value}"
    value=${props.value}
    data-key-equivalent=${props.mnemonic}
  >
    <span class="mnemonic"
      ><kbd title="press with keyboard">${props.mnemonic}</kbd></span
    >
    <h2 class="option-title">${props.name}</h2>
    <p class="option-description">${props.description}</p>
  </button>`;
}
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

class QuestionnairePage extends Component {
  render() {
    return html``;
  }
}

class QuestionnaireFinalPage extends Component {
  render() {
    return html``;
  }
}

class QuestionnaireInitialPage extends Component {
  render() {
    return html``;
  }
}

export class QuestionnaireApp extends Component {
  static defaultProps = {
    /** @type {Answer} */
    answers: [],
    /** @type {Configuration} */
    configuration: {},
    /** @type {string} */
    configurationURL: "",
    /** @type {Error} */
    error: undefined,
  };

  async componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    const sessionKey = params.get("session");
    if (!sessionKey)
      throw new Error(
        "1753c02d-503b-4422-8a5e-2e8464cadf17: no session URL provided"
      );

    const configFileUrl = atob(sessionKey);
    this.setState({ configurationURL: configFileUrl });

    try {
      /** @type {Configuration} */
      const configDict = await this.getConfiguration({
        url: configFileUrl,
      });
      this.setState({ configuration: configDict });
      document.body.lang = configDict.lang ?? "en";

      this.setState({ currentSubject: configDict.subjects[0] });
    } catch (error) {
      this.setState({ error });
    }

    document.addEventListener("keyup", this.findMnemonic);
  }

  async getConfiguration({ url }) {
    console.info(`Fetching configuration file at: ${url}`);
    const response = await fetch(new URL(url));
    return JSON.parse(await response.text());
  }

  async chooseOption(event) {
    event.preventDefault();
    console.log(`Fire -chooseOption by ${event.submitter.value}`);
    this.setState({ answers: this.state.answers.push() });
  }

  async findMnemonic(/** @type {KeyboardEvent} */ event) {
    event.preventDefault();
    console.log(`Keyboard pressed: ${event.key}`);
    /** @type {HTMLButtonElement | null} */
    const target = document.querySelector(
      `button[data-key-equivalent="${event.key}"]`
    );
    if (!target) return;
    target.classList.add("option-active");
    target.click();
    await delay(300);
    target.classList.remove("option-active");
  }

  POPUP_WINDOW = "link-beoordelaar-popup";

  navigate;

  start = async (event) => {
    event.preventDefault();
    window.open(
      this.state.currentSubject.url,
      this.POPUP_WINDOW,
      "toolbar=no,menubar=no,left=1,top=1"
    );
  };

  render(props, state) {
    if (state.error) {
      state.error.message = `c0095f9e-f9cb-4cbc-aefd-d88ef94e5e37 — Could
          not load configuration: "${state.error.message}"`;
      throw state.error;
    }

    return html` <header class="measure">
        <h1>Beoordeel</h1>
        <p>
          Beoordeel de link geopend in de popup door op een van de opties te
          klikken. Als je het beoordelen moet onderbreken, kun je op deze
          computer in deze browser binnen een week doorgaan.
        </p>
        <button onClick=${this.start}>Start</button>
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
