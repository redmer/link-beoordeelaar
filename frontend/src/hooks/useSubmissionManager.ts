import { useCallback, useState } from "react";
import { fetchNextSubject, saveAnswer } from "../stores/Server.js";
import type { Answers, ClientSession, SubjectWithAnswers } from "../types.js";

export interface HistoryEntry {
  subjectId: string;
  answers: Answers;
}

interface UseSubmissionManagerOptions {
  clientSession: ClientSession;
  currentSubject: SubjectWithAnswers | null;
  onHistoryPush: (entry: HistoryEntry) => void;
  onSubjectAdvance: (subject: SubjectWithAnswers | null) => void;
  onSubmitFailure: (error: unknown) => void;
  onSubmitStart: () => void;
  onSubmitSuccess: () => void;
  refreshStats: () => Promise<void>;
  /**
   * Called synchronously at the start of every submission so the caller can
   * force the answer-form subtree to remount. This makes uncontrolled inputs
   * structurally safe even if the backend re-serves the same subject.
   */
  bumpFormKey: () => void;
}

function toAnswers(form: HTMLFormElement): Answers {
  const data = new FormData(form);
  const answers: Answers = {};

  for (const [key, value] of data.entries()) {
    if (key in answers) answers[key].push(value.toString());
    else answers[key] = [value.toString()];
  }

  return answers;
}

export function useSubmissionManager({
  bumpFormKey,
  clientSession,
  currentSubject,
  onHistoryPush,
  onSubjectAdvance,
  onSubmitFailure,
  onSubmitStart,
  onSubmitSuccess,
  refreshStats,
}: UseSubmissionManagerOptions) {
  const [saveError, setSaveError] = useState("");

  const onSubmit = useCallback(
    (event: React.SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      bumpFormKey();
      if (!currentSubject) return;

      onSubmitStart();

      const submittedSubject = currentSubject;
      const answers = toAnswers(event.currentTarget);
      onHistoryPush({ subjectId: submittedSubject.id, answers });
      history.pushState({ subjectId: submittedSubject.id, answers }, "");

      // IMPORTANT: save the current answer BEFORE asking the backend for the
      // next subject. If these run in parallel the backend may still consider
      // the current subject "unjudged" and return it again as the next one.
      // When that happens, neither `subject.id` nor `answers` change, so the
      // form's remount-key in QuestionnairePage stays identical and the
      // uncontrolled radio inputs in the DOM keep their previous selections.
      saveAnswer({ answers, subject: submittedSubject, clientSession })
        .then(() => {
          setSaveError("");
        })
        .catch((error) => {
          setSaveError(
            `Failed to save answers for ${submittedSubject.id}: ${error instanceof Error ? error.message : String(error)}`,
          );
          console.error(error);
        })
        .then(() => fetchNextSubject(clientSession))
        .then((response) => {
          onSubjectAdvance(response.subject ?? null);
          onSubmitSuccess();
        })
        .catch((error) => {
          onSubmitFailure(error);
        })
        .finally(() => {
          refreshStats().catch((error) => {
            console.error(error);
          });
        });
    },
    [
      bumpFormKey,
      clientSession,
      currentSubject,
      onHistoryPush,
      onSubmitFailure,
      onSubmitStart,
      onSubmitSuccess,
      onSubjectAdvance,
      refreshStats,
    ],
  );

  return {
    onSubmit,
    saveError,
  };
}
