import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import voigroLogo from "@/assets/voigro-logo.png";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter and one number.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: window.location.origin + "/dashboard",
        },
      });
      if (error) throw error;
      toast.success("Account created! Please check your email to verify, then sign in.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Phone className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Callio</span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Get started with your AI phone agent</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" autoComplete="name" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="email">Work Email</Label>
            <Input id="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" placeholder="Use a unique password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
