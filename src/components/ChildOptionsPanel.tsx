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

/* ── Single Option Group (e.g. "Size", "Base", "Toppings") ── */
function OptionGroup({ group, type }: { group: { id: string; name: string }; type: KnowledgeItemType }) {
  const { data: values, isLoading } = useKnowledgeItems(type, group.id);
  const create = useCreateKnowledgeItem(type);
  const remove = useDeleteKnowledgeItem(type);
  const removeGroup = useDeleteKnowledgeItem(type);
  const [expanded, setExpanded] = useState(true);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await create.mutateAsync({
        name: newName.trim(),
        parent_id: group.id,
        metadata: newPrice ? { price: newPrice } : {},
      });
      setNewName("");
      setNewPrice("");
    } catch (e: any) {
      toast.error(e.message || "Failed to add option");
    }
  };

  const handleDeleteValue = async (id: string) => {
    try {
      await remove.mutateAsync(id);
    } catch (e: any) {
      toast.error(e.message || "Failed to remove");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      // soft-delete all children first
      if (values) {
        for (const v of values) {
          await remove.mutateAsync(v.id);
        }
      }
      await removeGroup.mutateAsync(group.id);
      toast.success(`"${group.name}" group removed`);
    } catch (e: any) {
      toast.error(e.message || "Failed to remove group");
    }
  };

  const count = values?.length ?? 0;

  return (
    <div className="border border-muted rounded-lg p-2.5 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-semibold text-foreground hover:text-primary transition-colors"
        >
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          {group.name}
        </button>
        <span className="text-xs text-muted-foreground">({count})</span>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-60 hover:opacity-100"
          onClick={handleDeleteGroup}
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>

      {expanded && (
        <div className="ml-3 space-y-1 border-l-2 border-muted pl-2.5">
          {isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}
          {values?.map(val => {
            const meta = val.metadata as Record<string, any>;
            return (
              <div key={val.id} className="flex items-center gap-2 text-sm group">
                <span className="flex-1 truncate">{val.name}</span>
                {meta?.price && <span className="text-xs text-muted-foreground">{meta.price}</span>}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteValue(val.id)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            );
          })}

          <div className="flex items-center gap-1.5 pt-1">
            <Input
              placeholder={`Add ${group.name.toLowerCase()} option…`}
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

/* ── Main Panel: lists option groups under a product ── */
export default function ChildOptionsPanel({ parentId, parentName, type }: Props) {
  const { data: groups, isLoading } = useKnowledgeItems(type, parentId);
  const createGroup = useCreateKnowledgeItem(type);
  const [expanded, setExpanded] = useState(false);
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      await createGroup.mutateAsync({
        name: newGroupName.trim(),
        parent_id: parentId,
        metadata: { is_option_group: true },
      });
      setNewGroupName("");
      setAddingGroup(false);
      toast.success(`"${newGroupName.trim()}" group added`);
    } catch (e: any) {
      toast.error(e.message || "Failed to add group");
    }
  };

  const count = groups?.length ?? 0;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {count} option group{count !== 1 ? "s" : ""}
      </button>

      {expanded && (
        <div className="ml-2 mt-2 space-y-2">
          {isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}

          {groups?.map(group => (
            <OptionGroup key={group.id} group={group} type={type} />
          ))}

          {addingGroup ? (
            <div className="flex items-center gap-1.5">
              <Input
                placeholder="Group name (e.g. Size, Base, Toppings)"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                className="h-8 text-xs flex-1"
                onKeyDown={e => {
                  if (e.key === "Enter") handleAddGroup();
                  if (e.key === "Escape") { setAddingGroup(false); setNewGroupName(""); }
                }}
                autoFocus
              />
              <Button size="sm" className="h-8 text-xs" onClick={handleAddGroup} disabled={createGroup.isPending}>
                Add
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setAddingGroup(false); setNewGroupName(""); }}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setAddingGroup(true)}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Option Group
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
