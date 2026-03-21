import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Upload, Sparkles } from "lucide-react";
import { useKnowledgeItems, useCreateKnowledgeItem, useUpdateKnowledgeItem, useDeleteKnowledgeItem, useBulkCreateKnowledgeItems } from "@/hooks/use-knowledge-items";
import KnowledgeItemDialog, { type KnowledgeField } from "@/components/KnowledgeItemDialog";
import BulkImportDialog from "@/components/BulkImportDialog";
import AIMenuImporter from "@/components/AIMenuImporter";
import ChildOptionsPanel from "@/components/ChildOptionsPanel";
import UpdateAgentBar from "@/components/UpdateAgentBar";
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
  const bulkCreate = useBulkCreateKnowledgeItems("service");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
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

  const handleBulkImport = async (items: { name: string; description?: string; metadata: Record<string, any> }[]) => {
    try {
      await bulkCreate.mutateAsync(items);
      toast.success(`${items.length} services imported`);
    } catch (e: any) {
      toast.error(e.message || "Failed to import");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground">Manage the services your AI agent knows about.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAiOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" /> AI Import
          </Button>
          <Button variant="outline" onClick={() => setBulkOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Bulk Import
          </Button>
          <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Service</Button>
        </div>
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!isLoading && (!services || services.length === 0) && (
          <p className="text-sm text-muted-foreground py-8 text-center">No services added yet.</p>
        )}
        {services?.map(s => {
          const meta = s.metadata as Record<string, any>;
          return (
            <div key={s.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-4">
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
              <ChildOptionsPanel parentId={s.id} parentName={s.name} type="service" />
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

      <BulkImportDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        itemLabel="Service"
        onImport={handleBulkImport}
        loading={bulkCreate.isPending}
      />

      <AIMenuImporter
        open={aiOpen}
        onOpenChange={setAiOpen}
        type="service"
        itemLabel="Service"
      />

      <UpdateAgentBar type="service" />
    </div>
  );
}
