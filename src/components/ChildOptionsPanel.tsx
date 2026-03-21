import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useKnowledgeItems, useCreateKnowledgeItem, useDeleteKnowledgeItem, type KnowledgeItemType } from "@/hooks/use-knowledge-items";
import { toast } from "sonner";

interface Props {
  parentId: string;
  parentName: string;
  type: KnowledgeItemType;
}

export default function ChildOptionsPanel({ parentId, parentName, type }: Props) {
  const { data: children, isLoading } = useKnowledgeItems(type, parentId);
  const create = useCreateKnowledgeItem(type);
  const remove = useDeleteKnowledgeItem(type);
  const [expanded, setExpanded] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await create.mutateAsync({
        name: newName.trim(),
        parent_id: parentId,
        metadata: newPrice ? { price: newPrice } : {},
      });
      setNewName("");
      setNewPrice("");
      toast.success("Option added");
    } catch (e: any) {
      toast.error(e.message || "Failed to add option");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success("Option removed");
    } catch (e: any) {
      toast.error(e.message || "Failed to remove");
    }
  };

  const count = children?.length ?? 0;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {count} option{count !== 1 ? "s" : ""} / variant{count !== 1 ? "s" : ""}
      </button>

      {expanded && (
        <div className="ml-4 mt-2 space-y-1.5 border-l-2 border-muted pl-3">
          {isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}
          {children?.map(child => {
            const meta = child.metadata as Record<string, any>;
            return (
              <div key={child.id} className="flex items-center gap-2 text-sm group">
                <span className="flex-1 truncate">{child.name}</span>
                {meta?.price && <span className="text-xs text-muted-foreground">{meta.price}</span>}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(child.id)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            );
          })}

          <div className="flex items-center gap-1.5 pt-1">
            <Input
              placeholder="Option name (e.g. 10 inch)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="h-7 text-xs flex-1"
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
            <Input
              placeholder="Price"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              className="h-7 text-xs w-20"
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleAdd} disabled={create.isPending}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
