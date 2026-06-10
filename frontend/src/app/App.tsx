import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Page } from "../components/Page.js";
import {
  QuestionnaireNoSubjectRemaining,
  QuestionnaireOpeningPage,
  QuestionnairePage,
  QuestionnaireSessionlessPage,
} from "../components/QuestionnairePage.js";
import { ClientSessionContext } from "../hooks/ClientSessionContext.js";
import {
  fetchDatasetStats,
  fetchNextSubject,
  fetchSubject,
  saveAnswer,
} from "../stores/Server.js";
import type { Answers, SubjectWithAnswers } from "../types.js";

const POPUP_WINDOW = "link-beoordelaar-popup";

interface HistoryEntry {
  subjectId: string;
  answers: Answers;
}

export function App() {
  const popupRef = useRef<Window | null>(null);
  const clientSession = useContext(ClientSessionContext);

  const [stats, setStats] = useState({ total: 0, unjudged: 0 });
  const [status, setStatus] = useState<"ready" | "loading" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [subjectHistory, setSubjectHistory] = useState<HistoryEntry[]>([]);
  const [currentSubject, setCurrentSubject] =
    useState<SubjectWithAnswers | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Answers>({});
  const [started, setStarted] = useState(false);

  const refreshStats = useCallback(async () => {
    const stats = await fetchDatasetStats(clientSession);
    setStats({ total: stats.total, unjudged: stats.unjudged });
  }, [clientSession]);

  // Fetch the first subject when a real session is available.
  useEffect(() => {
    const hasSession =
      clientSession.links.next && clientSession.links.next !== "";

    if (!hasSession) {
      // Sessionless mode - just set ready state
      setStatus("ready");
      setErrorMessage("");
      setStats({ total: 0, unjudged: 0 });
      return;
    }

    // We have a valid session - fetch data
    setStatus("loading");
    setErrorMessage("");

    Promise.all([
      fetchNextSubject(clientSession),
      fetchDatasetStats(clientSession),
    ])
      .then(([subjectResp, statsResp]) => {
        setCurrentSubject(subjectResp.subject ?? null);
        setCurrentAnswers(subjectResp.subject?.answers ?? {});
        setStats({ total: statsResp.total, unjudged: statsResp.unjudged });
        setStatus("ready");
        setErrorMessage("");
      })
      .catch((err) => {
        setStatus("error");
        const errorMsg = `Failed to load session data: ${err?.message || String(err)}`;
        setErrorMessage(errorMsg);
        console.error(errorMsg, err);
      });
  }, [clientSession.links.next]);

  useEffect(() => {
    const navBack = () => {
      setSubjectHistory((previous) => {
        if (previous.length === 0) return previous;
        const last = previous[previous.length - 1];
        setStatus("loading");
        fetchSubject({ clientSession, subject: { id: last.subjectId } })
          .then((fresh) => {
            setCurrentSubject(fresh);
            setCurrentAnswers(last.answers);
            setStatus("ready");
            try {
              if (popupRef.current) popupRef.current.location = fresh.url;
            } catch {}
          })
          .catch((err) => {
            setStatus("error");
            console.error(err);
          });
        return previous.slice(0, -1);
      });
    };

    window.addEventListener("popstate", navBack);

    return () => {
      window.removeEventListener("popstate", navBack);
    };
  }, [clientSession]);

  const onStart = useCallback(
    (event: Event) => {
      event.preventDefault();
      if (!currentSubject) return;
      popupRef.current = window.open(
        currentSubject.url,
        POPUP_WINDOW,
        "toolbar=no,menubar=no,left=1,top=1",
      );
      setStarted(true);
    },
    [currentSubject],
  );

  const onSubmit = useCallback(
    (event: SubmitEvent) => {
      console.log(`Will submit for subject...`);
      event.preventDefault();
      if (!currentSubject) return;

      // The form contains all answers
      const form = document.querySelector("form");
      if (!form) return;

      const data = new FormData(form);
      const answers: Answers = {};
      for (const [k, v] of data.entries()) {
        if (k in answers) answers[k].push(v.toString());
        else answers[k] = [v.toString()];
      }

      // Subject is fully answered: save in background and advance to next.
      const savePromise = saveAnswer({
        answers,
        subject: currentSubject,
        clientSession,
      }).catch(console.error);

      history.pushState({ subjectId: currentSubject.id, answers }, "");
      setSubjectHistory((prev) => [
        ...prev,
        { subjectId: currentSubject.id, answers },
      ]);

      fetchNextSubject(clientSession)
        .then((resp) => {
          setCurrentSubject(resp.subject);
          setCurrentAnswers(resp.subject.answers ?? {});
          setStatus("ready");
          try {
            if (popupRef.current) popupRef.current.location = resp.subject.url;
          } catch {}
        })
        .catch((err) => {
          setStatus("error");
          console.error(err);
        });

      savePromise.finally(() => {
        refreshStats().catch(console.error);
      });
    },
    [clientSession, currentAnswers, currentSubject, refreshStats],
  );

  if (clientSession.links.next == "") {
    console.debug(`clientSession.links.next == ""`);
    return (
      <Page
        status={status}
        totalSubjects={stats.total}
        unjudgedSubjects={stats.unjudged}
        diagnostics={errorMessage}
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
        diagnostics={errorMessage}
      >
        <QuestionnaireNoSubjectRemaining totalSubjects={stats.total} />
      </Page>
    );
  }

  if (!started && stats.unjudged >= 1) {
    console.debug(`if (!started && stats.unjudged >= 1) {`);
    return (
      <Page
        status={status}
        totalSubjects={stats.total}
        unjudgedSubjects={stats.unjudged}
        diagnostics={errorMessage}
      >
        <QuestionnaireOpeningPage
          onSubmit={onStart}
          subjectsTotal={stats.total}
          subjectsUnjudged={stats.unjudged}
        />
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
        diagnostics={errorMessage}
      >
        <QuestionnairePage
          onClick={onStart}
          onSubmit={onSubmit}
          questions={clientSession.questions}
          answers={currentAnswers}
          subject={currentSubject}
          unjudgedSubjects={stats.unjudged}
          totalSubjects={stats.total}
        />
      </Page>
    );
  }
}
