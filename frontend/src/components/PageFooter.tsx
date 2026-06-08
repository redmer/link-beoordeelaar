import { useContext } from "react";
import { ClientSessionContext } from "../hooks/ClientSessionContext.js";
import label from "../util/lang.js";

export function PageFooter(props: { diagnostics?: string; repo?: string }) {
  const repo = props.repo ?? `https://github.com/redmer/link-beoordeelaar`;
  const session = useContext(ClientSessionContext);
  return (
    <footer className="diagnostics">
      <div>
        <a target="_blank" href={props.repo}>
          {repo}
        </a>
      </div>
      <details className="">
        <summary>{label("DIAGNOSTICS_TITLE")}</summary>
        <code id="debug-diagnostics" className="overflow-x-scroll">
          <pre>{JSON.stringify(session, undefined, 2)}</pre>
        </code>
      </details>
    </footer>
  );
}
