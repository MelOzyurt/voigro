import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useKnowledgeItems } from "@/hooks/use-knowledge-items";

export default function Products() {
  const { data: products, isLoading } = useKnowledgeItems("product");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">Manage products your AI agent can mention or sell.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!isLoading && (!products || products.length === 0) && (
          <p className="text-sm text-muted-foreground py-8 text-center">No products added yet. Add products so your AI agent can mention or sell them.</p>
        )}
        {products?.map(p => {
          const meta = p.metadata as Record<string, any>;
          return (
            <div key={p.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.description}</p>
              </div>
              {meta?.price && <span className="text-sm font-semibold text-foreground">{meta.price}</span>}
              {meta?.stock && (
                <span className={`text-xs ${meta.stock === "Low Stock" ? "text-destructive" : "text-muted-foreground"}`}>{meta.stock}</span>
              )}
              <div className="flex gap-1">
                <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
