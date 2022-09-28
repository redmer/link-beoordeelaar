/// <reference path="../types/configuration.d.ts" />
import { html } from "htm/preact";
import { Component } from "preact";
import {
  QuestionnaireFinalPage,
  QuestionnaireOpeningPage,
  QuestionnairePage,
  QuestionnaireSessionlessPage,
} from "../view/page";
import delay from "../util/delay";
import { Configuration } from "../model/config";
import pick from "../util/filtered-object";

declare class QuestionnaireAppState {
  sessionKey: string;
  answers: Answer[];
  data: QuestionnaireData;
  started: boolean;
}

export class QuestionnaireApp extends Component<any, QuestionnaireAppState> {
  popup?: Window;

  async componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    const sessionKey = params.get("session");
    if (!sessionKey) {
      console.error("No session URL provided");
      return;
    }

    const data = await Configuration.fetchQuestionnaire(sessionKey);
    document.body.lang = data.lang;

    this.setState({
      sessionKey: sessionKey,
      data: data,
      answers: [],
      started: false,
    });
    document.addEventListener("keyup", this.findMnemonic);

    const savedValue = window.localStorage.getItem(sessionKey);
    if (savedValue) {
      this.setState({
        answers: JSON.parse(savedValue),
        started: true,
      });
    }

    window.addEventListener("popstate", this.navBack);
  }

  navBack = async (event) => {
    this.state.answers.pop();
    this.setState({ answers: this.state.answers });
    window.localStorage.setItem(
      this.state.sessionKey,
      JSON.stringify(this.state.answers)
    );
  };

  chooseOption = async (event) => {
    event.preventDefault();
    console.log(`Fire -chooseOption by ${event.submitter.value}`);
    const newAnswersValue = [
      ...this.state.answers,
      {
        name: event.submitter.value,
        value: event.submitter.value,
      },
    ];
    this.setState({ answers: newAnswersValue });
    history.pushState({ answers: newAnswersValue }, "");
    window.localStorage.setItem(
      this.state.sessionKey,
      JSON.stringify(newAnswersValue)
    );
    // answers.length + 1 => state first updated at next rendering cycle
    try {
      this.popup.location =
        this.state.data.subjects[this.state.answers.length + 1].url;
    } catch {}
  };

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

  start = async (event) => {
    event.preventDefault();
    this.popup = window.open(
      this.state.data.subjects[this.state.answers.length].url, // always at start
      this.POPUP_WINDOW,
      "toolbar=no,menubar=no,left=1,top=1"
    );
    this.setState({ started: true });
  };

  POPUP_WINDOW = "link-beoordelaar-popup";

  answersBody = () => {
    let subjects = this.state.data.subjects;
    const zipped = subjects.map((s, i) => [s, this.state.answers[i]]);
    return zipped.reduce(
      (body: string, [subject, answer]: [Subject, Answer]) => {
        const s = `${subject.url}`;
        const a = `${answer.value}`;
        return (body += `"${s}"\t"${a}"\n`);
      },
      "Results\n\n"
    );
  };

  render(props: any, state: QuestionnaireAppState) {
    console.info(state);
    if (!state.data) {
      return html`<${QuestionnaireSessionlessPage} />`;
    }

    if (!state.started) {
      return html`<${QuestionnaireOpeningPage} onSubmit=${this.start} />`;
    }

    if (state.answers?.length == state.data.subjects?.length) {
      const body = this.answersBody();
      return html`<${QuestionnaireFinalPage}
        closingText=${state.data.closingText}
        reportEmail=${state.data.reporting.email ?? state.data.reporting}
        reportBody=${body}
      />`;
    }

    // Render the current subject
    return html`<${QuestionnairePage}
      onClick=${this.start}
      onSubmit=${this.chooseOption}
      answerOptions=${state.data.answerOptions}
      subject=${state.data.subjects[state.answers.length]}
      index=${state.answers.length + 1}
      max=${state.data.subjects.length}
    />`;
  }
}
