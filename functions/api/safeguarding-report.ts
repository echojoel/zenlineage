interface Env {
  TURNSTILE_SECRET_KEY: string;
  CF_EMAIL_API_TOKEN: string;
  CF_EMAIL_ACCOUNT_ID: string;
  SAFEGUARDING_RECIPIENT: string;
  SAFEGUARDING_SENDER: string;
}

interface Report {
  organization?: unknown;
  replyEmail?: unknown;
  message?: unknown;
  turnstileToken?: unknown;
  website?: unknown;
}

const MAX_BODY_BYTES = 12_000;

function json(status: number, body: object): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function readLimitedBody(request: Request): Promise<string | null> {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new TextDecoder().decode(bytes);
  } finally {
    reader.releaseLock();
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const origin = new URL(request.url).origin;
  if (request.headers.get("Origin") !== origin) {
    return json(403, { error: "Request origin could not be verified." });
  }
  if (!request.headers.get("Content-Type")?.startsWith("application/json")) {
    return json(415, { error: "Unsupported request format." });
  }
  if (
    !env.TURNSTILE_SECRET_KEY ||
    !env.CF_EMAIL_API_TOKEN ||
    !env.CF_EMAIL_ACCOUNT_ID ||
    !env.SAFEGUARDING_RECIPIENT ||
    !env.SAFEGUARDING_SENDER
  ) {
    return json(503, { error: "Private reporting is temporarily unavailable." });
  }

  const raw = await readLimitedBody(request);
  if (!raw) return json(413, { error: "The report is too long." });
  let report: Report;
  try {
    report = JSON.parse(raw) as Report;
  } catch {
    return json(400, { error: "Please check the report and try again." });
  }

  const organization = typeof report.organization === "string" ? report.organization.trim() : "";
  const replyEmail = typeof report.replyEmail === "string" ? report.replyEmail.trim() : "";
  const message = typeof report.message === "string" ? report.message.trim() : "";
  const token = typeof report.turnstileToken === "string" ? report.turnstileToken : "";
  if (report.website) return json(200, { ok: true }); // Honeypot: discard bot submission.
  if (
    organization.length > 200 ||
    replyEmail.length > 254 ||
    (replyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyEmail)) ||
    message.length < 20 ||
    message.length > 8000 ||
    !token ||
    token.length > 2048
  ) {
    return json(400, { error: "Please check the report and try again." });
  }

  let verified = false;
  try {
    const challenge = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
    });
    const result = (await challenge.json()) as { success?: boolean; hostname?: string };
    verified = challenge.ok && result.success === true && result.hostname === new URL(request.url).hostname;
  } catch {
    return json(503, { error: "Verification is temporarily unavailable. Please try again later." });
  }
  if (!verified) return json(400, { error: "Please complete the verification and try again." });

  const emailText = [
    "Private safeguarding report submitted via Zen Lineage.",
    "",
    `Organization: ${organization || "Not supplied"}`,
    `Reply address: ${replyEmail || "Not supplied"}`,
    "",
    message,
  ].join("\n");
  try {
    const delivery = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(env.CF_EMAIL_ACCOUNT_ID)}/email/sending/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.CF_EMAIL_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: env.SAFEGUARDING_RECIPIENT,
          from: env.SAFEGUARDING_SENDER,
          subject: "Private safeguarding report — Zen Lineage",
          text: emailText,
        }),
      }
    );
    const result = (await delivery.json()) as {
      success?: boolean;
      result?: { delivered?: string[]; queued?: string[]; permanent_bounces?: string[] };
    };
    const accepted = [...(result.result?.delivered ?? []), ...(result.result?.queued ?? [])].includes(
      env.SAFEGUARDING_RECIPIENT
    );
    if (!delivery.ok || result.success !== true || !accepted || result.result?.permanent_bounces?.length) {
      return json(503, { error: "The report could not be sent. Please try again later." });
    }
  } catch {
    return json(503, { error: "The report could not be sent. Please try again later." });
  }
  return json(200, { ok: true });
}
