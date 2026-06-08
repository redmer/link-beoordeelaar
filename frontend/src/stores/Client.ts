import type { ClientSession } from "../types.js";
import label from "../util/lang.js";

export async function fetchClientSession(
  sessionKey: string,
): Promise<ClientSession> {
  const url = atob(sessionKey);
  const response = await fetch(url, {
    redirect: "follow",
    cache: "force-cache",
  });

  const parsed = (await response.json()) as ClientSession;

  return {
    questions: parsed.questions ?? [],
    links: {
      next: parsed.links.next,
      help: parsed.links.help ?? label("HELP_URL"),
    },
  };
}
