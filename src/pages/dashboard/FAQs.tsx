import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

const faqs = [
  { id: 1, question: "What are your opening hours?", answer: "We're open Monday to Friday 9 AM to 7 PM, and Saturday 9 AM to 5 PM." },
  { id: 2, question: "Do you accept walk-ins?", answer: "Yes, we accept walk-ins based on availability, but we recommend booking an appointment." },
  { id: 3, question: "What payment methods do you accept?", answer: "We accept cash, credit/debit cards, and Apple Pay." },
  { id: 4, question: "Do you offer gift cards?", answer: "Yes! Gift cards are available in any amount starting from $25." },
  { id: 5, question: "Is parking available?", answer: "Yes, free parking is available in the lot behind our building." },
];

export default function FAQs() {
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
        {faqs.map(f => (
          <div key={f.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{f.question}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
