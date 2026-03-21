import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, ClipboardPaste, Globe } from "lucide-react";
import { toast } from "sonner";

interface ParsedItem {
  name: string;
  description?: string;
  metadata: Record<string, any>;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemLabel: string; // "Product" or "Service"
  onImport: (items: ParsedItem[]) => Promise<void>;
  loading?: boolean;
}

function parseLines(text: string): ParsedItem[] {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      // Support formats: "Name - Description - £price"  or  "Name, Description, price"
      const sep = line.includes("\t") ? "\t" : line.includes(" - ") ? " - " : ",";
      const parts = line.split(sep).map(s => s.trim());
      const name = parts[0] || "";
      const description = parts[1] || undefined;
      const price = parts[2] || undefined;
      const metadata: Record<string, any> = {};
      if (price) metadata.price = price;
      return { name, description, metadata };
    })
    .filter(item => item.name);
}

export default function BulkImportDialog({ open, onOpenChange, itemLabel, onImport, loading }: Props) {
  const [tab, setTab] = useState("paste");
  const [pasteText, setPasteText] = useState("");
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<ParsedItem[]>([]);
  const [fetching, setFetching] = useState(false);

  const handleParse = () => {
    const items = parseLines(pasteText);
    if (items.length === 0) {
      toast.error("No items found. Use one item per line.");
      return;
    }
    setPreview(items);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const items = parseLines(text);
      if (items.length === 0) {
        toast.error("No items found in file.");
        return;
      }
      setPreview(items);
      setPasteText(text);
    };
    reader.readAsText(file);
  };

  const handleUrlFetch = async () => {
    if (!url.trim()) return;
    setFetching(true);
    try {
      const res = await fetch(url.trim());
      const text = await res.text();
      const items = parseLines(text);
      if (items.length === 0) {
        toast.error("No items found from URL content.");
        return;
      }
      setPreview(items);
      setPasteText(text);
    } catch {
      toast.error("Failed to fetch URL content.");
    } finally {
      setFetching(false);
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    await onImport(preview);
    setPreview([]);
    setPasteText("");
    setUrl("");
    onOpenChange(false);
  };

  const reset = () => {
    setPreview([]);
    setPasteText("");
    setUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import {itemLabel}s</DialogTitle>
        </DialogHeader>

        {preview.length === 0 ? (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full">
              <TabsTrigger value="paste" className="flex-1 gap-1.5">
                <ClipboardPaste className="h-3.5 w-3.5" /> Paste
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex-1 gap-1.5">
                <Upload className="h-3.5 w-3.5" /> Upload
              </TabsTrigger>
              <TabsTrigger value="url" className="flex-1 gap-1.5">
                <Globe className="h-3.5 w-3.5" /> URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-3 mt-3">
              <Label>One {itemLabel.toLowerCase()} per line (Name, Description, Price)</Label>
              <Textarea
                rows={8}
                placeholder={`Margherita Pizza, Classic tomato & mozzarella, £9.99\nPepperoni Pizza, Spicy pepperoni with cheese, £11.99\nGarlic Bread, Freshly baked, £4.50`}
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
              />
              <Button onClick={handleParse} disabled={!pasteText.trim()}>Parse & Preview</Button>
            </TabsContent>

            <TabsContent value="upload" className="space-y-3 mt-3">
              <Label>Upload a CSV or TXT file</Label>
              <Input type="file" accept=".csv,.txt,.tsv" onChange={handleFileUpload} />
            </TabsContent>

            <TabsContent value="url" className="space-y-3 mt-3">
              <Label>Paste a URL to a CSV/text file</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/menu.csv"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleUrlFetch} disabled={!url.trim() || fetching}>
                  {fetching ? "Fetching…" : "Fetch"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{preview.length} items found</p>
              <Button variant="ghost" size="sm" onClick={() => setPreview([])}>Back</Button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1 rounded-lg border p-2">
              {preview.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-muted/50">
                  <span className="text-muted-foreground w-6 text-right">{i + 1}.</span>
                  <span className="font-medium flex-1 truncate">{item.name}</span>
                  {item.description && <span className="text-muted-foreground text-xs truncate max-w-32">{item.description}</span>}
                  {item.metadata?.price && <span className="text-xs font-semibold">{item.metadata.price}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          {preview.length > 0 && (
            <Button onClick={handleImport} disabled={loading}>
              {loading ? "Importing…" : `Import ${preview.length} ${itemLabel}s`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
