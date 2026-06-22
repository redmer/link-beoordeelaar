import type { ClientSession } from "../types.js";
import label from "../util/lang.js";

export const DEFAULT: ClientSession = {
  links: { next: "", help: label("HELP_URL") },
  questions: [],
  lang: "en",
};

export async function fetchClientSession(
  sessionKey: string,
): Promise<ClientSession> {
  const url = atob(sessionKey);
  const response = await fetch(url, {
    redirect: "follow",
    cache: "no-store",
  });

  const parsed = (await response.json()) as ClientSession;

  return {
    questions: parsed.questions ?? DEFAULT.questions,
    links: {
      next: parsed.links.next ?? DEFAULT.links.next,
      help: parsed.links.help ?? DEFAULT.links.help,
    },
    lang: parsed.lang ?? DEFAULT.lang,
  };
}
