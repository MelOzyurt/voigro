import { useState } from "react";
import { useCustomers, useCreateCustomer, useDeleteCustomer } from "@/hooks/use-customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, Users, MoreHorizontal, Trash2, Mail, Phone } from "lucide-react";
import { format } from "date-fns";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: customers = [], isLoading } = useCustomers(search || undefined);
  const createCustomer = useCreateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [form, setForm] = useState({ full_name: "", email: "", phone: "", notes: "" });

  const handleCreate = () => {
    if (!form.full_name.trim()) return;
    createCustomer.mutate(
      { full_name: form.full_name, email: form.email || undefined, phone: form.phone || undefined, notes: form.notes || undefined },
      { onSuccess: () => { setDialogOpen(false); setForm({ full_name: "", email: "", phone: "", notes: "" }); } }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground">Manage your customer contacts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input className="mt-1.5" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} placeholder="Jane Doe" />
              </div>
              <div>
                <Label>Email</Label>
                <Input className="mt-1.5" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="jane@example.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input className="mt-1.5" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+44 7911 123456" />
              </div>
              <div>
                <Label>Notes</Label>
                <Input className="mt-1.5" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." />
              </div>
              <Button className="w-full" onClick={handleCreate} disabled={createCustomer.isPending || !form.full_name.trim()}>
                {createCustomer.isPending ? "Adding..." : "Add Customer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search customers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No customers yet</p>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.full_name}</TableCell>
                  <TableCell>
                    {c.email ? (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" /> {c.email}
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    {c.phone ? (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(c.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteCustomer.mutate(c.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
