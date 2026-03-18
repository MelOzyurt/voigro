import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

const products = [
  { id: 1, name: "Premium Shampoo", description: "Sulfate-free hydrating shampoo", price: "$24", stock: "In Stock" },
  { id: 2, name: "Hair Mask", description: "Deep repair keratin mask", price: "$32", stock: "In Stock" },
  { id: 3, name: "Styling Gel", description: "Strong hold styling gel", price: "$18", stock: "Low Stock" },
  { id: 4, name: "Leave-in Conditioner", description: "Lightweight daily conditioner", price: "$22", stock: "In Stock" },
];

export default function Products() {
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
        {products.map(p => (
          <div key={p.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.description}</p>
            </div>
            <span className="text-sm font-semibold text-foreground">{p.price}</span>
            <span className={`text-xs ${p.stock === "Low Stock" ? "text-destructive" : "text-muted-foreground"}`}>{p.stock}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
