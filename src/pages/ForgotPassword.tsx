import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import voigroLogo from "@/assets/voigro-logo.png";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src={voigroLogo} alt="Voigro" className="h-8 w-8" />
            <span className="font-display text-xl font-bold text-foreground">Voigro</span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold text-foreground">Reset your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">We'll send you a reset link</p>
        </div>
        {sent ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Check your email for a password reset link.</p>
            <Button variant="ghost" className="mt-4" asChild>
              <Link to="/login"><ArrowLeft className="mr-2 h-4 w-4" /> Back to login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full">Send Reset Link</Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/login"><ArrowLeft className="mr-2 h-4 w-4" /> Back to login</Link>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
