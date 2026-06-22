import type { AnswerOption as AnswerOptionData, Question } from "../types.js";
import label from "../util/lang.js";
import { Mnemonic } from "./Mnemonic.js";

export interface AnswerGroupProps {
  options: AnswerOptionData[];
  mode: Question["mode"];
  name: Question["id"];
  selectedAnswers: string[];
}

export function AnswerGroup(props: AnswerGroupProps) {
  const mnemonic = (index: number) => {
    return ["f", "j", "d", "k", "s", "l", "a", ";", "u", "i", "o", "p"][index];
  };

  const answers = props.options;
  return (
    <div className="option-list">
      {answers.map((answer, n) => {
        return (
          <AnswerOptionButton
            key={n}
            mode={props.mode}
            name={props.name}
            value={answer.value!}
            label={answer.label}
            description={answer.description ?? ""}
            mnemonic={mnemonic(n)}
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
  mode?: Question["mode"];
  checked?: boolean;
}

export function AnswerOptionButton(props: AnswerOption) {
  // Scope the option's DOM id with the question's `name` so the same option
  // `value` (e.g. "yes"/"no") used across different questions on the same page
  // does not produce duplicate ids. Duplicate ids would break the wrapping
  // <label htmlFor=...> targeting and could cause clicks/keyboard focus to
  // activate the wrong input.
  const optionId = `opt-${props.name ?? "anon"}-${props.value}`;
  return (
    <label className="option" htmlFor={optionId}>
      <Mnemonic keyboard={props.mnemonic} />
      <h2 className="option-title">
        <input
          type={
            props.mode == "one"
              ? "radio"
              : props.mode == "multiple"
                ? "checkbox"
                : "submit"
          }
          name={props.name}
          id={optionId}
          value={props.value}
          data-key-equivalent={props.mnemonic}
          defaultChecked={props.checked}
        ></input>
        <span className="option-title">{props.label}</span>
      </h2>
      <p className="option-description">{props.description}</p>
    </label>
  );
}

export function AnswerSubmitButton() {
  return (
    <button type="submit" className="option">
      <Mnemonic keyboard="Enter" />
      <h2 className="option-title">{label("SUBMIT_TITLE")}</h2>
      <p className="option-description">{label("SUBMIT_DESC")}</p>
    </button>
  );
}
