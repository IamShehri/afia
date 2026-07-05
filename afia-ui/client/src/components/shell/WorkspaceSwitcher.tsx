import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useTeamWorkspace } from "@/contexts/TeamWorkspaceContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, FolderOpen, Loader2, Plus, Users } from "lucide-react";

export function WorkspaceSwitcher() {
  const [, setLocation] = useLocation();
  const {
    activeWorkspaceId,
    setActiveWorkspaceId,
    workspaces,
    activeWorkspace,
    loading,
    createWorkspace,
  } = useTeamWorkspace();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const label = activeWorkspace?.name ?? "Personal";

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      await createWorkspace(trimmed);
      setCreateOpen(false);
      setName("");
      toast.success(`Workspace "${trimmed}" created`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="max-w-[180px] gap-1.5 px-2.5 font-medium"
            aria-label="Switch workspace"
          >
            <FolderOpen className="size-3.5 shrink-0 opacity-70" />
            <span className="truncate">{loading ? "Loading…" : label}</span>
            <ChevronDown className="size-3.5 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={() => setActiveWorkspaceId(null)}
          >
            <Check
              className={cn(
                "size-4",
                activeWorkspaceId === null ? "opacity-100" : "opacity-0",
              )}
            />
            Personal
          </DropdownMenuItem>
          {workspaces.length > 0 && <DropdownMenuSeparator />}
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              className="cursor-pointer gap-2"
              onClick={() => setActiveWorkspaceId(workspace.id)}
            >
              <Check
                className={cn(
                  "size-4",
                  activeWorkspaceId === workspace.id ? "opacity-100" : "opacity-0",
                )}
              />
              <span className="truncate">{workspace.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
            Create workspace
          </DropdownMenuItem>
          {activeWorkspaceId && (
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => setLocation(`/workspace/${activeWorkspaceId}`)}
            >
              <Users className="size-4" />
              Manage workspace
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create workspace</DialogTitle>
          </DialogHeader>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team or project name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleCreate();
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleCreate()} disabled={creating}>
              {creating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
