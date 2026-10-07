import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequestPost } from "../functions/api/safeguarding-report";

const env = {
  TURNSTILE_SECRET_KEY: "test-turnstile-secret",
  CF_EMAIL_API_TOKEN: "test-email-token",
  CF_EMAIL_ACCOUNT_ID: "test-account",
  SAFEGUARDING_RECIPIENT: "private@example.test",
  SAFEGUARDING_SENDER: "reports@example.test",
};

function request(overrides: Record<string, unknown> = {}, origin = "https://zenlineage.org") {
  return new Request(`${origin}/api/safeguarding-report`, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({
      organization: "Example group",
      replyEmail: "visitor@example.test",
      message: "Please review this specific concern and contact me for evidence.",
      turnstileToken: "test-token",
      ...overrides,
    }),
  });
}

afterEach(() => vi.restoreAllMocks());

describe("private safeguarding report", () => {
  it("rejects cross-origin requests before contacting services", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    const response = await onRequestPost({
      request: new Request("https://zenlineage.org/api/safeguarding-report", {
        method: "POST",
        headers: { Origin: "https://other.example", "Content-Type": "application/json" },
        body: "{}",
      }),
      env,
    });
    expect(response.status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not send mail when Turnstile rejects the token", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false, hostname: "zenlineage.org" }), { status: 200 })
    );
    const response = await onRequestPost({ request: request(), env });
    expect(response.status).toBe(400);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("sends to the server-side recipient without returning it to the browser", async () => {
    const fetch = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, hostname: "zenlineage.org" }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          success: true,
          result: { delivered: [env.SAFEGUARDING_RECIPIENT], queued: [], permanent_bounces: [] },
        }), { status: 200 })
      );
    const response = await onRequestPost({ request: request(), env });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('{"ok":true}');
    expect(fetch).toHaveBeenCalledTimes(2);
    const mailBody = JSON.parse(String(fetch.mock.calls[1][1]?.body));
    expect(mailBody.to).toBe(env.SAFEGUARDING_RECIPIENT);
    expect(mailBody.text).toContain("Example group");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("reports a delivery failure without claiming the message was sent", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true, hostname: "zenlineage.org" }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: false, result: null }), { status: 500 })
      );
    const response = await onRequestPost({ request: request(), env });
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain(env.SAFEGUARDING_RECIPIENT);
  });
});
