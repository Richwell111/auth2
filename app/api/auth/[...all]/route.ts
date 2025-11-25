import { auth } from "@/lib/auth/auth";
import { findIp } from "@arcjet/ip";
import arcjet, {
  BotOptions,
  detectBot,
  EmailOptions,
  protectSignup,
  shield,
  slidingWindow,
  SlidingWindowRateLimitOptions,
} from "@arcjet/next";
import { toNextJsHandler } from "better-auth/next-js";

// -------------------------------------------------------
// 1. CREATE BASE ARCJET CLIENT
// -------------------------------------------------------
// This initializes Arcjet with your API key.
// `characteristics` tells Arcjet what to uniquely identify a user with.
// Here, we use either userId OR IP address.
// `rules: [shield()]` enables the security firewall-style protection.
//
const aj = arcjet({
  key: process.env.ARCJET_API_KEY!,
  characteristics: ["userIdOrIp"],
  rules: [shield({ mode: "LIVE" })],
});

// -------------------------------------------------------
// 2. BOT PROTECTION SETTINGS
// -------------------------------------------------------
// LIVE mode = block bots in production.
// allow: ["STRIPE_WEBHOOK"] means Stripe webhooks are allowed, not blocked.
//
const botSettings = {
  mode: "LIVE",
  allow: ["STRIPE_WEBHOOK"],
} satisfies BotOptions;

// -------------------------------------------------------
// 3. STRICT RATE LIMIT (used for signup)
// -------------------------------------------------------
// Allows only 10 requests every 10 mins.
// This protects signup from abuse.
//
const restrictiveRateLimitSettings = {
  mode: "LIVE",
  max: 10,
  interval: "10m",
} satisfies SlidingWindowRateLimitOptions<[]>;

// -------------------------------------------------------
// 4. NORMAL RATE LIMIT (used for login, etc.)
// -------------------------------------------------------
// Allows 60 requests per minute.
//
const laxRateLimitSettings = {
  mode: "LIVE",
  max: 60,
  interval: "1m",
} satisfies SlidingWindowRateLimitOptions<[]>;

// -------------------------------------------------------
// 5. EMAIL VALIDATION SETTINGS
// -------------------------------------------------------
// Blocks disposable, invalid, and domains without MX records.
//
const emailSettings = {
  mode: "LIVE",
  block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
} satisfies EmailOptions;

// Convert Better Auth routes to Next.js handlers
const authHandlers = toNextJsHandler(auth);

// Export GET handler (Better Auth)
export const { GET } = authHandlers;

// -------------------------------------------------------
// 6. MAIN POST HANDLER
// -------------------------------------------------------
export async function POST(request: Request) {
  // We clone the request because Better Auth requires a fresh body
  const clonedRequest = request.clone();

  // Run Arcjet checks: bot detection, rate limit, email check (depending on endpoint)
  const decision = await checkArcjet(request);

  // If Arcjet blocks the request
  if (decision.isDenied()) {
    // Handle RATE LIMIT blocks (429)
    if (decision.reason.isRateLimit()) {
      return new Response(null, { status: 429 });
    }

    // Handle EMAIL issues during signup
    else if (decision.reason.isEmail()) {
      let message: string;

      if (decision.reason.emailTypes.includes("INVALID")) {
        message = "Email address format is invalid.";
      } else if (decision.reason.emailTypes.includes("DISPOSABLE")) {
        message = "Disposable email addresses are not allowed.";
      } else if (decision.reason.emailTypes.includes("NO_MX_RECORDS")) {
        message = "Email domain is not valid.";
      } else {
        message = "Invalid email.";
      }

      return Response.json({ message }, { status: 400 });
    }

    // Handle bot / unknown denial
    else {
      return new Response(null, { status: 403 });
    }
  }

  // If ARCJET approves → pass request to Better Auth
  return authHandlers.POST(clonedRequest);
}

// -------------------------------------------------------
// 7. ARCJET CHECKER FUNCTION
// -------------------------------------------------------
async function checkArcjet(request: Request) {
  const body = (await request.json()) as unknown;

  // Get the session to identify the user
  const session = await auth.api.getSession({ headers: request.headers });

  // Use userId if logged in; otherwise, fallback to IP
  const userIdOrIp = (session?.user.id ?? findIp(request)) || "127.0.0.1";

  // -----------------------------
  // Signup Protection
  // -----------------------------
  if (request.url.endsWith("/auth/sign-up")) {
    // If email exists in body → apply FULL signup protection:
    // - email validation
    // - bot detection
    // - strict rate limit
    if (
      body &&
      typeof body === "object" &&
      "email" in body &&
      typeof body.email === "string"
    ) {
      return aj
        .withRule(
          protectSignup({
            email: emailSettings,
            bots: botSettings,
            rateLimit: restrictiveRateLimitSettings,
          })
        )
        .protect(request, { email: body.email, userIdOrIp });
    }

    // If no email in body → apply basic protections
    return aj
      .withRule(detectBot(botSettings))
      .withRule(slidingWindow(restrictiveRateLimitSettings))
      .protect(request, { userIdOrIp });
  }

  // -----------------------------
  // Regular endpoints (login, etc)
  // -----------------------------
  return aj
    .withRule(detectBot(botSettings))
    .withRule(slidingWindow(laxRateLimitSettings))
    .protect(request, { userIdOrIp });
}
