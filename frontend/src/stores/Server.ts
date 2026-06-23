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
): Promise<SubjectNextResp | null> {
  const resp = await fetch(clientSession.links.next);
  try {
    return await resp.json();
  } catch (err) {
    return null;
  }
}

export async function fetchDatasetStats(
  clientSession: ClientSession,
  options: { includeTotal?: boolean } = {},
): Promise<DatasetStatsResp> {
  const { includeTotal = true } = options;
  const url = new URL(clientSession.links.next);
  // Drop the `scope` query param when the caller only needs `unjudged`.
  // The backend treats a missing `scope` as "don't compute the total" and
  // returns `total: null`, which is materially cheaper than running the
  // (often expensive) scope COUNT query on every submission. Callers that
  // already cached `total` from the initial load reuse it client-side.
  if (!includeTotal) {
    url.searchParams.delete("scope");
  }
  const datasetBase = clientSession.links.next.split("/next-subject", 1)[0];
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
  const datasetBase = clientSession.links.next.split("/next-subject", 1)[0];
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
  const datasetBase = clientSession.links.next.split("/next-subject", 1)[0];
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
