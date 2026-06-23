import { useContext, type PropsWithChildren } from "react";
import { ClientSessionContext } from "../hooks/ClientSessionContext.js";
import label from "../util/lang.js";
import { Progress } from "./Progress.js";

export interface PageHeaderProps extends PropsWithChildren {
  totalSubjects?: number | null;
  unjudgedSubjects?: number;
  help?: string;
  status?: "ready" | "loading" | "error";
}

/** The PageHeader provides */
export function PageHeader({
  totalSubjects,
  unjudgedSubjects,
  help,
  status,
}: PageHeaderProps) {
  const clientSession = useContext(ClientSessionContext);
  const helpLink = help ?? clientSession?.links.help ?? label("HELP_URL");

  return (
    <header className="colophon status-bar" data-status={status ?? "ready"}>
      <div>
        {
          <Progress
            totalSubjects={totalSubjects}
            unjudgedSubjects={unjudgedSubjects}
          />
        }
      </div>
      <div>
        <a target="_blank" href={helpLink} rel="noopener noreferrer">
          {label("HELP_TITLE")}
        </a>
      </div>
    </header>
  );
}
