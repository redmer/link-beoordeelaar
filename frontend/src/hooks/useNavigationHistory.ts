import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSubject } from "../stores/Server.js";
import type { Answers, ClientSession, SubjectWithAnswers } from "../types.js";
import type { HistoryEntry } from "./useSubmissionManager.js";

interface UseNavigationHistoryOptions {
  clientSession: ClientSession;
  onRestore: (subject: SubjectWithAnswers, answers: Answers) => void;
  onRestoreFailure: (error: unknown) => void;
  onRestoreStart: () => void;
  onRestoreSuccess: () => void;
  syncPopup: (url: string) => void;
}

export function useNavigationHistory({
  clientSession,
  onRestore,
  onRestoreFailure,
  onRestoreStart,
  onRestoreSuccess,
  syncPopup,
}: UseNavigationHistoryOptions) {
  const [subjectHistory, setSubjectHistory] = useState<HistoryEntry[]>([]);

  const handlersRef = useRef({
    clientSession,
    onRestore,
    onRestoreFailure,
    onRestoreStart,
    onRestoreSuccess,
    syncPopup,
  });

  handlersRef.current = {
    clientSession,
    onRestore,
    onRestoreFailure,
    onRestoreStart,
    onRestoreSuccess,
    syncPopup,
  };

  const pushHistory = useCallback((entry: HistoryEntry) => {
    setSubjectHistory((previous) => [...previous, entry]);
  }, []);

  useEffect(() => {
    const navBack = () => {
      setSubjectHistory((previous) => {
        if (previous.length === 0) return previous;

        const last = previous[previous.length - 1];
        const handlers = handlersRef.current;
        handlers.onRestoreStart();

        fetchSubject({
          clientSession: handlers.clientSession,
          subject: { id: last.subjectId },
        })
          .then((subject) => {
            handlers.onRestore(subject, last.answers);
            handlers.onRestoreSuccess();
            handlers.syncPopup(subject.url);
          })
          .catch((error) => {
            handlers.onRestoreFailure(error);
          });

        return previous.slice(0, -1);
      });
    };

    window.addEventListener("popstate", navBack);
    return () => {
      window.removeEventListener("popstate", navBack);
    };
  }, []);

  return {
    pushHistory,
    subjectHistory,
  };
}
