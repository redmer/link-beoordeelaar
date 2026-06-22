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

  // Track the live history outside React so the popstate handler can read
  // it synchronously without depending on stale closures or interleaved
  // StrictMode double-invocations of the state updater.
  const historyRef = useRef<HistoryEntry[]>([]);

  const pushHistory = useCallback((entry: HistoryEntry) => {
    historyRef.current = [...historyRef.current, entry];
    setSubjectHistory(historyRef.current);
  }, []);

  useEffect(() => {
    const navBack = () => {
      const previous = historyRef.current;
      if (previous.length === 0) return;

      const last = previous[previous.length - 1];
      historyRef.current = previous.slice(0, -1);
      setSubjectHistory(historyRef.current);

      const handlers = handlersRef.current;
      handlers.onRestoreStart();

      // Push a fresh state entry so any "forward" history entries (which
      // point at subjects we have already navigated away from) are
      // truncated by the browser. Without this, pressing Forward — or any
      // subsequent popstate — would re-fire navBack against stale state
      // and confuse the app.
      history.pushState(
        { subjectId: last.subjectId, answers: last.answers, restored: true },
        "",
      );

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
