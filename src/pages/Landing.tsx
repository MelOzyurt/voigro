import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Bot, BarChart3, Clock, Users, ArrowRight,
  Zap, Shield, Headphones,
  Utensils, Wrench, Stethoscope, Scissors, ShoppingBag, Building2, Phone
} from "lucide-react";
import { motion } from "framer-motion";
import voigroLogo from "@/assets/voigro-logo.png";
import ProductTiers from "@/components/landing/ProductTiers";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const useCases = [
  { icon: Utensils, name: "Restaurants", desc: "Take reservations, answer menu questions, handle takeout orders" },
  { icon: Wrench, name: "Auto Shops", desc: "Schedule appointments, provide repair estimates, collect vehicle details" },
  { icon: Stethoscope, name: "Clinics", desc: "Book patient appointments, handle prescription refill requests" },
  { icon: Scissors, name: "Salons", desc: "Manage bookings, answer service & pricing questions" },
  { icon: ShoppingBag, name: "Retail", desc: "Check product availability, process simple orders, capture leads" },
  { icon: Building2, name: "Services", desc: "Qualify leads, schedule consultations, collect project details" },
];

const steps = [
  { num: "01", title: "Sign Up & Configure", desc: "Create your account, add your business details, services, and FAQs." },
  { num: "02", title: "Customize Your Agent", desc: "Set your agent's tone, greeting, and the actions it can perform." },
  { num: "03", title: "Go Live", desc: "Forward your business line to Voigro. Calls are answered instantly, 24/7." },
];

const plans = [
  { name: "Starter", price: "$49", period: "/mo", features: ["100 calls/month", "1 phone number", "Basic AI agent", "Call transcripts", "Email support"], popular: false },
  { name: "Professional", price: "$149", period: "/mo", features: ["500 calls/month", "3 phone numbers", "Advanced AI agent", "Booking & callbacks", "Priority support", "Custom FAQ"], popular: true },
  { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited calls", "Unlimited numbers", "Custom integrations", "Dedicated account manager", "SLA guarantee", "API access"], popular: false },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={voigroLogo} alt="Voigro" className="h-8 w-8" />
            <span className="font-display text-xl font-bold text-foreground">Voigro</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <motion.section initial="hidden" animate="visible" variants={stagger} className="container py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" /> AI-Powered Voice Agents for Business
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Never Miss a Call.<br />Never Lose a Customer.
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Every missed call is a lost customer. Voigro answers instantly — booking appointments, capturing leads, and handling enquiries 24/7, even while you sleep.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">Start Free Trial <ArrowRight className="ml-1 h-5 w-5" /></Link>
            </Button>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-primary" /> Live in under 5 minutes
            </span>
            <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 text-primary" /> Answers calls 24/7
            </span>
            <span className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3 text-primary" /> Avg. 40+ recovered calls/month
            </span>
          </motion.div>
        </div>

        {/* Mock call UI */}
        <motion.div variants={fadeUp} className="mx-auto mt-20 max-w-2xl rounded-2xl border bg-card p-6 shadow-lg">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
              <Phone className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Incoming Call — Maria's Salon</p>
              <p className="text-xs text-muted-foreground">AI Agent handling • 0:42</p>
            </div>
            <div className="ml-auto flex h-6 items-center rounded-full bg-success/10 px-3">
              <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              <span className="text-xs font-medium text-success">Live</span>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { role: "AI", text: "Hi! Thanks for calling Maria's Salon. How can I help you today?" },
              { role: "Caller", text: "I'd like to book a haircut for Saturday morning." },
              { role: "AI", text: "I have 10:00 AM and 11:30 AM available this Saturday. Which works best for you?" },
            ].map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "Caller" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${msg.role === "Caller" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  <span className="mb-0.5 block text-[10px] font-semibold opacity-70">{msg.role === "AI" ? "Voigro Agent" : "Caller"}</span>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Features */}
      <section id="features" className="border-t bg-card py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">Everything Your Phone Needs</h2>
            <p className="mt-3 text-muted-foreground">Powerful features designed for businesses that can't afford to miss a call.</p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Bot, title: "AI-Powered Answers", desc: "Your agent learns your business and answers questions accurately." },
              { icon: Clock, title: "24/7 Availability", desc: "Never miss a call, even after hours or on holidays." },
              { icon: Users, title: "Lead Capture", desc: "Collect caller details and route them to your CRM." },
              { icon: BarChart3, title: "Call Analytics", desc: "Track every call, see trends, and optimize performance." },
              { icon: Shield, title: "Enterprise Security", desc: "SOC 2 compliant with encrypted call data." },
              { icon: Headphones, title: "Smart Escalation", desc: "Seamlessly transfer complex calls to your team." },
            ].map((f, i) => (
              <div key={i} className="group rounded-xl border bg-background p-6 transition-all duration-150 hover:shadow-md">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">Up and Running in Minutes</h2>
            <p className="mt-3 text-muted-foreground">Three simple steps to a fully automated phone line.</p>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center">
                <span className="font-display text-5xl font-extrabold text-primary/10">{s.num}</span>
                <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-t bg-card py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">Built for Every Business</h2>
            <p className="mt-3 text-muted-foreground">From restaurants to clinics, Voigro adapts to your industry.</p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((uc, i) => (
              <div key={i} className="flex gap-4 rounded-xl border bg-background p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <uc.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground">{uc.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{uc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Tiers */}
      <ProductTiers />

      {/* CTA */}
      <section className="border-t bg-navy py-24">
        <div className="container text-center">
          <h2 className="font-display text-3xl font-bold text-navy-foreground">Ready to Transform Your Phone Line?</h2>
          <p className="mx-auto mt-4 max-w-xl text-navy-foreground/70">Join hundreds of businesses using Voigro to handle calls, capture leads, and book appointments automatically.</p>
          <div className="mt-10 flex justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">Start Free Trial <ArrowRight className="ml-1 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <img src={voigroLogo} alt="Voigro" className="h-7 w-7" />
            <span className="font-display text-lg font-bold text-foreground">Voigro</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Voigro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
