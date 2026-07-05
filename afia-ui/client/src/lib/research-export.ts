import JSZip from "jszip";
import Papa from "papaparse";
import { logAction } from "@/lib/audit";
import {
  computeCooccurrenceLong,
  type AnalyzedDocSummary,
} from "@/lib/analytics-library";

const AFIA_VERSION = "1.0.0";

function exportDateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoTimestamp(): string {
  return new Date().toISOString();
}

function buildEntitiesCsv(docs: AnalyzedDocSummary[]): string {
  const rows = docs.flatMap((doc) =>
    doc.entities.map((entity) => ({
      document_id: doc.id,
      document_title: doc.filename,
      entity_text: entity.text,
      label: entity.label,
      confidence: entity.confidence,
      char_start: entity.start,
      char_end: entity.end,
    })),
  );
  return Papa.unparse(rows);
}

function buildDocumentsCsv(docs: AnalyzedDocSummary[]): string {
  const rows = docs.map((doc) => ({
    document_id: doc.id,
    title: doc.filename,
    page_count: doc.pageCount,
    word_count: doc.wordCount,
    analyzed_with: doc.modelUsed ?? "",
    analyzed_at: new Date(doc.analyzedAt).toISOString(),
  }));
  return Papa.unparse(rows);
}

function buildCooccurrenceCsv(docs: AnalyzedDocSummary[]): string {
  const rows = computeCooccurrenceLong(docs);
  return Papa.unparse(rows);
}

function buildReadme(docs: AnalyzedDocSummary[]): string {
  const generated = isoTimestamp();
  return `AFIA Research Export
====================

Generated: ${generated}
AFIA version: ${AFIA_VERSION}
Documents included: ${docs.length}
Entity mentions: ${docs.reduce((sum, doc) => sum + doc.entities.length, 0)}

This archive was generated locally in your browser from documents you
analyzed in AFIA. No PHI beyond your own documents is included.

Files
-----
entities.csv
  One row per entity mention (tidy/long format for R tidyverse and SPSS).
  Columns:
    document_id     Bridge document digest (stable identifier)
    document_title  Original filename / title
    entity_text     Detected entity surface form
    label           NER label type
    confidence      Model confidence score (0–1)
    char_start      Character offset start in source text
    char_end        Character offset end in source text

documents.csv
  One row per analyzed document.
  Columns:
    document_id     Bridge document digest
    title           Document title
    page_count      PDF page count
    word_count      Approximate word count from extracted text
    analyzed_with   OpenMed model id used for NER
    analyzed_at     ISO-8601 timestamp of upload/analysis

cooccurrence.csv
  Undirected entity pair co-occurrence counts (documents where both appear).
  Columns:
    entity_a        First entity text (alphabetically ordered pair)
    entity_b        Second entity text
    count           Number of documents containing both entities

analysis_starter.R
  Commented R starter script — load CSVs with readr and plot top entities.

Getting started in R
--------------------
  install.packages(c("readr", "dplyr", "ggplot2"))
  setwd("path/to/unzipped/export")
  source("analysis_starter.R")
`;
}

function buildAnalysisStarterR(): string {
  return `# AFIA research export — starter analysis script
# Requires: readr, dplyr, ggplot2
# Usage: set working directory to the unzipped export folder, then source this file.

library(readr)
library(dplyr)
library(ggplot2)

entities <- read_csv("entities.csv", show_col_types = FALSE)
documents <- read_csv("documents.csv", show_col_types = FALSE)
cooccurrence <- read_csv("cooccurrence.csv", show_col_types = FALSE)

# --- Entity frequency (mentions) ---
entity_freq <- entities %>%
  count(entity_text, label, name = "mentions") %>%
  arrange(desc(mentions))

print(head(entity_freq, 20))

# --- Top 15 entities bar chart ---
top15 <- entity_freq %>% slice_head(n = 15)

ggplot(top15, aes(x = reorder(entity_text, mentions), y = mentions, fill = label)) +
  geom_col() +
  coord_flip() +
  labs(
    title = "Top 15 entity mentions (AFIA export)",
    x = NULL,
    y = "Mentions"
  ) +
  theme_minimal(base_size = 12)

# --- Strongest co-occurring pairs ---
print(head(cooccurrence %>% arrange(desc(count)), 10))

# --- Documents summary ---
print(documents %>% select(title, page_count, word_count, analyzed_with))
`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportResearchZip(
  docs: AnalyzedDocSummary[],
): Promise<void> {
  if (docs.length === 0) {
    throw new Error("No analyzed documents to export");
  }

  const zip = new JSZip();
  zip.file("entities.csv", buildEntitiesCsv(docs));
  zip.file("documents.csv", buildDocumentsCsv(docs));
  zip.file("cooccurrence.csv", buildCooccurrenceCsv(docs));
  zip.file("README.txt", buildReadme(docs));
  zip.file("analysis_starter.R", buildAnalysisStarterR());

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, `afia-research-export-${exportDateStamp()}.zip`);
  logAction("export", "analysis");
}
