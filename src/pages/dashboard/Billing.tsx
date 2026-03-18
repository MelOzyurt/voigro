import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, ArrowUpRight, Download } from "lucide-react";

const invoices = [
  { id: "INV-001", date: "Mar 1, 2026", amount: "$149.00", status: "Paid" },
  { id: "INV-002", date: "Feb 1, 2026", amount: "$149.00", status: "Paid" },
  { id: "INV-003", date: "Jan 1, 2026", amount: "$149.00", status: "Paid" },
  { id: "INV-004", date: "Dec 1, 2025", amount: "$49.00", status: "Paid" },
];

export default function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and billing.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="font-display text-base">Current Plan</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-foreground">Professional</span>
                  <Badge className="bg-success/10 text-success text-[10px]">Active</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">500 calls/month • 3 phone numbers • Priority support</p>
              </div>
              <div className="text-right">
                <span className="font-display text-2xl font-bold text-foreground">$149</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Calls used this month</span>
                <span className="font-medium text-foreground">342 / 500</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div className="h-2 rounded-full bg-primary" style={{ width: "68%" }} />
              </div>
              <p className="text-xs text-muted-foreground">158 calls remaining • Resets Apr 1, 2026</p>
            </div>

            <div className="mt-4 rounded-lg border bg-background p-3">
              <p className="text-sm text-foreground font-medium">Pay-as-you-go overage</p>
              <p className="text-xs text-muted-foreground">$0.25 per additional call beyond your plan limit</p>
            </div>

            <div className="mt-4 flex gap-3">
              <Button variant="outline">Change Plan</Button>
              <Button variant="ghost">Cancel Subscription</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display text-base">Payment Method</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/2027</p>
              </div>
            </div>
            <Button variant="outline" className="mt-3 w-full" size="sm">Update Payment Method</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="font-display text-base">Invoices</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg border bg-background p-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{inv.id}</span>
                  <span className="text-sm text-muted-foreground">{inv.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">{inv.amount}</span>
                  <Badge variant="secondary" className="bg-success/10 text-success text-[10px]">{inv.status}</Badge>
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
