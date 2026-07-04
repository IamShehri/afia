const NEW_TAB = "noopener,noreferrer";

export function searchPubMed(query: string): void {
  const url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`;
  window.open(url, "_blank", NEW_TAB);
}

export function searchScholar(query: string): void {
  const url = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`;
  window.open(url, "_blank", NEW_TAB);
}
