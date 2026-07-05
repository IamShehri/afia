import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamWorkspace } from "@/contexts/TeamWorkspaceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, SectionLabel } from "@/components/primitives";
import {
  createWorkspaceInvite,
  leaveWorkspace,
  listPendingInvites,
  listWorkspaceMembers,
  revokeWorkspaceInvite,
  type InviteRole,
  type WorkspaceInviteRow,
  type WorkspaceMemberRow,
} from "@/lib/team-workspaces";
import { workspaceInviteUrl } from "@/lib/app-url";
import { Loader2, LogOut, Mail, UserPlus, Users, Copy } from "lucide-react";

export default function WorkspaceSettings() {
  const params = useParams<{ id: string }>();
  const workspaceId = params.id ?? "";
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { workspaces, refreshWorkspaces, setActiveWorkspaceId } =
    useTeamWorkspace();

  const workspace = workspaces.find((row) => row.id === workspaceId) ?? null;
  const isOwner = workspace?.myRole === "owner";

  const [members, setMembers] = useState<WorkspaceMemberRow[]>([]);
  const [invites, setInvites] = useState<WorkspaceInviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("editor");
  const [inviting, setInviting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [unsentInviteLink, setUnsentInviteLink] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId || !workspace) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    void Promise.all([
      listWorkspaceMembers(workspaceId),
      isOwner ? listPendingInvites(workspaceId) : Promise.resolve([]),
    ])
      .then(([memberRows, inviteRows]) => {
        if (!active) return;
        setMembers(memberRows);
        setInvites(inviteRows);
      })
      .catch((e) => {
        if (!active) return;
        toast.error(e instanceof Error ? e.message : "Failed to load workspace");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [workspaceId, workspace, isOwner]);

  const handleInvite = async () => {
    const email = inviteEmail.trim();
    if (!email || !isOwner) return;
    setInviting(true);
    try {
      const result = await createWorkspaceInvite(workspaceId, email, inviteRole);
      setInviteEmail("");
      setInvites(await listPendingInvites(workspaceId));
      if (result.email_sent) {
        setUnsentInviteLink(null);
        toast.success(`Invite sent to ${email}`);
      } else {
        const link = workspaceInviteUrl(result.invite.token);
        setUnsentInviteLink(link);
        toast.message(
          "Invite created — email couldn't be sent, copy the link instead",
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invite failed");
    } finally {
      setInviting(false);
    }
  };

  const handleCopyInviteLink = async () => {
    if (!unsentInviteLink) return;
    try {
      await navigator.clipboard.writeText(unsentInviteLink);
      toast.success("Invite link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleRevoke = async (inviteId: string) => {
    try {
      await revokeWorkspaceInvite(inviteId);
      setInvites((prev) => prev.filter((row) => row.id !== inviteId));
      toast.success("Invite revoked");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to revoke invite");
    }
  };

  const handleLeave = async () => {
    if (!workspace) return;
    setLeaving(true);
    try {
      await leaveWorkspace(workspaceId);
      await refreshWorkspaces();
      setActiveWorkspaceId(null);
      toast.success(`Left ${workspace.name}`);
      setLocation("/research");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to leave workspace");
    } finally {
      setLeaving(false);
    }
  };

  if (!workspace && !loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Workspace not found or you are not a member.
        </p>
        <Button variant="outline" onClick={() => setLocation("/research")}>
          Back to My Research
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-hairline px-6 py-4">
        <PageHeader
          title={workspace?.name ?? "Workspace"}
          subtitle="Members, invites, and team settings"
        />
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading workspace…
            </div>
          ) : (
            <>
              <Card>
                <CardContent className="space-y-3">
                  <SectionLabel>Members</SectionLabel>
                  {members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No members yet.
                    </p>
                  ) : (
                    <ul className="divide-y divide-hairline rounded-md border border-hairline">
                      {members.map((member) => (
                        <li
                          key={member.userId}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <Users className="size-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">
                              {member.email ??
                                (member.userId === user?.id
                                  ? "You"
                                  : member.userId.slice(0, 8))}
                            </span>
                          </div>
                          <span className="shrink-0 text-xs capitalize text-muted-foreground">
                            {member.role}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {isOwner && (
                <Card>
                  <CardContent className="space-y-4">
                    <SectionLabel>Invite by email</SectionLabel>
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                      <div className="space-y-1.5">
                        <Label htmlFor="invite-email">Email</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="colleague@example.com"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Role</Label>
                        <Select
                          value={inviteRole}
                          onValueChange={(value) =>
                            setInviteRole(value as InviteRole)
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={() => void handleInvite()}
                          disabled={inviting || !inviteEmail.trim()}
                        >
                          {inviting ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="size-4" />
                              Invite
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {unsentInviteLink && (
                      <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-sm">
                        <p className="font-medium text-foreground">
                          Invite created — email couldn&apos;t be sent, copy the
                          link instead
                        </p>
                        <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                          {unsentInviteLink}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => void handleCopyInviteLink()}
                        >
                          <Copy className="size-4" />
                          Copy invite link
                        </Button>
                      </div>
                    )}

                    {invites.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Pending invites
                        </p>
                        <ul className="divide-y divide-hairline rounded-md border border-hairline">
                          {invites.map((invite) => (
                            <li
                              key={invite.id}
                              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <Mail className="size-4 shrink-0 text-muted-foreground" />
                                <span className="truncate">{invite.email}</span>
                                <span className="text-xs capitalize text-muted-foreground">
                                  {invite.role}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => void handleRevoke(invite.id)}
                              >
                                Revoke
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => void handleLeave()}
                    disabled={leaving || workspace?.myRole === "owner"}
                  >
                    {leaving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <LogOut className="size-4" />
                    )}
                    Leave workspace
                  </Button>
                  {workspace?.myRole === "owner" && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Transfer ownership before leaving if you are the sole owner.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
