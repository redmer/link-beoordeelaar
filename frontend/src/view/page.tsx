import { Component } from "preact";
import { AnswerOptionButton } from "../components/AnswerOption.js";
import { Progress } from "../components/Progress.js";
import { PropertiesTable } from "../components/PropertiesTable.js";
import { QuestionSteps } from "../components/QuestionSteps.js";
import type { Question, Subject } from "../types.js";
import label from "../util/lang.js";

interface QuestionnairePageProps {
  onSubmit: (...args: any[]) => void;
  questions: Question[];
  subject: Subject;
  unjudgedSubjects: number;
  totalSubjects: number;
  onClick: (...args: any[]) => void;
}

export function QuestionnairePage(props: QuestionnairePageProps) {
  return (
    <div class="page">
      <PageHeader
        title={label("APP_TITLE")}
        desc={label("INTRODUCTION")}
        subject={props.subject}
        unjudgedSubjects={props.unjudgedSubjects}
        totalSubjects={props.totalSubjects}
        onClick={props.onClick}
      />
      <footer>
        <PropertiesTable metadata={props.subject.metadata} keys={[]} />
      </footer>
      <QuestionSteps questions={props.questions} onSubmit={props.onSubmit} />
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
        <textarea rows={20} cols={60} readOnly>
          {props.reportBody}
        </textarea>
        <div class="mailto-cta">
          <a
            target="_blank"
            href="mailto:{props.reportEmail}?subject=Linkbeoordeelaar"
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
  subjectsUnjudged?: number;
  subjectsTotal?: number;
}

export function QuestionnaireOpeningPage(props: QuestionnaireOpeningPageProps) {
  return (
    <div class="page">
      <PageHeader
        title={label("APP_TITLE")}
        desc={label("INTRODUCTION_OPENING")}
        unjudgedSubjects={props.subjectsUnjudged ?? Infinity}
        totalSubjects={props.subjectsTotal ?? Infinity}
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
  unjudgedSubjects?: number;
  totalSubjects?: number;
  subject?: Subject;
  onClick?: () => void;
}) {
  return (
    <header class="measure">
      <Progress
        unjudgedSubjects={props.unjudgedSubjects ?? 0}
        totalSubjects={props.totalSubjects ?? 0}
      ></Progress>
      <h1>{props.title}</h1>
      <h4>
        <code>{props?.subject?.url}</code>
        {props.onClick ? (
          <button class="reopen-popup" onClick={props.onClick}>
            {label("REOPEN_POPUP")}
          </button>
        ) : (
          <></>
        )}
      </h4>
      <p>{props.desc}</p>
    </header>
  );
}
