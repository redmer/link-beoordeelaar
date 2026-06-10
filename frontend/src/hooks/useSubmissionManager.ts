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
      if (!currentSubject) return;

      onSubmitStart();

      const answers = toAnswers(event.currentTarget);
      onHistoryPush({ subjectId: currentSubject.id, answers });
      history.pushState({ subjectId: currentSubject.id, answers }, "");

      fetchNextSubject(clientSession)
        .then((response) => {
          onSubjectAdvance(response.subject ?? null);
          onSubmitSuccess();
        })
        .catch((error) => {
          onSubmitFailure(error);
        });

      saveAnswer({ answers, subject: currentSubject, clientSession })
        .then(() => {
          setSaveError("");
        })
        .catch((error) => {
          setSaveError(
            `Failed to save answers for ${currentSubject.id}: ${error instanceof Error ? error.message : String(error)}`,
          );
          console.error(error);
        })
        .finally(() => {
          refreshStats().catch((error) => {
            console.error(error);
          });
        });
    },
    [
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
