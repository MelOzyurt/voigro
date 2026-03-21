import { useState, useCallback, useRef } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ClipboardPaste, ImageIcon, Sparkles, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { type ParsedProduct, flattenParsedCategories, fileToBase64, deduplicateProducts } from "@/lib/menuParser";
import { useBulkCreateKnowledgeItems, type KnowledgeItemType } from "@/hooks/use-knowledge-items";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: KnowledgeItemType;
  itemLabel: string;
}

export default function AIMenuImporter({ open, onOpenChange, type, itemLabel }: Props) {
  const [tab, setTab] = useState("paste");
  const [pasteText, setPasteText] = useState("");
  const [items, setItems] = useState<ParsedProduct[]>([]);
  const [parsing, setParsing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bulkCreate = useBulkCreateKnowledgeItems(type);

  const reset = () => {
    setItems([]);
    setPasteText("");
    setImagePreview(null);
    setParsing(false);
  };

  const handleParseText = async () => {
    if (!pasteText.trim()) return;
    setParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-parse-menu-text", {
        body: { text: pasteText },
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Parse failed");
      const flat = deduplicateProducts(flattenParsedCategories(data.data.categories));
      if (flat.length === 0) {
        toast.error("No items found in text");
        return;
      }
      setItems(flat);
      toast.success(`${flat.length} items detected`);
    } catch (e: any) {
      toast.error(e.message || "Failed to parse text");
    } finally {
      setParsing(false);
    }
  };

  const handleImageFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large (max 10MB)");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setParsing(true);
    try {
      const base64 = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke("parse-menu-image", {
        body: { image: base64, mimeType: file.type },
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Parse failed");
      const flat = deduplicateProducts(flattenParsedCategories(data.data.categories));
      if (flat.length === 0) {
        toast.error("No items found in image");
        return;
      }
      setItems(flat);
      toast.success(`${flat.length} items detected from image`);
    } catch (e: any) {
      toast.error(e.message || "Failed to parse image");
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleImageFile(file);
        return;
      }
    }
  }, []);

  const toggleItem = (index: number) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, selected: !it.selected } : it));
  };

  const toggleAll = () => {
    const allSelected = items.every(it => it.selected);
    setItems(prev => prev.map(it => ({ ...it, selected: !allSelected })));
  };

  const updateField = (index: number, field: keyof ParsedProduct, value: any) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
  };

  const selectedCount = items.filter(it => it.selected).length;

  const handleImport = async () => {
    const selected = items.filter(it => it.selected);
    if (selected.length === 0) return;
    try {
      const mapped = selected.map((it, i) => ({
        name: it.name,
        description: it.description,
        sort_order: i,
        metadata: {
          ...(it.price ? { price: `£${it.price.toFixed(2)}` } : {}),
          ...(it.category && it.category !== "Uncategorised" ? { category: it.category } : {}),
        },
      }));
      await bulkCreate.mutateAsync(mapped);
      toast.success(`${selected.length} ${itemLabel.toLowerCase()}s imported`);
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Import failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" onPaste={handlePaste}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI {itemLabel} Import
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <>
            {parsing ? (
              <div className="space-y-3 py-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 animate-pulse" /> AI is analyzing your {itemLabel.toLowerCase()}s…
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="paste" className="flex-1 gap-1.5">
                    <ClipboardPaste className="h-3.5 w-3.5" /> Paste Text
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex-1 gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" /> Upload Image
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="paste" className="space-y-3 mt-3">
                  <Label>Paste your menu, price list, or product list</Label>
                  <Textarea
                    rows={10}
                    placeholder={`Starters\nGarlic Bread £4.50\nSoup of the Day £5.99\n\nMains\nMargherita Pizza 9" £8.99 / 12" £11.99\nPepperoni Pizza - Spicy pepperoni with cheese £12.50\nChicken Burger with fries £10.99`}
                    value={pasteText}
                    onChange={e => setPasteText(e.target.value)}
                    className="font-mono text-xs"
                  />
                  <Button onClick={handleParseText} disabled={!pasteText.trim()}>
                    <Sparkles className="mr-2 h-4 w-4" /> Parse with AI
                  </Button>
                </TabsContent>

                <TabsContent value="image" className="space-y-3 mt-3">
                  <Label>Upload a photo of your menu or price list</Label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Menu preview" className="max-h-48 mx-auto rounded-lg" />
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drop image here, click to browse, or <strong>Ctrl+V</strong> to paste
                        </p>
                        <p className="text-xs text-muted-foreground">JPEG, PNG, WebP — max 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleImageFile(f);
                    }}
                  />
                </TabsContent>
              </Tabs>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{items.length} items</Badge>
                <Badge variant="outline">{selectedCount} selected</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={toggleAll}>
                  {items.every(it => it.selected) ? (
                    <><Square className="mr-1 h-3.5 w-3.5" /> Deselect All</>
                  ) : (
                    <><CheckSquare className="mr-1 h-3.5 w-3.5" /> Select All</>
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={reset}>Re-parse</Button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="p-2 w-8"></th>
                    <th className="p-2 text-left font-medium text-muted-foreground">Category</th>
                    <th className="p-2 text-left font-medium text-muted-foreground">Name</th>
                    <th className="p-2 text-left font-medium text-muted-foreground">Description</th>
                    <th className="p-2 text-right font-medium text-muted-foreground w-24">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className={`border-t hover:bg-muted/30 ${!item.selected ? "opacity-40" : ""}`}>
                      <td className="p-2">
                        <Checkbox checked={item.selected} onCheckedChange={() => toggleItem(i)} />
                      </td>
                      <td className="p-2">
                        <Input
                          value={item.category}
                          onChange={e => updateField(i, "category", e.target.value)}
                          className="h-7 text-xs border-0 bg-transparent p-0 focus-visible:ring-0"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={item.name}
                          onChange={e => updateField(i, "name", e.target.value)}
                          className="h-7 text-xs font-medium border-0 bg-transparent p-0 focus-visible:ring-0"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={item.description || ""}
                          onChange={e => updateField(i, "description", e.target.value)}
                          className="h-7 text-xs border-0 bg-transparent p-0 focus-visible:ring-0"
                          placeholder="—"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <span className="text-xs text-muted-foreground">£</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.price ?? ""}
                            onChange={e => updateField(i, "price", e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="h-7 text-xs border-0 bg-transparent p-0 focus-visible:ring-0 w-16 text-right"
                            placeholder="0.00"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          {items.length > 0 && (
            <Button onClick={handleImport} disabled={selectedCount === 0 || bulkCreate.isPending}>
              {bulkCreate.isPending ? "Importing…" : `Import ${selectedCount} ${itemLabel}s`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
