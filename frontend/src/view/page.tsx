import { Component } from "preact";
import label from "../util/lang.js";

export function PropertiesTable(props: { subject: Subject; keys: string[] }) {
  return (
    <dl class="subject-properties measure-wide">
      {Object.entries(props.subject).map(([key, rawvalue]) => {
        // If there are allowed-keys, then skip if key is in them
        if (props.keys.length > 0 && props.keys.indexOf(key) == -1)
          return <></>;

        // If the value is None, N/A, etc., skip
        if (["", undefined, null].indexOf(rawvalue as any) != -1) return <></>;

        const value = String(rawvalue);

        return (
          <div class="keep-together kv-pair">
            <dt scope="row">${key}</dt>
            <dd>
              <code>${value}</code>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export function AnswerOption(props: { options: Answer[] }) {
  const keyboardSelect = (event: Event) => {
    event.preventDefault();
    console.log(`keyboard select`);
  };

  const mnemonic = (index: number) => {
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
  };

  const answers = props.options;
  return (
    <div class="option-list">
      {answers.map((answer, n) => {
        return (
          <AnswerOptionButton
            value={answer.value!}
            name={answer.name}
            description={answer.description ?? ""}
            mnemonic={mnemonic(n)}
          />
        );
      })}
    </div>
  );
}

interface ButtonConfig {
  value: string;
  mnemonic: string;
  name: string;
  description: string;
}

export function AnswerOptionButton(props: ButtonConfig) {
  return (
    <button
      type="submit"
      class="option"
      id={`opt-${props.value}`}
      value={props.value}
      data-key-equivalent={props.mnemonic}
    >
      <span class="mnemonic">
        <kbd title="press with keyboard">${props.mnemonic}</kbd>
      </span>
      <h2 class="option-title">${props.name}</h2>
      <p class="option-description">${props.description}</p>
    </button>
  );
}

interface QuestionnairePageProps {
  onSubmit: (...args: any[]) => void;
  answerOptions: Answer[];
  subject: Subject;
  index: number;
  max: number;
  onClick: (...args: any[]) => void;
}

export function QuestionnairePage(props: QuestionnairePageProps) {
  return (
    <div class="page">
      <PageHeader
        title={label("APP_TITLE")}
        desc={label("INTRODUCTION")}
        subject={props.subject}
        index={props.index}
        max={props.max}
        onClick={props.onClick}
      />
      <footer>
        <PropertiesTable subject={props.subject} keys={[]} />
      </footer>
      <main class="options-container">
        <form onSubmit={props.onSubmit}>
          <AnswerOption options={props.answerOptions} />
        </form>
      </main>
    </div>
  );
}

declare class QuestionnaireFinalPageProps {
  closingText?: string;
  reportEmail?: string;
  reportBody: string;
  answersSentViaEndpoint?: boolean;
}

export function QuestionnaireFinalPage(props: QuestionnaireFinalPageProps) {
  const suffix = props.answersSentViaEndpoint ? " ✔" : "";
  return (
    <div class="page">
      <PageHeader
        title={label("FINAL_TITLE") + suffix}
        desc={props.closingText ?? label("CLOSING_REMARKS_MAIL")}
      />
      <main class="measure">
        <textarea rows={20} cols={60} readonly>
          ${props.reportBody}
        </textarea>
        <div class="mailto-cta">
          <a
            target="_blank"
            href="mailto:${props.reportEmail}?subject=Linkbeoordeelaar"
          >
            {props.reportEmail}
          </a>
        </div>
      </main>
    </div>
  );
}

declare class QuestionnaireOpeningPageProps {
  onSubmit: (...args: any[]) => void;
}

export function QuestionnaireOpeningPage(props: QuestionnaireOpeningPageProps) {
  return (
    <div class="page">
      <PageHeader
        title={label("APP_TITLE")}
        desc={label("INTRODUCTION_OPENING")}
      />
      <main class="measure">
        <form onSubmit={props.onSubmit}>
          <AnswerOptionButton
            value="start"
            mnemonic="Enter"
            name={label("START")}
            description={label("START_DESC")}
          />
        </form>
      </main>
    </div>
  );
}

export class QuestionnaireSessionlessPage extends Component {
  render() {
    return (
      <div class="page">
        <PageHeader
          title={label("APP_TITLE")}
          desc={label("INTRODUCTION_SESSIONLESS")}
        />
      </div>
    );
  }
}

export function PageHeader(props: {
  title: string;
  desc: string;
  index?: number;
  max?: number;
  subject?: Subject;
  onClick?: () => void;
}) {
  return (
    <header class="measure">
      <h1>
        {props.title}

        <span>
          {props.index}/{props.max}
        </span>
      </h1>
      <h4>
        <code>${props?.subject?.url}</code>
        {props.onClick ? (
          <button class="reopen-popup" onClick={props.onClick}>
            ${label("REOPEN_POPUP")}
          </button>
        ) : (
          <></>
        )}
      </h4>
      <p>${props.desc}</p>
    </header>
  );
}

export function Progress(props: { index: number; max: number }) {
  if (!props.max) return <></>;
  const percentage = props.index / props.max;

  return (
    <h4>
      <progress id="voortgang" value="${props.index}" max="${props.max + 1}">
        ${percentage.toFixed(0)}%
      </progress>
      <label for="voortgang">
        ${props.index} / ${props.max}
      </label>
    </h4>
  );
}
