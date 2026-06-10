import { useCallback, useState } from "react";

export type AppStatus = "ready" | "loading" | "error";

export function useAppLoadState(initialStatus: AppStatus = "loading") {
  const [status, setStatus] = useState<AppStatus>(initialStatus);
  const [errorMessage, setErrorMessage] = useState("");

  const setLoading = useCallback(() => {
    setStatus("loading");
    setErrorMessage("");
  }, []);

  const setReady = useCallback(() => {
    setStatus("ready");
    setErrorMessage("");
  }, []);

  const setError = useCallback((error: unknown, prefix?: string) => {
    setStatus("error");
    const message = error instanceof Error ? error.message : String(error);
    setErrorMessage(prefix ? `${prefix}: ${message}` : message);
  }, []);

  return {
    errorMessage,
    setError,
    setLoading,
    setReady,
    setStatus,
    status,
  };
}
