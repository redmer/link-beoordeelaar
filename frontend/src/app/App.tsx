import { useCallback, useContext, useState } from "react";
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

  // Monotonic counter used as the questionnaire form's remount key. Bumped
  // on every event that should clear uncontrolled answer inputs (submission
  // and back-navigation), so the remount happens regardless of whether the
  // resulting subject id or answers happen to match the previous render.
  const [formKey, setFormKey] = useState(0);
  const bumpFormKey = useCallback(() => {
    setFormKey((n) => n + 1);
  }, []);

  const { isBlocked, isOpen, navigate, open, syncOrOpen } =
    usePopupWindowManager({
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
    onRestore: (subject, answers) => {
      restoreCurrent(subject, answers);
      // Force the questionnaire form to remount when navigating back, so
      // uncontrolled inputs are recreated rather than reused with stale
      // checked state from a previous submission of the same subject.
      bumpFormKey();
    },
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
    bumpFormKey,
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
    (event: React.SubmitEvent<HTMLFormElement>) => {
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

  const popupClosed = started && !!currentSubject && !isOpen;
  const effectiveStatus = popupClosed ? "error" : status;

  const diagnostics = [
    errorMessage,
    saveError,
    isBlocked ? "Popup window was blocked by the browser." : "",
    popupClosed ? "Popup window is not open." : "",
  ]
    .filter((value) => value !== "")
    .join("\n");

  if (!hasSession) {
    console.debug(`!hasSession`);
    return (
      <Page
        status={effectiveStatus}
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
        status={effectiveStatus}
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
        status={effectiveStatus}
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
          formKey={formKey}
        />
      </Page>
    );
  }

  return (
    <Page
      status={effectiveStatus}
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
