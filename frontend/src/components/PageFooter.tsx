import { useContext } from "react";
import { ClientSessionContext } from "../hooks/ClientSessionContext.js";
import label from "../util/lang.js";

export function PageFooter(props: { diagnostics?: string }) {
  const session = useContext(ClientSessionContext);
  const diagnostics = !!props.diagnostics
    ? props.diagnostics
    : JSON.stringify(session, undefined, 2);
  return (
    <footer className="diagnostics">
      <details className="">
        <summary>{label("DIAGNOSTICS_TITLE")}</summary>
        <code id="debug-diagnostics" className="overflow-x-scroll">
          <pre>{diagnostics}</pre>
        </code>
      </details>
    </footer>
  );
}
