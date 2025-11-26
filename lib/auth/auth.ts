import { ac, admin, user } from "@/components/auth/permissions";
import { db } from "@/drizzle/db";
import { member } from "@/drizzle/schema";
import { passkey } from "@better-auth/passkey";
import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { organization } from "better-auth/plugins/organization";
import { twoFactor } from "better-auth/plugins/two-factor";
import { and, desc, eq } from "drizzle-orm";
import { sendDeleteAccountVerificationEmail } from "../emails/delete-account-verification";
import { sendEmailVerificationEmail } from "../emails/email-verification";
import { sendOrganizationInviteEmail } from "../emails/organization-invite-email";
import { sendPasswordResetEmail } from "../emails/password-reset-email";
import { sendWelcomeEmail } from "../emails/welcome-email";
import { STRIPE_PLANS } from "./stripe";
import Stripe from "stripe";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover", // Latest API version as of Stripe SDK v20.0.0
});
export const auth = betterAuth({
  appName: "Master Auth",
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url, newEmail }) => {
        await sendEmailVerificationEmail({
          user: { ...user, email: newEmail },
          url,
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendDeleteAccountVerificationEmail({ user, url });
      },
    },
    additionalFields: {
      favoriteNumber: {
        type: "number",
        required: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ user, url });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerificationEmail({ user, url });
    },
  },
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      mapProfileToUser: () => {
        return {
          favoriteNumber: 0,
        };
      },
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      mapProfileToUser: () => {
        return {
          favoriteNumber: 0,
        };
      },
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => {
        return {
          favoriteNumber: Number(profile.public_repos) || 0,
        };
      },
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 mins
    },
  },
  plugins: [
    nextCookies(),
    twoFactor(),
    passkey(),
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
      },
    }),
    organization({
      sendInvitationEmail: async ({
        email,
        organization,
        inviter,
        invitation,
      }) => {
        await sendOrganizationInviteEmail({
          invitation,
          inviter: inviter.user,
          organization,
          email,
        });
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        authorizeReference: async ({ user, referenceId, action }) => {
          const memberItem = await db.query.member.findFirst({
            where: and(
              eq(member.organizationId, referenceId),
              eq(member.userId, user.id)
            ),
          });

          if (
            action === "upgrade-subscription" ||
            action === "cancel-subscription" ||
            action === "restore-subscription"
          ) {
            return memberItem?.role === "owner";
          }

          return memberItem != null;
        },
        enabled: true,
        plans: STRIPE_PLANS,
      },
    }),
  ],
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up")) {
        const user = ctx.context.newSession?.user ?? {
          name: ctx.body.name,
          email: ctx.body.email,
        };

        if (user != null) {
          await sendWelcomeEmail(user);
        }
      }
    }),
  },
  databaseHooks: {
    session: {
      create: {
        before: async (userSession) => {
          const membership = await db.query.member.findFirst({
            where: eq(member.userId, userSession.userId),
            orderBy: desc(member.createdAt),
            columns: { organizationId: true },
          });

          return {
            data: {
              ...userSession,
              activeOrganizationId: membership?.organizationId,
            },
          };
        },
      },
    },
  },
});
