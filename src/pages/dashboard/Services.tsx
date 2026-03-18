import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";

const services = [
  { id: 1, name: "Haircut", description: "Professional haircut and styling", duration: "45 min", price: "$35" },
  { id: 2, name: "Hair Coloring", description: "Full color treatment with premium products", duration: "90 min", price: "$85" },
  { id: 3, name: "Blowout", description: "Wash and blow-dry styling", duration: "30 min", price: "$25" },
  { id: 4, name: "Deep Conditioning", description: "Intensive hair conditioning treatment", duration: "30 min", price: "$40" },
  { id: 5, name: "Highlights", description: "Partial or full highlights", duration: "120 min", price: "$120" },
];

export default function Services() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground">Manage the services your AI agent knows about.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Service</Button>
      </div>

      <div className="space-y-2">
        {services.map(s => (
          <div key={s.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </div>
            <span className="text-sm text-muted-foreground">{s.duration}</span>
            <span className="text-sm font-semibold text-foreground">{s.price}</span>
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
