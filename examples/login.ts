import { Ferrazio } from '../src/index.js';

// Human login: session token instead of an API key.
const fz = new Ferrazio({ baseUrl: process.env.FERRAZIO_BASE_URL });

const login = await fz.auth.login({ identifier: process.env.FZ_EMAIL!, password: process.env.FZ_PASSWORD! });

// Correct password with a second factor pending is a 200 carrying a short-lived challenge.
// A password that matches in more than one company asks which one first
// (`tenant_choice_required`), answered with `POST /v1/auth/login/tenant`.
if ('tenant_choice_required' in login) throw new Error(`choose a company: ${login.tenants.length} matched`);
// A login from a device, country or region the account never used gives no session:
// the person picks one of `channels`, types the full contact, and the code that
// arrives goes to `fz.auth.loginVerificationVerify`, which answers as a login again.
if ('verification_required' in login) throw new Error(`verify the login: ${login.channels.map((c) => c.masked).join(', ')}`);
const token =
  'token' in login
    ? login.token
    : (await fz.mfa.verifyMfa({ mfa_challenge_token: login.mfa_challenge_token, totp_code: process.env.FZ_TOTP_CODE! })).token;

fz.setToken(token);
console.log(await fz.auth.me());
await fz.auth.logout();
