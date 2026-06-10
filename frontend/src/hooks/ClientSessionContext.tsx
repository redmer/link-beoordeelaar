import type { PropsWithChildren } from "react";
import { createContext, useEffect, useState } from "react";
import { fetchClientSession } from "../stores/Client.js";
import type { ClientSession } from "../types.js";
import label from "../util/lang.js";

const DEFAULT_CLIENT_SESSION: ClientSession = {
  links: { next: "", help: label("HELP_URL") },
  questions: [],
  lang: "en",
};

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
    const params = new URLSearchParams(window.location.search);
    const sessionKey = params.get("session");

    if (!sessionKey) {
      setClientSession(DEFAULT_CLIENT_SESSION);
      return;
    }

    fetchClientSession(sessionKey)
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
