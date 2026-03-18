import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useKnowledgeItems } from "@/hooks/use-knowledge-items";

export default function FAQs() {
  const { data: faqs, isLoading } = useKnowledgeItems("faq");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">FAQs</h1>
          <p className="text-sm text-muted-foreground">Questions your AI agent can answer automatically.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Add FAQ</Button>
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!isLoading && (!faqs || faqs.length === 0) && (
          <p className="text-sm text-muted-foreground py-8 text-center">No FAQs added yet. Add common questions so your AI agent can answer them automatically.</p>
        )}
        {faqs?.map(f => {
          const meta = f.metadata as Record<string, any>;
          return (
            <div key={f.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{f.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.description ?? meta?.answer}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
