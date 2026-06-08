import { useContext } from "preact/hooks";
import { ClientSessionContext } from "../hooks/ClientSessionContext.js";
import label from "../util/lang.js";

export function PageFooter(props: { diagnostics?: string; repo?: string }) {
  const repo = props.repo ?? `redmer/link-beoordeelaar`;
  const session = useContext(ClientSessionContext);
  return (
    <footer class="diagnostics">
      <div>
        <a target="_blank" href="https://github.com/{props.repo}">
          {repo}
        </a>
      </div>
      <details class="">
        <summary>{label("DIAGNOSTICS_TITLE")}</summary>
        <code id="debug-diagnostics" class="overflow-x-scroll">
          <pre>{JSON.stringify(session, undefined, 2)}</pre>
        </code>
      </details>
    </footer>
  );
}
