import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useKnowledgeItems } from "@/hooks/use-knowledge-items";

export default function Services() {
  const { data: services, isLoading } = useKnowledgeItems("service");

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
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!isLoading && (!services || services.length === 0) && (
          <p className="text-sm text-muted-foreground py-8 text-center">No services added yet. Add your first service so your AI agent can tell callers about it.</p>
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
