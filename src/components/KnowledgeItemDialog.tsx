import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface KnowledgeField {
  key: string;
  label: string;
  type?: "text" | "textarea";
  placeholder?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: KnowledgeField[];
  metaFields?: KnowledgeField[];
  initial?: { name: string; description?: string | null; metadata?: Record<string, any> };
  onSubmit: (values: { name: string; description?: string; metadata: Record<string, any> }) => void;
  loading?: boolean;
}

export default function KnowledgeItemDialog({
  open, onOpenChange, title, fields, metaFields = [], initial, onSubmit, loading,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const v: Record<string, string> = {};
    v.name = initial?.name ?? "";
    v.description = initial?.description ?? "";
    for (const f of metaFields) {
      v[f.key] = initial?.metadata?.[f.key] ?? "";
    }
    setValues(v);
  }, [open, initial]);

  const set = (key: string, val: string) => setValues(prev => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    const metadata: Record<string, any> = {};
    for (const f of metaFields) {
      if (values[f.key]) metadata[f.key] = values[f.key];
    }
    onSubmit({ name: values.name, description: values.description || undefined, metadata });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {fields.map(f => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea
                  value={values[f.key] ?? ""}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="mt-1.5"
                  rows={3}
                />
              ) : (
                <Input
                  value={values[f.key] ?? ""}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="mt-1.5"
                />
              )}
            </div>
          ))}
          {metaFields.map(f => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Input
                value={values[f.key] ?? ""}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="mt-1.5"
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!values.name?.trim() || loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
