import { type PropsWithChildren } from "react";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { PageFooter } from "./PageFooter.js";
import { PageHeader } from "./PageHeader.js";

export interface PageFrameProps extends PropsWithChildren {
  diagnostics?: string;
  status?: "ready" | "error" | "loading";
  /**
   * `null` means "no scope declared", which suppresses the progress bar
   * and leaves only the "X remaining" label visible.
   */
  totalSubjects?: number | null;
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
      <PageHeader
        status={status}
        totalSubjects={totalSubjects}
        unjudgedSubjects={unjudgedSubjects}
      />
      <main className="app">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <PageFooter diagnostics={diagnostics} />
    </div>
  );
}
