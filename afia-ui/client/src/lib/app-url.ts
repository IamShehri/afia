import { APP_PUBLIC_URL } from "@/const";

/**
 * App base URL for invite links, social share, etc.
 * Browser: current origin (localhost in dev, production domain when deployed).
 * Non-browser: APP_PUBLIC_URL fallback only.
 */
export function getAppPublicUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return APP_PUBLIC_URL;
}

export function workspaceInviteUrl(token: string): string {
  return `${getAppPublicUrl().replace(/\/$/, "")}/invite/${token}`;
}
