import type { Answers, Question as QuestionData } from "../types.js";
import label from "../util/lang.js";
import { AnswerGroup, AnswerSubmitButton } from "./AnswerOption.js";
import { Mnemonic } from "./Mnemonic.js";

export interface Props {
  questions: QuestionData[];
  answers: Answers;
  onSubmit: (...args: any[]) => void;
}

export function Questionnaire(props: Props) {
  const mnemonic = (index: number) => {
    return ["1", "2", "3", "4", "5", "6", "7", "8", "9"][index];
  };
  return (
    <form
      onSubmit={props.onSubmit}
      className="options-container"
      id="questionnaire"
    >
      {props.questions.map((q, n) => {
        const mn = mnemonic(n);
        return (
          <QuestionStep
            key={q.id}
            question={q}
            answers={props.answers}
            mnemonic={mn}
          />
        );
      })}
      <fieldset>
        <legend>
          <Mnemonic keyboard="0" />
          Final
        </legend>
        <div className="option-list">
          <AnswerSubmitButton onSubmit={props.onSubmit} />
        </div>
      </fieldset>
    </form>
  );
}

export interface SingleProps {
  question: QuestionData;
  answers: Answers;
  mnemonic: string;
}

export function QuestionStep(props: SingleProps) {
  return (
    <fieldset>
      <legend>
        <Mnemonic keyboard={props.mnemonic} />
        {props.question.label} (
        {props.question.mode == "one"
          ? label("CHOOSE_ONE")
          : label("CHOOSE_MULTIPLE")}
        )
      </legend>
      <AnswerGroup
        options={props.question.options}
        name={props.question.id}
        mode={props.question.mode}
        selectedAnswers={props.answers[props.question.id] ?? []}
      />
    </fieldset>
  );
}
