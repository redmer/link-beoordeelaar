import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchDatasetStats, fetchNextSubject } from "../stores/Server.js";
import type {
  Answers,
  ClientSession,
  DatasetStatsResp,
  SubjectWithAnswers,
} from "../types.js";

interface UseQuestionnaireSessionOptions {
  clientSession: ClientSession | null | undefined;
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
  // `stats.total === -1` is a sentinel meaning "not yet loaded". Callers in
  // App.tsx must gate on `stats.total >= 0` before rendering anything that
  // relies on real numbers, otherwise pages such as NoSubjectRemaining
  // ("unjudged === 0") would flash with bogus data.
  const [stats, setStats] = useState<StatsState>({ total: -1, unjudged: -1 });

  const [currentSubject, setCurrentSubject] = useState<
    SubjectWithAnswers | null | undefined
  >(undefined);
  const [currentAnswers, setCurrentAnswers] = useState<Answers>({});
  const [started, setStarted] = useState(false);

  const hasSession = useMemo(
    () => Boolean(clientSession?.links.next),
    [clientSession?.links.next],
  );

  const refreshStats = useCallback(async () => {
    if (!clientSession) return;
    const statsResp = await fetchDatasetStats(clientSession);
    setStats(toStatsState(statsResp));
  }, [clientSession]);

  const setCurrent = useCallback(
    (subject: SubjectWithAnswers | null | undefined) => {
      setCurrentSubject(subject);
      setCurrentAnswers(subject?.answers ?? {});
    },
    [],
  );

  const restoreCurrent = useCallback(
    (subject: SubjectWithAnswers, answers: Answers) => {
      setCurrentSubject(subject);
      setCurrentAnswers(answers);
    },
    [],
  );

  const advanceToNext = useCallback(async () => {
    if (!clientSession) return null;
    const response = await fetchNextSubject(clientSession);
    setCurrent(response?.subject ?? null);
    return response?.subject ?? null;
  }, [clientSession, setCurrent]);

  useEffect(() => {
    if (!hasSession || !clientSession) {
      // Reset to the "not loaded" sentinels whenever the session goes away
      // (sessionless, fetch failed, or session being re-resolved). This
      // prevents stale stats/subject from a previous session leaking into
      // the next render.
      setStats({ total: -1, unjudged: -1 });
      setCurrent(undefined);
      setStarted(false);
      setReady();
      return;
    }

    setLoading();
    setCurrentSubject(undefined);
    setStats({ total: -1, unjudged: -1 });

    Promise.all([
      fetchNextSubject(clientSession),
      fetchDatasetStats(clientSession),
    ])
      .then(([subjectResp, statsResp]) => {
        setCurrent(subjectResp?.subject ?? null);
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
