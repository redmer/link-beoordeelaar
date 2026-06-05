import { HttpRequest } from "@azure/functions";

export async function readJsonBody<T>(request: HttpRequest): Promise<T> {
  const raw = await request.text();
  if (!raw) {
    throw new Error("Missing JSON body.");
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error("Invalid JSON body.");
  }
}

export function parseFilterParam(
  filterRaw: string | null,
): Record<string, unknown> | null {
  if (!filterRaw) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(filterRaw);
    const parsed = JSON.parse(decoded);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}
