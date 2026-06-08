import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ClientSessionContext } from "../hooks/ClientSessionContext.js";
import {
  fetchDatasetStats,
  fetchNextSubject,
  fetchSubject,
  saveAnswer,
} from "../stores/Server.js";
import type { Answers, SubjectWithAnswers } from "../types.js";
import delay from "../util/delay.js";
import {
  QuestionnaireNoSubjectRemaining,
  QuestionnaireOpeningPage,
  QuestionnairePage,
  QuestionnaireSessionlessPage,
} from "../view/page.js";

const POPUP_WINDOW = "link-beoordelaar-popup";

interface HistoryEntry {
  subjectId: string;
  answers: Answers;
}

export function App() {
  const popupRef = useRef<Window | null>(null);
  const clientSession = useContext(ClientSessionContext);

  const [stats, setStats] = useState({ total: 0, unjudged: 0 });
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
    if (!clientSession.links.next) return;

    fetchNextSubject(clientSession)
      .then((resp) => {
        setCurrentSubject(resp.subject ?? null);
        setCurrentAnswers(resp.subject?.answers ?? {});
      })
      .catch((err) => console.error("Failed to fetch first subject:", err));

    refreshStats().catch((err) => console.error("Failed to fetch stats:", err));
  }, [clientSession.links.next, refreshStats]);

  const findMnemonic = useCallback(async (event: KeyboardEvent) => {
    event.preventDefault();
    const target = document.querySelector(
      `button[data-key-equivalent="${event.key}"]`,
    ) as HTMLButtonElement | null;
    if (!target) return;
    target.classList.add("option-active");
    target.click();
    await delay(300);
    target.classList.remove("option-active");
  }, []);

  useEffect(() => {
    const navBack = () => {
      setSubjectHistory((previous) => {
        if (previous.length === 0) return previous;
        const last = previous[previous.length - 1];
        fetchSubject({ clientSession, subject: { id: last.subjectId } })
          .then((fresh) => {
            setCurrentSubject(fresh);
            setCurrentAnswers(last.answers);
            try {
              if (popupRef.current) popupRef.current.location = fresh.url;
            } catch {}
          })
          .catch(console.error);
        return previous.slice(0, -1);
      });
    };

    document.addEventListener("keyup", findMnemonic);
    window.addEventListener("popstate", navBack);

    return () => {
      document.removeEventListener("keyup", findMnemonic);
      window.removeEventListener("popstate", navBack);
    };
  }, [findMnemonic]);

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
          try {
            if (popupRef.current) popupRef.current.location = resp.subject.url;
          } catch {}
        })
        .catch(console.error);

      savePromise.finally(() => {
        refreshStats().catch(console.error);
      });
    },
    [clientSession, currentAnswers, currentSubject, refreshStats],
  );

  if (clientSession.links.next == "") {
    return <QuestionnaireSessionlessPage />;
  }

  if (stats.unjudged < 1)
    return <QuestionnaireNoSubjectRemaining totalSubjects={stats.total} />;

  if (!started && stats.unjudged >= 1) {
    return (
      <QuestionnaireOpeningPage
        onSubmit={onStart}
        subjectsTotal={stats.total}
        subjectsUnjudged={stats.unjudged}
      />
    );
  }

  if (started && !!currentSubject)
    return (
      <QuestionnairePage
        onClick={onStart}
        onSubmit={onSubmit}
        questions={clientSession.questions}
        answers={currentAnswers}
        subject={currentSubject}
        unjudgedSubjects={stats.unjudged}
        totalSubjects={stats.total}
      />
    );
}
