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
  return (
    <label className="option" htmlFor={`opt-${props.value}`}>
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
          id={`opt-${props.value}`}
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
