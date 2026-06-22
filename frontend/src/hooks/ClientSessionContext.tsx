import type { PropsWithChildren } from "react";
import { createContext, useEffect, useState } from "react";
import {
  DEFAULT as DEFAULT_CLIENT_SESSION,
  fetchClientSession,
} from "../stores/Client.js";
import type { ClientSession } from "../types.js";

export const ClientSessionContext = createContext<ClientSession>(
  DEFAULT_CLIENT_SESSION,
);

export function sessionKey(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("session");
}

export function ClientSessionProvider({ children }: PropsWithChildren) {
  const [clientSession, setClientSession] = useState<ClientSession>(
    DEFAULT_CLIENT_SESSION,
  );

  useEffect(() => {
    let isCancelled = false;
    const key = sessionKey();

    if (!key) {
      setClientSession(DEFAULT_CLIENT_SESSION);
      return;
    }

    fetchClientSession(key)
      .then((session) => {
        if (isCancelled) return;
        setClientSession(session);
      })
      .catch((error) => {
        console.error("Failed to fetch client session", error);
        if (isCancelled) return;
        setClientSession(DEFAULT_CLIENT_SESSION);
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
