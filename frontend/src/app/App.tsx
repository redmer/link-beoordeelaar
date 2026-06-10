import { useCallback, useContext } from "react";
import { Page } from "../components/Page.js";
import {
  QuestionnaireNoSubjectRemaining,
  QuestionnaireOpeningPage,
  QuestionnairePage,
  QuestionnaireSessionlessPage,
} from "../components/QuestionnairePage.js";
import { ClientSessionContext } from "../hooks/ClientSessionContext.js";
import { useAppLoadState } from "../hooks/useAppLoadState.js";
import { useNavigationHistory } from "../hooks/useNavigationHistory.js";
import { usePopupWindowManager } from "../hooks/usePopupWindowManager.js";
import { useQuestionnaireSession } from "../hooks/useQuestionnaireSession.js";
import { useSubmissionManager } from "../hooks/useSubmissionManager.js";

const POPUP_WINDOW = "link-beoordelaar-popup";

export function App() {
  const clientSession = useContext(ClientSessionContext);
  const { errorMessage, setError, setLoading, setReady, status } =
    useAppLoadState();

  const { isBlocked, navigate, open, syncOrOpen } = usePopupWindowManager({
    name: POPUP_WINDOW,
    features: "toolbar=no,menubar=no,left=1,top=1",
  });

  const {
    currentAnswers,
    currentSubject,
    hasSession,
    refreshStats,
    restoreCurrent,
    setCurrent,
    setStarted,
    started,
    stats,
  } = useQuestionnaireSession({
    clientSession,
    setError,
    setLoading,
    setReady,
  });

  const { pushHistory } = useNavigationHistory({
    clientSession,
    onRestore: restoreCurrent,
    onRestoreFailure: (error) => {
      setError(error, "Failed to restore previous subject");
      console.error(error);
    },
    onRestoreStart: setLoading,
    onRestoreSuccess: setReady,
    syncPopup: (url) => {
      navigate(url);
    },
  });

  const { onSubmit, saveError } = useSubmissionManager({
    clientSession,
    currentSubject,
    onHistoryPush: pushHistory,
    onSubjectAdvance: (subject) => {
      setCurrent(subject);
      if (subject) navigate(subject.url);
    },
    onSubmitFailure: (error) => {
      setError(error, "Failed to load next subject");
      console.error(error);
    },
    onSubmitStart: setLoading,
    onSubmitSuccess: setReady,
    refreshStats,
  });

  const onStart = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!currentSubject) return;
      open(currentSubject.url);
      setStarted(true);
    },
    [currentSubject, open, setStarted],
  );

  const onReopenPopup = useCallback(() => {
    if (!currentSubject) return;
    syncOrOpen(currentSubject.url);
  }, [currentSubject, syncOrOpen]);

  const diagnostics = [
    errorMessage,
    saveError,
    isBlocked ? "Popup window was blocked by the browser." : "",
  ]
    .filter((value) => value !== "")
    .join("\n");

  if (!hasSession) {
    console.debug(`!hasSession`);
    return (
      <Page
        status={status}
        totalSubjects={stats.total}
        unjudgedSubjects={stats.unjudged}
        diagnostics={diagnostics}
      >
        <QuestionnaireSessionlessPage />
      </Page>
    );
  }

  if (stats.unjudged < 1) {
    console.debug(`stats.unjudged < 1`);
    return (
      <Page
        status={status}
        totalSubjects={stats.total}
        unjudgedSubjects={stats.unjudged}
        diagnostics={diagnostics}
      >
        <QuestionnaireNoSubjectRemaining />
      </Page>
    );
  }

  if (started && !!currentSubject) {
    console.debug(`if (started && !!currentSubject)`);
    return (
      <Page
        status={status}
        totalSubjects={stats.total}
        unjudgedSubjects={stats.unjudged}
        diagnostics={diagnostics}
      >
        <QuestionnairePage
          onClick={onReopenPopup}
          onSubmit={onSubmit}
          questions={clientSession.questions}
          answers={currentAnswers}
          subject={currentSubject}
        />
      </Page>
    );
  }

  return (
    <Page
      status={status}
      totalSubjects={stats.total}
      unjudgedSubjects={stats.unjudged}
      diagnostics={diagnostics}
    >
      <QuestionnaireOpeningPage
        onSubmit={onStart}
        subjectsTotal={stats.total}
        subjectsUnjudged={stats.unjudged}
      />
    </Page>
  );
}
