# Private safeguarding reports

The static `/safeguarding-report` page submits to the Cloudflare Pages Function
at `/api/safeguarding-report`. The Function validates a Turnstile token and
sends a plain-text message through Cloudflare Email Service. It does not write
reports to the site's database or log their contents. The destination address
is a server-side secret and must never appear in source code, public build
variables, HTML, or client-side JavaScript.

## Cloudflare setup

1. In Cloudflare Email Service, onboard the sending domain. Add the private
   destination address under Email Routing > Destination Addresses and complete
   the verification email. Choose a sender on the onboarded domain, such as
   `reports@zenlineage.org`.
2. Create a Cloudflare API token with Email Sending permission for this account.
   Keep it separate from the Pages deployment token.
3. Create a managed Turnstile widget restricted to `zenlineage.org`.
4. In the `zenlineage` Pages project, add these **encrypted secrets** for
   production, never plain-text Wrangler `vars`:
   - `CF_EMAIL_API_TOKEN`
   - `CF_EMAIL_ACCOUNT_ID`
   - `SAFEGUARDING_RECIPIENT`
   - `SAFEGUARDING_SENDER`
   - `TURNSTILE_SECRET_KEY`
5. Set the **public build variable** `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to the
   widget's sitekey. Deploy with the form disabled, submit a real test report,
   and confirm delivery to the private inbox. Then set
   `NEXT_PUBLIC_SAFEGUARDING_FORM_ENABLED=1` and redeploy. Only then does the
   practice page link to the form.

Do not use a public GitHub issue for sensitive reports. The Function returns
generic errors and never echoes the destination address. If mail delivery or
Turnstile fails, it returns an error instead of reporting success.
