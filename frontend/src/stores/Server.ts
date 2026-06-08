import type {
  Answers,
  ClientSession,
  DatasetStatsResp,
  Subject,
  SubjectNextResp,
  SubjectPatchReq,
  SubjectWithAnswers,
} from "../types.js";

/** Get new subject to judge. */
export async function fetchNextSubject(
  clientSession: ClientSession,
): Promise<SubjectNextResp> {
  const resp = await fetch(clientSession.links.next);
  return await resp.json();
}

export async function fetchDatasetStats(
  clientSession: ClientSession,
): Promise<DatasetStatsResp> {
  const url = new URL(clientSession.links.next);
  const datasetBase = clientSession.links.next.split("/next-subject", 1);
  const resp = await fetch(`${datasetBase}/stats${url.search}`);
  return await resp.json();
}

export async function fetchSubject({
  clientSession,
  subject,
}: {
  clientSession: ClientSession;
  subject: Pick<Subject, "id">;
}): Promise<SubjectWithAnswers> {
  const datasetBase = clientSession.links.next.split("/next-subject", 1);
  const resp = await fetch(`${datasetBase}/subjects/${subject.id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!resp.ok) {
    const msg = await resp.text();
    console.error(`Failed to get subject: ${msg}`);
    throw new Error(msg);
  }

  return resp.json() as Promise<SubjectWithAnswers>;
}

/** Save answers to Server. */
export async function saveAnswer({
  answers,
  subject,
  clientSession,
}: {
  answers: Answers;
  subject: Subject;
  clientSession: ClientSession;
}): Promise<void> {
  const datasetBase = clientSession.links.next.split("/next-subject", 1);
  const body = JSON.stringify({
    answers,
  } as SubjectPatchReq);

  const resp = await fetch(`${datasetBase}/subjects/${subject.id}/answers`, {
    method: "PATCH",
    body,
    headers: { "Content-Type": "application/json" },
  });

  if (!resp.ok) {
    const msg = await resp.text();
    console.error(`Failed to save answer: ${msg}`);
    throw new Error(msg);
  }
}
