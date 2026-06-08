import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "preact/hooks";
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
        setCurrentSubject(resp.subject);
        setCurrentAnswers(resp.subject.answers ?? {});
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

  const start = useCallback(
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

  const chooseOption = useCallback(
    (event: SubmitEvent) => {
      event.preventDefault();
      if (!currentSubject) return;

      const submitter = event.submitter as HTMLButtonElement | null;
      if (!submitter) return;

      // The form element carries the question id (see page.tsx).
      const questionId = (event.target as HTMLFormElement).id;
      if (!questionId) return;

      const question = clientSession.questions.find((q) => q.id === questionId);
      if (!question) return;

      const answerOption = question.options.find(
        (o) => o.value === submitter.value,
      );

      // For "multiple" mode, accumulate values; for "one", replace.
      const nextAnswers: Answers = {
        ...currentAnswers,
        [questionId]:
          question.mode === "multiple"
            ? [...(currentAnswers[questionId] ?? []), submitter.value]
            : [submitter.value],
      };
      setCurrentAnswers(nextAnswers);

      const isFinal = answerOption?.final === true;
      const allAnswered = clientSession.questions.every(
        (q) => (nextAnswers[q.id]?.length ?? 0) > 0,
      );

      if (!isFinal && !allAnswered) return;

      // Subject is fully answered: save in background and advance to next.
      const savePromise = saveAnswer({
        answers: nextAnswers,
        subject: currentSubject,
        clientSession,
      }).catch(console.error);

      history.pushState(
        { subjectId: currentSubject.id, answers: nextAnswers },
        "",
      );
      setSubjectHistory((prev) => [
        ...prev,
        { subjectId: currentSubject.id, answers: nextAnswers },
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

  if (!clientSession.links.next) {
    return <QuestionnaireSessionlessPage />;
  }

  if (!started) {
    return (
      <QuestionnaireOpeningPage
        onSubmit={start}
        subjectsTotal={stats.total}
        subjectsUnjudged={stats.unjudged}
      />
    );
  }

  if (!currentSubject) return <></>;

  return (
    <QuestionnairePage
      onClick={start}
      onSubmit={chooseOption}
      questions={clientSession.questions}
      subject={currentSubject}
      unjudgedSubjects={stats.unjudged}
      totalSubjects={stats.total}
    />
  );
}
