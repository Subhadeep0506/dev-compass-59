import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  BookText,
  Globe,
  Code2,
  SlidersHorizontal,
  Palette,
  Save,
  LayoutPanelTop,
  SunMoon,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: <BookText className="h-5 w-5" />,
    title: "Godot Documentation",
    desc: "Ask the entire Godot docs with natural language and get precise answers.",
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: "Web Knowledge",
    desc: "Search Reddit, GitHub, and the web when the docs are not enough.",
  },
  {
    icon: <Code2 className="h-5 w-5" />,
    title: "Code Generation",
    desc: "Get ready-to-use code examples you can paste into your project.",
  },
  {
    icon: <SlidersHorizontal className="h-5 w-5" />,
    title: "Customizable Models",
    desc: "Pick models and adjust parameters to match your needs.",
  },
  {
    icon: <Palette className="h-5 w-5" />,
    title: "Theme Customization",
    desc: "Personalize the interface with themes and layouts.",
  },
  {
    icon: <Save className="h-5 w-5" />,
    title: "Session Management",
    desc: "Create, save, and continue conversations by topic.",
  },
];

const powers = [
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "Chat Interface",
    desc: "Ask questions about Godot Engine and get instant explanations.",
  },
  {
    icon: <LayoutPanelTop className="h-5 w-5" />,
    title: "Model Selection",
    desc: "Choose the best AI model for your task.",
  },
  {
    icon: <SunMoon className="h-5 w-5" />,
    title: "Theme Switching",
    desc: "Light and dark modes designed for long sessions.",
  },
  {
    icon: <Save className="h-5 w-5" />,
    title: "Session Management",
    desc: "Organize and revisit conversations per project.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 animate-gradient bg-[radial-gradient(1400px_700px_at_50%_-10%,rgba(62,146,214,0.6),transparent),radial-gradient(1100px_600px_at_90%_20%,rgba(102,182,240,0.55),transparent),radial-gradient(1100px_600px_at_10%_80%,rgba(16,185,129,0.55),transparent),linear-gradient(115deg,rgba(62,146,214,0.25),rgba(102,182,240,0.25),rgba(16,185,129,0.25))]" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[rgba(62,146,214,0.28)] blur-3xl mix-blend-lighten animate-blob" />
      <div className="pointer-events-none absolute top-10 right-[-5rem] h-80 w-80 rounded-full bg-cyan-400/40 blur-3xl mix-blend-lighten animate-blob animation-delay-2000" />
      <div className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-emerald-400/40 blur-3xl mix-blend-lighten animate-blob animation-delay-4000" />

      <div className="relative z-10">
        <header className="px-6 py-4">
          <nav className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-7 h-7 text-primary" />
              <span
                className="text-xl font-extrabold bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #3e92d6 0%, #66b6f0 50%, #34d399 100%)",
                }}
              >
                Godot Assistant
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#demo"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Demo
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </a>
              <a
                href="#docs"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Documentation
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/auth">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button className="shadow-elegant">Sign Up</Button>
              </Link>
            </div>
          </nav>
        </header>

        <main className="px-6 pt-12 pb-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-primary text-primary-foreground border-primary/40">
                Free tier available
              </Badge>
              <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight">
                Your AI-powered
                <span
                  className="block bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #3e92d6 0%, #66b6f0 50%, #34d399 100%)",
                  }}
                >
                  Godot Engine Assistant
                </span>
              </h1>
              <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-xl">
                Get instant answers to your Godot questions. Access docs,
                community solutions, and code examples in seconds.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/auth?mode=register">
                  <Button
                    size="lg"
                    className="px-8 py-6 text-lg shadow-elegant"
                  >
                    Try It Now
                  </Button>
                </Link>
                <a href="#demo">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 text-lg"
                  >
                    Watch Demo
                  </Button>
                </a>
              </div>
            </div>
            <div id="demo">
              <Card className="bg-background/70 backdrop-blur-xl ring-1 ring-border/50 shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    How do I implement a 2D character controller in Godot 4?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="code-block">
                    <pre>
                      <code>{`extends CharacterBody2D
@export var speed := 300.0
@export var jump_velocity := -480.0

func _physics_process(delta: float) -> void:
    var dir := Input.get_axis("ui_left", "ui_right")
    velocity.x = dir * speed

    if Input.is_action_just_pressed("ui_accept") and is_on_floor():
        velocity.y = jump_velocity

    if not is_on_floor():
        velocity.y += 980.0 * delta

    move_and_slide()`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <section id="features" className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
              Supercharge Your Godot Development
            </h2>
            <p className="text-center text-muted-foreground mb-10">
              Our assistant is trained on Godot to help you build games and apps
              faster.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <Card
                  key={i}
                  className="transition-all hover:-translate-y-1 bg-card shadow-sm hover:shadow-elegant"
                >
                  <CardHeader className="flex-row items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      {f.icon}
                    </div>
                    <CardTitle className="text-base">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    {f.desc}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
              Experience the Power of Godot Assistant
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {powers.map((p, i) => (
                <Card
                  key={i}
                  className="bg-card shadow-sm hover:shadow-elegant transition-all"
                >
                  <CardHeader className="flex-row items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      {p.icon}
                    </div>
                    <CardTitle className="text-base">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    {p.desc}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-6 py-16 bg-muted/40">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Ready to Accelerate Your Godot Development?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join developers building amazing games with the help of Godot
              Assistant.
            </p>
            <Link to="/auth?mode=register">
              <Button size="lg" className="px-8 py-6 text-lg shadow-elegant">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>

        <footer className="px-6 py-10">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">Godot Assistant</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Godot Assistant. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
