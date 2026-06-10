import { useEffect, useRef } from "react";
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
  const formRef = useRef<HTMLFormElement | null>(null);

  const mnemonic = (index: number) => {
    return ["1", "2", "3", "4", "5", "6", "7", "8", "9"][index];
  };

  const getFieldsets = () => {
    if (!formRef.current) return [];
    return Array.from(
      formRef.current.querySelectorAll<HTMLFieldSetElement>("fieldset"),
    );
  };

  const focusFieldsetAt = (index: number) => {
    const fieldsets = getFieldsets();
    const fieldset = fieldsets[index];
    if (!fieldset) return;
    fieldset.focus();
    const firstControl = fieldset.querySelector<
      HTMLInputElement | HTMLButtonElement
    >("input, button");
    firstControl?.focus();
  };

  useEffect(() => {
    focusFieldsetAt(0);
  }, [props.questions, props.answers]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    const fieldsets = getFieldsets();
    if (fieldsets.length === 0) return;

    const targetElement = event.target as HTMLElement | null;
    const activeFieldset = targetElement?.closest(
      "fieldset",
    ) as HTMLFieldSetElement | null;
    const activeIndex = Math.max(
      0,
      fieldsets.indexOf(activeFieldset ?? fieldsets[0]),
    );

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusFieldsetAt(Math.min(activeIndex + 1, fieldsets.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusFieldsetAt(Math.max(activeIndex - 1, 0));
      return;
    }

    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (!activeFieldset) return;

    const key = event.key.toLowerCase();
    const mnemonicTarget = activeFieldset.querySelector<
      HTMLInputElement | HTMLButtonElement
    >(`[data-key-equivalent=\"${key}\"]`);
    if (!mnemonicTarget) return;

    event.preventDefault();
    mnemonicTarget.click();
    mnemonicTarget.focus();

    if (
      mnemonicTarget instanceof HTMLInputElement &&
      mnemonicTarget.type === "radio"
    ) {
      focusFieldsetAt(Math.min(activeIndex + 1, fieldsets.length - 1));
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={props.onSubmit}
      onKeyDown={onKeyDown}
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
      <fieldset tabIndex={0}>
        <legend>
          <Mnemonic keyboard="0" />
          <div className="legend-text">
            <div className="legend-label">{label("SUBMIT_SECTION")}</div>
            <div className="legend-explanation">{label("CHOOSE_REQUIRED")}</div>
          </div>
        </legend>
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
  mnemonic: string;
}

export function QuestionStep(props: SingleProps) {
  return (
    <fieldset tabIndex={0}>
      <legend>
        <Mnemonic keyboard={props.mnemonic} />
        <div className="legend-text">
          <div className="legend-label">{props.question.label}</div>
          <div className="legend-explanation">
            {props.question.mode == "one"
              ? label("CHOOSE_ONE")
              : label("CHOOSE_MULTIPLE")}
          </div>
        </div>
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
