import {
  DiscordIcon,
  GitHubIcon,
  GoogleIcon,
} from "@/components/auth/o-auth-icons";
import { ComponentProps, ElementType } from "react";

export const SUPPORTED_OAUTH_PROVIDERS = [
  "github",
  "discord",
  "google",
] as const;

export type SupportedOAuthProvider = (typeof SUPPORTED_OAUTH_PROVIDERS)[number];

export const SUPPORTED_OAUTH_PROVIDER_DETAILS: Record<
  SupportedOAuthProvider,
  { name: string; Icon: ElementType<ComponentProps<"svg">> }
> = {
  github: {
    name: "GitHub",
    Icon: GitHubIcon,
  },
  discord: {
    name: "Discord",
    Icon: DiscordIcon,
  },
  google: {
    name: "Google",
    Icon: GoogleIcon,
  },
};
