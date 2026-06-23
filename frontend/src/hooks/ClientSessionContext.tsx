import type { PropsWithChildren } from "react";
import { createContext, useEffect, useState } from "react";
import { fetchClientSession } from "../stores/Client.js";
import type { ClientSession } from "../types.js";

/**
 * Tri-state client session.
 *
 * - `undefined`: provider is still resolving whether a session exists
 *   (effect has not yet run, or fetch is in flight).
 * - `null`: the page was opened without a `?session=` parameter, or
 *   the fetch failed: the user is sessionless.
 * - `ClientSession`: the session has been fetched and is ready to use.
 *
 * Consumers MUST distinguish all three states. Conflating `undefined` with
 * `null` causes the sessionless UI to flash on the first render before the
 * session fetch has had a chance to start.
 */
export const ClientSessionContext = createContext<
  ClientSession | null | undefined
>(undefined);

export function sessionKey(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("session");
}

export function ClientSessionProvider({ children }: PropsWithChildren) {
  // Synchronous shortcut: when there is no session key in the URL we can
  // commit `null` (sessionless) on the very first render, without ever
  // exposing the `undefined` (loading) state. This kills the false
  // "loading -> sessionless" double-render when the user opens the app
  // without a session.
  const [clientSession, setClientSession] = useState<
    ClientSession | null | undefined
  >(() => (sessionKey() ? undefined : null));

  useEffect(() => {
    let isCancelled = false;
    const key = sessionKey();

    if (!key) {
      setClientSession(null);
      return;
    }

    setClientSession(undefined);

    fetchClientSession(key)
      .then((session) => {
        if (isCancelled) return;
        setClientSession(session);
      })
      .catch((error) => {
        console.error("Failed to fetch client session", error);
        if (isCancelled) return;
        setClientSession(null);
      });

    return () => {
      isCancelled = true;
    };
  }, [window.location.search]);

  return (
    <ClientSessionContext.Provider value={clientSession}>
      {children}
    </ClientSessionContext.Provider>
  );
}
