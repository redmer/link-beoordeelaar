import { useContext } from "preact/hooks";
import { ClientSessionContext } from "../hooks/ClientSessionContext.js";
import label from "../util/lang.js";

export function PageHeader(props: { help?: string }) {
  const clientSession = useContext(ClientSessionContext);
  const help = props.help ?? clientSession.links.help ?? label("HELP_URL");

  return (
    <header class="colophon">
      <div>
        <a target="_blank" href={help}>
          {label("HELP_TITLE")}
        </a>
      </div>
    </header>
  );
}
