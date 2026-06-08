import type { AnswerOption as AnswerOptionData } from "../types.js";

export function AnswerOption(props: { options: AnswerOptionData[] }) {
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
            name={answer.label}
            description={answer.description ?? ""}
            mnemonic={mnemonic(n)}
            isFinal={answer?.final ?? false}
          />
        );
      })}
    </div>
  );
}

export function AnswerOptionButton(props: {
  value: string;
  mnemonic: string;
  name: string;
  description: string;
  isFinal?: boolean;
}) {
  return (
    <button
      type="submit"
      class="option"
      id={`opt-${props.value}`}
      value={props.value}
      data-key-equivalent={props.mnemonic}
      data-is-final={props.isFinal}
    >
      <span class="mnemonic">
        <kbd title="press with keyboard">{props.mnemonic}</kbd>
      </span>
      <h2 class="option-title">{props.name}</h2>
      <p class="option-description">{props.description}</p>
    </button>
  );
}
