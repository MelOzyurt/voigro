import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useKnowledgeItems, useCreateKnowledgeItem, useUpdateKnowledgeItem, useDeleteKnowledgeItem } from "@/hooks/use-knowledge-items";
import KnowledgeItemDialog, { type KnowledgeField } from "@/components/KnowledgeItemDialog";
import { toast } from "sonner";

const fields: KnowledgeField[] = [
  { key: "name", label: "Service Name", placeholder: "e.g. Haircut" },
  { key: "description", label: "Description", type: "textarea", placeholder: "Describe this service…" },
];
const metaFields: KnowledgeField[] = [
  { key: "duration", label: "Duration", placeholder: "e.g. 30 min" },
  { key: "price", label: "Price", placeholder: "e.g. £25" },
];

export default function Services() {
  const { data: services, isLoading } = useKnowledgeItems("service");
  const create = useCreateKnowledgeItem("service");
  const update = useUpdateKnowledgeItem("service");
  const remove = useDeleteKnowledgeItem("service");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const openAdd = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setDialogOpen(true); };

  const handleSubmit = async (values: { name: string; description?: string; metadata: Record<string, any> }) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...values });
        toast.success("Service updated");
      } else {
        await create.mutateAsync(values);
        toast.success("Service added");
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success("Service removed");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground">Manage the services your AI agent knows about.</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Service</Button>
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!isLoading && (!services || services.length === 0) && (
          <p className="text-sm text-muted-foreground py-8 text-center">No services added yet.</p>
        )}
        {services?.map(s => {
          const meta = s.metadata as Record<string, any>;
          return (
            <div key={s.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
              {meta?.duration && <span className="text-sm text-muted-foreground">{meta.duration}</span>}
              {meta?.price && <span className="text-sm font-semibold text-foreground">{meta.price}</span>}
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          );
        })}
      </div>

      <KnowledgeItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Edit Service" : "Add Service"}
        fields={fields}
        metaFields={metaFields}
        initial={editing ? { name: editing.name, description: editing.description, metadata: editing.metadata as Record<string, any> } : undefined}
        onSubmit={handleSubmit}
        loading={create.isPending || update.isPending}
      />
    </div>
  );
}
