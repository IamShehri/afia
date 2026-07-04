/** @deprecated Use `@/lib/documents` — IndexedDB storage removed; Supabase is source of truth. */
export {
  type DocumentStatus,
  type StoredDocument,
  createDocument,
  getDocument,
  listDocuments,
  listDocuments as getAllDocuments,
  updateDocument,
  deleteDocument,
  saveDocument,
  updateDocumentStatus,
} from "@/lib/documents";
