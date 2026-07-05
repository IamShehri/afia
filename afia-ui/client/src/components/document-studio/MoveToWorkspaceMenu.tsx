import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTeamWorkspace } from "@/contexts/TeamWorkspaceContext";
import {
  updateDocument,
  type DocumentLookupOptions,
} from "@/lib/documents";
import { FolderInput } from "lucide-react";

interface MoveToWorkspaceMenuProps {
  bridgeDocumentId: string;
  currentWorkspaceId: string | null;
  lookup: DocumentLookupOptions;
  onMoved: (workspaceId: string | null) => void;
}

export function MoveToWorkspaceMenu({
  bridgeDocumentId,
  currentWorkspaceId,
  lookup,
  onMoved,
}: MoveToWorkspaceMenuProps) {
  const { workspaces, canEditInActiveWorkspace } = useTeamWorkspace();

  if (!canEditInActiveWorkspace) {
    return null;
  }

  const handleMove = async (targetWorkspaceId: string | null) => {
    if (targetWorkspaceId === currentWorkspaceId) return;
    try {
      await updateDocument(
        bridgeDocumentId,
        { workspaceId: targetWorkspaceId },
        lookup,
      );
      onMoved(targetWorkspaceId);
      toast.success(
        targetWorkspaceId ? "Document moved to workspace" : "Moved to Personal",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Move failed");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderInput className="size-4" />
          Move to workspace
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Move document</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => void handleMove(null)}
        >
          Personal
        </DropdownMenuItem>
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            className="cursor-pointer"
            onClick={() => void handleMove(workspace.id)}
          >
            {workspace.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
