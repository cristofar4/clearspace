/**
 * Booking request endpoint, used when NEXT_PUBLIC_BOOKING_MODE=live.
 *
 * It validates the request on the server with the same rules as the form,
 * then forwards a clean JSON payload to BOOKING_FORWARD_URL: your CRM,
 * scheduling tool, automation webhook or email service. Add
 * BOOKING_FORWARD_TOKEN to send an Authorization: Bearer header.
 *
 * Nothing here reserves a slot. Availability is confirmed by a person.
 */
import { emptyDraft, normaliseDraft, toPayload, validateAll, type BookingDraft } from "@/lib/booking";

export async function POST(request: Request) {
  const forwardUrl = process.env.BOOKING_FORWARD_URL;
  if (!forwardUrl) {
    return Response.json({ error: "Online booking is not connected yet." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request could not be read." }, { status: 400 });
  }

  // Keep only known fields, as strings
  const input = (body ?? {}) as Record<string, unknown>;
  const draft = normaliseDraft(
    Object.fromEntries(
      Object.keys(emptyDraft).map((key) => [key, typeof input[key] === "string" ? (input[key] as string).slice(0, 600) : ""]),
    ) as unknown as BookingDraft,
  );

  const problem = validateAll(draft);
  if (problem) {
    return Response.json({ error: "Some details need another look.", fields: problem.errors }, { status: 422 });
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.BOOKING_FORWARD_TOKEN) headers.Authorization = `Bearer ${process.env.BOOKING_FORWARD_TOKEN}`;

  try {
    const res = await fetch(forwardUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(toPayload(draft)),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      return Response.json({ error: "The booking service did not accept the request." }, { status: 502 });
    }
  } catch {
    return Response.json({ error: "The booking service could not be reached." }, { status: 502 });
  }

  return Response.json({ ok: true }, { status: 202 });
}
