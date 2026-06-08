import { type PropsWithChildren } from "react";
import {
  ClientSessionProvider,
  sessionKey,
} from "../hooks/ClientSessionContext.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { PageFooter } from "./PageFooter.js";
import { PageHeader } from "./PageHeader.js";

export function PageFrame(props: PropsWithChildren) {
  return (
    <div id="link-beoordelaar">
      <ClientSessionProvider sessionKey={sessionKey() ?? undefined}>
        <PageHeader />
        <main className="app">
          <ErrorBoundary>{props.children}</ErrorBoundary>
        </main>
        <PageFooter />
      </ClientSessionProvider>
    </div>
  );
}
