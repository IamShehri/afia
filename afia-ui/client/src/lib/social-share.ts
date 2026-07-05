const POPUP_FEATURES =
  "width=600,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no";

export function shareOnLinkedIn(url: string): void {
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(shareUrl, "afia-share-linkedin", POPUP_FEATURES);
}

export function shareOnX(text: string, url: string): void {
  const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(shareUrl, "afia-share-x", POPUP_FEATURES);
}

/** Opens the user's mail client with counts-only summary text (no PHI). */
export function shareViaEmail(
  text: string,
  url: string,
  subject = "AFIA research summary",
): void {
  const body = `${text}\n\n${url}`;
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Studio Home — product-only share copy (no user/clinical data). */
export const HOME_SHARE_TEXT =
  "Exploring AFIA — the privacy-first AI workspace for allied health 🩺";

/**
 * Document Studio share copy — aggregate counts only.
 *
 * PRIVACY BOUNDARY: this text must never include document title, extracted
 * text, or entity values. Clinical content must not leave the app via social
 * share intents; counts and product messaging only.
 */
export function buildDocumentShareText(
  entityCount: number,
  pageCount: number,
): string {
  return `Analyzed a clinical document with AFIA — ${entityCount} entities detected across ${pageCount} pages, fully local & private 🔐`;
}

/**
 * Analytics Lab / Entity Graph share copy — library counts only.
 *
 * PRIVACY BOUNDARY: no entity names, no document titles.
 */
export function buildAnalyticsShareText(
  documentCount: number,
  totalEntities: number,
): string {
  return `Explored ${documentCount} documents · ${totalEntities.toLocaleString()} entities with AFIA Analytics 🔬`;
}
