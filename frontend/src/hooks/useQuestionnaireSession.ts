import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchDatasetStats, fetchNextSubject } from "../stores/Server.js";
import type {
  Answers,
  ClientSession,
  DatasetStatsResp,
  SubjectWithAnswers,
} from "../types.js";

interface UseQuestionnaireSessionOptions {
  clientSession: ClientSession;
  setError: (error: unknown, prefix?: string) => void;
  setLoading: () => void;
  setReady: () => void;
}

interface StatsState {
  total: number;
  unjudged: number;
}

function toStatsState(stats: DatasetStatsResp): StatsState {
  return { total: stats.total, unjudged: stats.unjudged };
}

export function useQuestionnaireSession({
  clientSession,
  setError,
  setLoading,
  setReady,
}: UseQuestionnaireSessionOptions) {
  const [stats, setStats] = useState<StatsState>({ total: 0, unjudged: 0 });
  const [currentSubject, setCurrentSubject] =
    useState<SubjectWithAnswers | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Answers>({});
  const [started, setStarted] = useState(false);

  const hasSession = useMemo(
    () => Boolean(clientSession.links.next && clientSession.links.next !== ""),
    [clientSession.links.next],
  );

  const refreshStats = useCallback(async () => {
    const statsResp = await fetchDatasetStats(clientSession);
    setStats(toStatsState(statsResp));
  }, [clientSession]);

  const setCurrent = useCallback((subject: SubjectWithAnswers | null) => {
    setCurrentSubject(subject);
    setCurrentAnswers(subject?.answers ?? {});
  }, []);

  const restoreCurrent = useCallback(
    (subject: SubjectWithAnswers, answers: Answers) => {
      setCurrentSubject(subject);
      setCurrentAnswers(answers);
    },
    [],
  );

  const advanceToNext = useCallback(async () => {
    const response = await fetchNextSubject(clientSession);
    setCurrent(response.subject ?? null);
    return response.subject ?? null;
  }, [clientSession, setCurrent]);

  useEffect(() => {
    if (!hasSession) {
      setStats({ total: 0, unjudged: 0 });
      setCurrent(null);
      setStarted(false);
      setReady();
      return;
    }

    setLoading();

    Promise.all([
      fetchNextSubject(clientSession),
      fetchDatasetStats(clientSession),
    ])
      .then(([subjectResp, statsResp]) => {
        setCurrent(subjectResp.subject ?? null);
        setStats(toStatsState(statsResp));
        setReady();
      })
      .catch((error) => {
        setError(error, "Failed to load session data");
      });
  }, [clientSession, hasSession, setCurrent, setError, setLoading, setReady]);

  return {
    advanceToNext,
    currentAnswers,
    currentSubject,
    hasSession,
    refreshStats,
    restoreCurrent,
    setCurrent,
    setStarted,
    setStats,
    started,
    stats,
  };
}
