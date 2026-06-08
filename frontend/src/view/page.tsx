import { Component } from "react";
import { AnswerOptionButton } from "../components/AnswerOption.js";
import { Progress } from "../components/Progress.js";
import { PropertiesTable } from "../components/PropertiesTable.js";
import { Questionnaire } from "../components/QuestionSteps.js";
import type { Answers, Question, Subject } from "../types.js";
import label from "../util/lang.js";

interface QuestionnairePageProps {
  onSubmit: (...args: any[]) => void;
  questions: Question[];
  answers: Answers;
  subject: Subject;
  unjudgedSubjects: number;
  totalSubjects: number;
  onClick: (...args: any[]) => void;
}

export function QuestionnairePage(props: QuestionnairePageProps) {
  return (
    <div className="page">
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
      <Questionnaire
        questions={props.questions}
        answers={props.answers}
        onSubmit={props.onSubmit}
      />
    </div>
  );
}

export function QuestionnaireNoSubjectRemaining(
  props: Pick<QuestionnairePageProps, "totalSubjects">,
) {
  return (
    <div className="page">
      <PageHeader
        title={`${label("NO_SUBJECTS_REMAINING_TITLE")}: ${props.totalSubjects}/${props.totalSubjects}`}
        desc={label("NO_SUBJECTS_REMAINING_DESC")}
      />
      <main className="measure">
        <p>☑️</p>
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
    <div className="page">
      <PageHeader
        title={label("FINAL_TITLE") + suffix}
        desc={props.closingText ?? label("CLOSING_REMARKS_MAIL")}
      />
      <main className="measure">
        <textarea rows={20} cols={60} readOnly>
          {props.reportBody}
        </textarea>
        <div className="mailto-cta">
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
    <div className="page">
      <PageHeader
        title={label("APP_TITLE")}
        desc={label("INTRODUCTION_OPENING")}
        unjudgedSubjects={props.subjectsUnjudged ?? Infinity}
        totalSubjects={props.subjectsTotal ?? Infinity}
      />
      <main className="measure">
        <form onSubmit={props.onSubmit}>
          <AnswerOptionButton
            value="start"
            mnemonic="Enter"
            label={label("START")}
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
      <div className="page">
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
    <header className="measure">
      <Progress
        unjudgedSubjects={props.unjudgedSubjects ?? 0}
        totalSubjects={props.totalSubjects ?? 0}
      ></Progress>
      <h1>{props.title}</h1>
      <h4>
        <code>{props?.subject?.url}</code>
        {props.onClick ? (
          <button className="reopen-popup" onClick={props.onClick}>
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
