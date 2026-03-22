import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Phone, Calendar, TrendingUp, Check, Star,
  Mic, MessageSquare, Clock, Globe, ShieldCheck,
  BookOpen, Users, Settings, BarChart3, Mail,
  Target, Repeat, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const tiers = [
  {
    key: "starter",
    title: "Starter",
    subtitle: "AI Voice Agent",
    tagline: "Best for getting started",
    description: "Handle every call with AI",
    icon: Phone,
    accent: "muted",
    popular: false,
    features: [
      "AI-powered call answering",
      "Natural human-like conversations",
      "Custom greetings & tone",
      "Call routing & forwarding",
      "Voicemail automation",
      "Call transcripts",
      "AI call summaries",
      "Intent detection (booking, info, support)",
      "FAQ auto-responses",
      "Business hours handling",
      "Multi-language support",
      "Spam & missed call handling",
    ],
  },
  {
    key: "pro",
    title: "Pro",
    subtitle: "Smart Booking",
    tagline: "Most Popular",
    description: "Everything in Starter, plus booking automation",
    icon: Calendar,
    accent: "primary",
    popular: true,
    includes: "Includes everything in Starter",
    features: [
      "Online booking page",
      "Real-time availability calendar",
      "Service management (duration, price)",
      "Automated booking creation from calls",
      "Appointment confirmations (SMS/Email)",
      "Rescheduling & cancellations",
      "Customer database (CRM-lite)",
      "Booking history",
      "Time slot & capacity control",
      "Availability rules (weekly schedule)",
      "Availability overrides (exceptions, holidays)",
      "Multi-service bookings",
      "Basic staff assignment",
    ],
  },
  {
    key: "growth",
    title: "Growth",
    subtitle: "Growth Engine",
    tagline: "Scale your business",
    description: "Everything in Pro, plus marketing & growth tools",
    icon: TrendingUp,
    accent: "success",
    popular: false,
    includes: "Includes everything in Pro",
    features: [
      "Campaign management (promotions, offers)",
      "Email automation flows",
      "SMS marketing",
      "Customer segmentation",
      "Review & feedback collection",
      "Repeat customer targeting",
      "Abandoned booking recovery",
      "Upsell & cross-sell automation",
      "Customer lifetime tracking",
      "Revenue analytics",
      "Booking reports",
      "Marketing performance tracking",
    ],
  },
];

const accentStyles = {
  muted: {
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
    ring: "",
    check: "text-muted-foreground",
    includesBg: "",
  },
  primary: {
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    badge: "bg-primary text-primary-foreground",
    ring: "ring-2 ring-primary/20",
    check: "text-primary",
    includesBg: "bg-primary/5",
  },
  success: {
    iconBg: "bg-success/10",
    iconColor: "text-success",
    badge: "bg-success/10 text-success",
    ring: "",
    check: "text-success",
    includesBg: "bg-success/5",
  },
};

export default function ProductTiers() {
  return (
    <section id="pricing" className="py-24 lg:py-32">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Modular Packages
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Choose What Fits Your Business
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Start with AI-powered calls and expand into booking, CRM, and growth
            tools as you scale — no lock-in, no complexity.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-6 lg:grid-cols-3">
          {tiers.map((tier, i) => {
            const style = accentStyles[tier.accent as keyof typeof accentStyles];
            return (
              <motion.div
                key={tier.key}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.1 } },
                }}
                className={`relative flex flex-col rounded-2xl border bg-card p-8 transition-shadow duration-200 hover:shadow-lg ${
                  tier.popular ? `${style.ring} shadow-md` : ""
                }`}
              >
                {/* Badge */}
                <span
                  className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}
                >
                  {tier.tagline}
                </span>

                {/* Header */}
                <div className="flex items-center gap-3 pt-2">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.iconBg}`}
                  >
                    <tier.icon className={`h-5 w-5 ${style.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {tier.title}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground">
                      {tier.subtitle}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {tier.description}
                </p>

                {/* Includes label */}
                {tier.includes && (
                  <div
                    className={`mt-4 rounded-lg px-3 py-2 text-xs font-medium ${style.includesBg} ${style.iconColor}`}
                  >
                    {tier.includes}
                  </div>
                )}

                {/* Divider */}
                <div className="my-5 h-px bg-border" />

                {/* Features */}
                <ul className="flex-1 space-y-2.5">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-foreground/85">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${style.check}`}
                        strokeWidth={2.5}
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className="mt-8 w-full"
                  variant={tier.popular ? "default" : "outline"}
                  asChild
                >
                  <Link to="/signup">Get Started</Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
