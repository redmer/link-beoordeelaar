/// <reference path="../types/configuration.d.ts" />
import { html } from "htm/preact";
import { Component } from "preact";
import { AnswerOption, PropertiesTable } from "../view/page";
import Questionnaire from "../model/questionnaire";
import label from "../util/lang";
import delay from "../util/delay";

declare class QuestionnaireAppState {
  answers: Answer[];
  configuration: Configuration;
  configurationURL: string;
  error: Error;
  currentSubject: Subject;
}

declare class QuestionnaireAppProps {}

export class QuestionnaireApp extends Component<
  QuestionnaireAppProps,
  QuestionnaireAppState
> {
  static defaultProps = {
    answers: [] as Answer[],
    configuration: {} as Configuration,
    configurationURL: "",
    error: undefined as unknown as Error,
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

    const q = new Questionnaire(configFileUrl);
    await q.load();
    label("this is not me");
    console.log([...q.subjects()]);

    try {
      /** @type {Configuration} */
      const configDict: Configuration = await this.getConfiguration({
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
    this.setState({
      answers: [
        ...this.state.answers,
        {
          name: event.submitter.value,
          value: event.submitter.value,
        },
      ],
    });
  }

  async findMnemonic(event: KeyboardEvent) {
    event.preventDefault();
    console.log(`Keyboard pressed: ${event.key}`);
    /** @type {HTMLButtonElement | null} */
    const target: HTMLButtonElement | null = document.querySelector(
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
