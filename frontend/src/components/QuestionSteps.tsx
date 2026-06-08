import type { Question as QuestionData } from "../types.js";
import { AnswerOption } from "./AnswerOption.js";

export interface Props {
  questions: QuestionData[];
  onSubmit: (...args: any[]) => void;
}

export function QuestionSteps(props: Props) {
  return (
    <main class="options-container">
      {props.questions.map((q) => (
        <QuestionStep key={q.id} question={q} onSubmit={props.onSubmit} />
      ))}
    </main>
  );
}

export interface SingleProps {
  question: QuestionData;
  onSubmit: (...args: any[]) => void;
}

export function QuestionStep(props: SingleProps) {
  const q = props.question;
  return (
    <div>
      <h4>{q.label}</h4>
      <form id={q.id} onSubmit={props.onSubmit}>
        <AnswerOption options={q.options} />
      </form>
    </div>
  );
}
