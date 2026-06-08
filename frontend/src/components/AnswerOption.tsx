import type { AnswerOption as AnswerOptionData, Question } from "../types.js";
import label from "../util/lang.js";

export interface AnswerGroupProps {
  options: AnswerOptionData[];
  mode: Question["mode"];
  name: Question["id"];
  selectedAnswers: string[];
}

export function AnswerGroup(props: AnswerGroupProps) {
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
    <div className="option-list">
      {answers.map((answer, n) => {
        return (
          <AnswerOptionButton
            mode={props.mode}
            name={props.name}
            value={answer.value!}
            label={answer.label}
            description={answer.description ?? ""}
            mnemonic={mnemonic(n)}
            isFinal={answer?.final ?? false}
            checked={props.selectedAnswers.includes(answer.value!)}
          />
        );
      })}
    </div>
  );
}

export interface AnswerOption {
  label: string;
  description: string;
  value: string;
  name?: string;
  mnemonic: string;
  isFinal?: boolean;
  mode?: Question["mode"];
  checked?: boolean;
}

export function AnswerOptionButton(props: AnswerOption) {
  return (
    <div className="input-label">
      <input
        type={
          props.mode == "one"
            ? "radio"
            : props.mode == "multiple"
              ? "checkbox"
              : "submit"
        }
        name={props.name}
        id={`opt-${props.value}`}
        value={props.value}
        data-key-equivalent={props.mnemonic}
        data-is-final={props.isFinal}
        checked={props.checked}
      ></input>
      <label className="option" htmlFor={`opt-${props.value}`}>
        <span className="mnemonic">
          <kbd title="press with keyboard">{props.mnemonic}</kbd>
        </span>
        <h2 className="option-title">{props.label}</h2>
        <p className="option-description">{props.description}</p>
      </label>
    </div>
  );
}

export function AnswerSubmitButton() {
  return (
    <button type="submit" className="option">
      <span className="mnemonic">
        <kbd title="press with keyboard">⏎ ENTER</kbd>
      </span>
      <h2 className="option-title">{label("SUBMIT_TITLE")}</h2>
      <p className="option-description">{label("SUBMIT_DESC")}</p>
    </button>
  );
}
