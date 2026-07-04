import { supabase } from "@/lib/supabase";

export type AuditAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "deidentify"
  | "export";

export type AuditResourceType = "document" | "analysis" | "profile";

export function logAction(
  action: AuditAction,
  resourceType: AuditResourceType,
  resourceId?: string,
): void {
  void (async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("audit_log").insert({
        user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId ?? null,
      });

      if (error) {
        console.warn("[audit]", error.message);
      }
    } catch (err) {
      console.warn("[audit]", err);
    }
  })();
}
