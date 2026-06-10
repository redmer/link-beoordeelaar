import { Component } from "react";
import type { Answers, Question, Subject } from "../types.js";
import label from "../util/lang.js";
import { AnswerOptionButton } from "./AnswerOption.js";
import { Hero } from "./Hero.js";
import { PropertiesTable } from "./PropertiesTable.js";
import { Questionnaire } from "./QuestionSteps.js";

interface QuestionnairePageProps {
  onSubmit: (...args: any[]) => void;
  questions: Question[];
  answers: Answers;
  subject: Subject;
  onClick: (...args: any[]) => void;
}

export function QuestionnairePage(props: QuestionnairePageProps) {
  const questionnaireKey = `${props.subject.id}:${JSON.stringify(props.answers)}`;

  return (
    <div className="page">
      <Hero
        title={label("APP_TITLE")}
        desc={label("INTRODUCTION")}
        subject={props.subject}
        onClick={props.onClick}
      />
      <footer>
        <PropertiesTable metadata={props.subject.metadata} keys={[]} />
      </footer>
      <Questionnaire
        key={questionnaireKey}
        questions={props.questions}
        answers={props.answers}
        onSubmit={props.onSubmit}
      />
    </div>
  );
}

export function QuestionnaireNoSubjectRemaining() {
  return (
    <div className="page page-centered">
      <Hero
        title={`${label("NO_SUBJECTS_REMAINING_TITLE")}`}
        desc={label("NO_SUBJECTS_REMAINING_DESC")}
      />
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
    <div className="page page-centered">
      <Hero title={label("APP_TITLE")} desc={label("INTRODUCTION_OPENING")} />
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
      <div className="page page-centered">
        <Hero
          title={label("SESSIONLESS_TITLE")}
          desc={label("SESSIONLESS_DESC")}
        />
        <main className="measure">
          <form>
            <input name="session" type="text"></input>
            <input type="submit" value={label("START")} />
          </form>
        </main>
      </div>
    );
  }
}
