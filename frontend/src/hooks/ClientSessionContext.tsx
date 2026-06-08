import { createContext } from "preact";
import type { PropsWithChildren } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
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

export interface Props extends PropsWithChildren {
  sessionKey?: string;
}

export function ClientSessionProvider(props: Props) {
  const [clientSession, setClientSession] = useState<ClientSession>(
    DEFAULT_CLIENT_SESSION,
  );

  useEffect(() => {
    let isCancelled = false;

    if (!props.sessionKey) {
      setClientSession(DEFAULT_CLIENT_SESSION);
      return;
    }

    fetchClientSession(props.sessionKey)
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
  }, [props.sessionKey]);

  return (
    <ClientSessionContext.Provider value={clientSession}>
      {props.children}
    </ClientSessionContext.Provider>
  );
}
