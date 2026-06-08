import type { Answers, Question as QuestionData } from "../types.js";
import label from "../util/lang.js";
import { AnswerGroup, AnswerSubmitButton } from "./AnswerOption.js";

export interface Props {
  questions: QuestionData[];
  answers: Answers;
  onSubmit: (...args: any[]) => void;
}

export function Questionnaire(props: Props) {
  const mnemonic = (index: number) => {
    return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"][index];
  };
  return (
    <form onSubmit={props.onSubmit} className="options-container">
      {props.questions.map((q, n) => (
        <QuestionStep key={q.id} question={q} answers={props.answers} />
      ))}
      <fieldset>
        <div className="option-list">
          <AnswerSubmitButton />
        </div>
      </fieldset>
    </form>
  );
}

export interface SingleProps {
  question: QuestionData;
  answers: Answers;
}

export function QuestionStep(props: SingleProps) {
  const q = props.question;
  return (
    <fieldset>
      <legend>
        {q.label} (
        {q.mode == "one" ? label("CHOOSE_ONE") : label("CHOOSE_MULTIPLE")})
      </legend>
      <AnswerGroup
        options={q.options}
        name={q.id}
        mode={q.mode}
        selectedAnswers={props.answers[q.id] ?? []}
      />
    </fieldset>
  );
}
