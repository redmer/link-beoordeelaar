/// <reference path="../types/configuration.d.ts" />
import { html } from "htm/preact";
import { Component } from "preact";
import { Configuration } from "../model/config";
import delay from "../util/delay";
import { digest } from "../util/digest";
import { UI_TRANSLATIONS } from "../util/lang";
import {
  QuestionnaireFinalPage,
  QuestionnaireOpeningPage,
  QuestionnairePage,
  QuestionnaireSessionlessPage,
} from "../view/page";

declare class QuestionnaireAppState {
  sessionKey: string;
  answers: Answer[];
  data: QuestionnaireData;
  started: boolean;
  answersSentViaEndpoint: boolean;
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
    UI_TRANSLATIONS["x-customized"] = data?.translations;

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

  emailBody = () => {
    let subjects = this.state.data.subjects;
    let answers = this.state.answers;

    const payload = Configuration.answersPayload(subjects, answers);
    return (
      "Results\n\n" +
      Object.entries(payload)
        .map(([s, a]) => `"${btoa(s)}"\t"${a}"`)
        .join("\n")
    );
  };

  postAnswers = async () => {
    if (this.state.answersSentViaEndpoint) return;
    if (this.state.data.reporting?.endpoint?.path == undefined) return;

    let subjects = this.state.data.subjects;
    let answers = this.state.answers;

    const payload = Configuration.answersPayload(subjects, answers);

    // prevent double calls, when answers are unchanged but post-request is resend
    if ("TextEncoder" in window) {
      const digestSubjectAnswerPair = await digest(JSON.stringify(payload));
      const hasSent = window.localStorage.getItem(digestSubjectAnswerPair);
      if (hasSent) return;
      window.localStorage.setItem(
        digestSubjectAnswerPair,
        JSON.stringify(answers.map((value) => value.value))
      );
    }
    console.info("Will report payload to endpoint");

    try {
      await Configuration.postAnswers(
        payload,
        this.state.data.reporting.endpoint,
        {
          sessionKey: this.state.sessionKey,
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  render(props: any, state: QuestionnaireAppState) {
    // console.info(state);
    if (!state.data) {
      // No data -> no session loaded
      return html`<${QuestionnaireSessionlessPage} />`;
    }

    if (!state.started) {
      // Not started -> Opening page
      return html`<${QuestionnaireOpeningPage} onSubmit=${this.start} />`;
    }

    if (state.answers?.length == state.data.subjects?.length) {
      // As much answers as subjects -> Final page
      this.postAnswers().then(
        () => this.setState({ answersSentViaEndpoint: true }),
        () => this.setState({ answersSentViaEndpoint: false })
      );
      this.popup?.close();
      const body = this.emailBody();
      return html`<${QuestionnaireFinalPage}
        answersSentViaEndpoint=${state.answersSentViaEndpoint}
        closingText=${state.data.closingText}
        reportEmail=${state.data.reporting.email ?? state.data.reporting}
        reportBody=${body}
      />`;
    }

    // Else: render the current subject
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
