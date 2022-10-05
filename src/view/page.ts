import { html } from "htm/preact";
import { Component, ComponentChild, RenderableProps } from "preact";
import label from "../util/lang";

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
          if (["", undefined, null].indexOf(rawvalue as any) != -1)
            return html``;

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

declare class QuestionnairePageProps {
  onSubmit: CallableFunction;
  answerOptions: Answer[];
  subject: Subject;
  index: number;
  max: number;
  onClick: CallableFunction;
}
declare class QuestionnairePageState {}

export class QuestionnairePage extends Component<
  QuestionnairePageProps,
  QuestionnairePageState
> {
  render(
    props?: RenderableProps<QuestionnairePageProps, any>,
    state?: Readonly<QuestionnairePageState>
  ) {
    return html`<div class="page">
      <${PageHeader}
        title="${label("APP_TITLE")}"
        desc="${label("INTRODUCTION")}"
        subject=${props.subject}
        index=${props.index}
        max=${props.max}
        onClick=${props.onClick}
      />
      <footer>
        <${PropertiesTable} subject=${props.subject} />
      </footer>
      <main class="options-container">
        <form onSubmit=${props.onSubmit}>
          <${AnswerOption} options=${props.answerOptions} />
        </form>
      </main>
    </div> `;
  }
}

declare class QuestionnaireFinalPageProps {
  closingText?: string;
  reportEmail: string;
  reportBody: string;
  answersSentViaEndpoint?: boolean;
}

export class QuestionnaireFinalPage extends Component<
  QuestionnaireFinalPageProps,
  null
> {
  render(props: QuestionnaireFinalPageProps) {
    const suffix = props.answersSentViaEndpoint ? " ✔" : "";
    return html`<div class="page">
      <${PageHeader}
        title="${label("FINAL_TITLE") + suffix}"
        desc="${props.closingText ?? label("CLOSING_REMARKS_MAIL")}"
      />
      <main class="measure">
        <textarea rows="20" cols="60" readonly>${props.reportBody}</textarea>
        <div class="mailto-cta">
          <a
            target="_blank"
            href="mailto:${props.reportEmail}?subject=Linkbeoordeelaar"
            >${props.reportEmail}</a
          >
        </div>
      </main>
    </div>`;
  }
}

declare class QuestionnaireOpeningPageProps {
  onSubmit: CallableFunction;
}

export class QuestionnaireOpeningPage extends Component<
  QuestionnaireOpeningPageProps,
  any
> {
  render(props: QuestionnaireOpeningPageProps) {
    return html`<div class="page">
      <${PageHeader}
        title="${label("APP_TITLE")}"
        desc="${label("INTRODUCTION_OPENING")}"
      />
      <main class="measure">
        <form onSubmit=${props.onSubmit}>
          <${AnswerOptionButton}
            value="start"
            mnemonic="Enter"
            name=${label("START")}
            description=${label("START_DESC")}
          />
        </form>
      </main>
    </div>`;
  }
}

export class QuestionnaireSessionlessPage extends Component {
  render() {
    return html`<div class="page">
      <${PageHeader}
        title="${label("APP_TITLE")}"
        desc="${label("INTRODUCTION_SESSIONLESS")}"
      />
    </div>`;
  }
}

const PageHeader = (props: {
  title: string;
  desc: string;
  index?: number;
  max?: number;
  subject?: Subject;
  onClick?: CallableFunction;
}) => {
  return html`<header class="measure">
    <h1>
      ${props.title} ${props?.max ? html`(${props?.index}/${props?.max})` : ""}
    </h1>
    <h4>
      <code>${props?.subject?.url}</code> ${props.onClick
        ? html`<button class="reopen-popup" onClick=${props.onClick}>
            ${label("REOPEN_POPUP")}
          </button>`
        : ""}
    </h4>
    <p>${props.desc}</p>
  </header>`;
};

const Progress = (props: { index: number; max: number }) => {
  if (!props.max) return html``;
  const percentage = props.index / props.max;

  return html`
    <h4>
      <progress id="voortgang" value="${props.index}" max="${props.max + 1}">
        ${percentage.toFixed(0)}%
      </progress>
      <label for="voortgang">${props.index} / ${props.max}</label>
    </h4>
  `;
};
