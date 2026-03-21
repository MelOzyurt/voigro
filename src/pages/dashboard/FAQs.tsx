import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useKnowledgeItems, useCreateKnowledgeItem, useUpdateKnowledgeItem, useDeleteKnowledgeItem } from "@/hooks/use-knowledge-items";
import KnowledgeItemDialog, { type KnowledgeField } from "@/components/KnowledgeItemDialog";
import { toast } from "sonner";

const fields: KnowledgeField[] = [
  { key: "name", label: "Question", placeholder: "e.g. What are your opening hours?" },
  { key: "description", label: "Answer", type: "textarea", placeholder: "Type the answer…" },
];

export default function FAQs() {
  const { data: faqs, isLoading } = useKnowledgeItems("faq");
  const create = useCreateKnowledgeItem("faq");
  const update = useUpdateKnowledgeItem("faq");
  const remove = useDeleteKnowledgeItem("faq");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const openAdd = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setDialogOpen(true); };

  const handleSubmit = async (values: { name: string; description?: string; metadata: Record<string, any> }) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...values });
        toast.success("FAQ updated");
      } else {
        await create.mutateAsync(values);
        toast.success("FAQ added");
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success("FAQ removed");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">FAQs</h1>
          <p className="text-sm text-muted-foreground">Questions your AI agent can answer automatically.</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add FAQ</Button>
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!isLoading && (!faqs || faqs.length === 0) && (
          <p className="text-sm text-muted-foreground py-8 text-center">No FAQs added yet.</p>
        )}
        {faqs?.map(f => (
          <div key={f.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{f.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <KnowledgeItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Edit FAQ" : "Add FAQ"}
        fields={fields}
        initial={editing ? { name: editing.name, description: editing.description, metadata: editing.metadata as Record<string, any> } : undefined}
        onSubmit={handleSubmit}
        loading={create.isPending || update.isPending}
      />
    </div>
  );
}
