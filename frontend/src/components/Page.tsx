import { type PropsWithChildren } from "react";
import {
  ClientSessionProvider,
  sessionKey,
} from "../hooks/ClientSessionContext.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { PageFooter } from "./PageFooter.js";
import { PageHeader } from "./PageHeader.js";

export interface PageFrameProps extends PropsWithChildren {
  diagnostics?: string;
  status?: "ready" | "error" | "loading";
  totalSubjects?: number;
  unjudgedSubjects?: number;
}

export function Page({
  status,
  diagnostics,
  totalSubjects,
  unjudgedSubjects,
  children,
}: PageFrameProps) {
  return (
    <div id="link-beoordelaar">
      <ClientSessionProvider sessionKey={sessionKey() ?? undefined}>
        <PageHeader
          status={status}
          totalSubjects={totalSubjects}
          unjudgedSubjects={unjudgedSubjects}
        />
        <main className="app">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <PageFooter diagnostics={diagnostics} />
      </ClientSessionProvider>
    </div>
  );
}
