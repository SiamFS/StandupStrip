"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Users,
  Calendar,
  Sparkles,
  Mail,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: Calendar,
    title: "Daily Standup Capture",
    description: "Simple three-field format: Yesterday, Today, Blockers. No complexity, just clarity.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Summaries",
    description: "Daily & weekly AI summaries with key themes, blockers, and progress insights.",
  },
  {
    icon: Users,
    title: "Team Invitations",
    description: "Invite members via email or shareable codes. They get a beautiful invite email to join instantly.",
  },
  {
    icon: BarChart3,
    title: "Participation Heatmap",
    description: "GitHub-style contribution graph showing team activity over time. Celebrate consistency.",
  },
  {
    icon: Mail,
    title: "Email Notifications",
    description: "Verification emails, password reset, blocker alerts, and weekly summaries—all automated.",
  },
  {
    icon: Shield,
    title: "Secure & Lightweight",
    description: "Email verification, password reset, secure team deletion. No Jira complexity.",
  },
];

const benefits = [
  "Email verification & password reset",
  "Weekly AI summaries to your inbox",
  "Blocker alerts for team owners",
  "Works across time zones",
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">StandUpStrip</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Lightweight Async Standups + AI Summaries</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Stop drowning in{" "}
            <span className="text-primary">fragmented updates</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            StandUpStrip gives your team a clean, async standup workflow without the overhead of Jira or Linear.
            Get AI-powered daily summaries in one click.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Quick benefits */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-10 text-sm text-muted-foreground">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 border-t">
        <div className="text-center mb-16 animate-in fade-in-0 duration-500">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Designed for small teams who want clarity without complexity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="container mx-auto px-4 py-20 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple 3-step workflow
          </h2>
          <p className="text-lg text-muted-foreground">
            From signup to AI summary in minutes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: "1",
              title: "Create your team",
              desc: "Set up a workspace and invite your teammates with a simple code.",
            },
            {
              step: "2",
              title: "Submit standups",
              desc: "Each member fills in Yesterday, Today, and Blockers daily.",
            },
            {
              step: "3",
              title: "Get AI summaries",
              desc: "One click generates a smart summary with themes and blockers.",
            },
          ].map((item, index) => (
            <div
              key={item.step}
              className="text-center animate-in fade-in-0 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto bg-primary text-primary-foreground">
          <CardContent className="p-10 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to streamline your standups?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Join teams who&apos;ve replaced chaotic Slack threads with clean daily updates.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-base px-8">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">StandUpStrip</span>
          </div>
          <p>Lightweight async standups for modern teams.</p>
        </div>
      </footer>
    </div>
  );
}
