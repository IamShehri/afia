import {
  FileText,
  FileSpreadsheet,
  Presentation,
  FileCode,
  type LucideIcon,
} from "lucide-react";

export interface UploadFormat {
  ext: string;
  label: string;
  icon: LucideIcon;
  accept: string[];
}

export const UPLOAD_FORMATS: UploadFormat[] = [
  {
    ext: "pdf",
    label: "PDF",
    icon: FileText,
    accept: ["application/pdf", ".pdf"],
  },
  {
    ext: "docx",
    label: "Word",
    icon: FileText,
    accept: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".docx",
    ],
  },
  {
    ext: "pptx",
    label: "PowerPoint",
    icon: Presentation,
    accept: [
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ".pptx",
    ],
  },
  {
    ext: "xlsx",
    label: "Excel",
    icon: FileSpreadsheet,
    accept: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".xlsx",
    ],
  },
  {
    ext: "txt",
    label: "Text",
    icon: FileText,
    accept: ["text/plain", ".txt"],
  },
  {
    ext: "html",
    label: "HTML",
    icon: FileCode,
    accept: ["text/html", ".html", ".htm"],
  },
];

export const UPLOAD_ACCEPT = UPLOAD_FORMATS.flatMap((format) => format.accept).join(
  ",",
);

const EXTENSIONS = new Set(
  UPLOAD_FORMATS.flatMap((format) => [
    format.ext,
    ...format.accept.filter((token) => token.startsWith(".")).map((token) => token.slice(1)),
  ]),
);

export function uploadExtension(filename: string): string | null {
  const dot = filename.lastIndexOf(".");
  if (dot < 0) return null;
  const ext = filename.slice(dot + 1).toLowerCase();
  return EXTENSIONS.has(ext) ? ext : null;
}

export function isSupportedUploadFile(file: File): boolean {
  return uploadExtension(file.name) !== null;
}

export function uploadFormatForFile(file: File): UploadFormat | null {
  const ext = uploadExtension(file.name);
  if (!ext) return null;
  return UPLOAD_FORMATS.find((format) => format.ext === ext) ?? null;
}

export function uploadFormatForFilename(filename: string): UploadFormat | null {
  const ext = uploadExtension(filename);
  if (!ext) return null;
  return UPLOAD_FORMATS.find((format) => format.ext === ext) ?? null;
}
