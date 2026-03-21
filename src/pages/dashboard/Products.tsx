import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Upload, Sparkles } from "lucide-react";
import { useKnowledgeItems, useCreateKnowledgeItem, useUpdateKnowledgeItem, useDeleteKnowledgeItem, useBulkCreateKnowledgeItems } from "@/hooks/use-knowledge-items";
import KnowledgeItemDialog, { type KnowledgeField } from "@/components/KnowledgeItemDialog";
import BulkImportDialog from "@/components/BulkImportDialog";
import AIMenuImporter from "@/components/AIMenuImporter";
import ChildOptionsPanel from "@/components/ChildOptionsPanel";
import { toast } from "sonner";

const fields: KnowledgeField[] = [
  { key: "name", label: "Product Name", placeholder: "e.g. Premium Shampoo" },
  { key: "description", label: "Description", type: "textarea", placeholder: "Describe this product…" },
];
const metaFields: KnowledgeField[] = [
  { key: "price", label: "Price", placeholder: "e.g. £12.99" },
  { key: "stock", label: "Stock Status", placeholder: "e.g. In Stock, Low Stock" },
];

export default function Products() {
  const { data: products, isLoading } = useKnowledgeItems("product");
  const create = useCreateKnowledgeItem("product");
  const update = useUpdateKnowledgeItem("product");
  const remove = useDeleteKnowledgeItem("product");
  const bulkCreate = useBulkCreateKnowledgeItems("product");

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
        toast.success("Product updated");
      } else {
        await create.mutateAsync(values);
        toast.success("Product added");
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success("Product removed");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  };

  const handleBulkImport = async (items: { name: string; description?: string; metadata: Record<string, any> }[]) => {
    try {
      await bulkCreate.mutateAsync(items);
      toast.success(`${items.length} products imported`);
    } catch (e: any) {
      toast.error(e.message || "Failed to import");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">Manage products your AI agent can mention or sell.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAiOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" /> AI Import
          </Button>
          <Button variant="outline" onClick={() => setBulkOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Bulk Import
          </Button>
          <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
        </div>
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!isLoading && (!products || products.length === 0) && (
          <p className="text-sm text-muted-foreground py-8 text-center">No products added yet.</p>
        )}
        {products?.map(p => {
          const meta = p.metadata as Record<string, any>;
          return (
            <div key={p.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </div>
                {meta?.price && <span className="text-sm font-semibold text-foreground">{meta.price}</span>}
                {meta?.stock && (
                  <span className={`text-xs ${meta.stock === "Low Stock" ? "text-destructive" : "text-muted-foreground"}`}>{meta.stock}</span>
                )}
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              <ChildOptionsPanel parentId={p.id} parentName={p.name} type="product" />
            </div>
          );
        })}
      </div>

      <KnowledgeItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Edit Product" : "Add Product"}
        fields={fields}
        metaFields={metaFields}
        initial={editing ? { name: editing.name, description: editing.description, metadata: editing.metadata as Record<string, any> } : undefined}
        onSubmit={handleSubmit}
        loading={create.isPending || update.isPending}
      />

      <BulkImportDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        itemLabel="Product"
        onImport={handleBulkImport}
        loading={bulkCreate.isPending}
      />

      <AIMenuImporter
        open={aiOpen}
        onOpenChange={setAiOpen}
        type="product"
        itemLabel="Product"
      />
    </div>
  );
}
