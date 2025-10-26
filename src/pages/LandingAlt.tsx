import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden force-light">
      {/* Animated background */}
      <div className="animated-bg fixed inset-0 z-0 pointer-events-none"></div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar
          maxWidth="xl"
          className={cn(
            "w-full backdrop-blur-xl transition-all duration-300 bg-transparent border-none",
            scrolled
              ? "bg-background/65 shadow-sm glass-effect"
              : "bg-gradient-to-b from-background/70 via-background/40 to-transparent shadow-none"
          )}
        >
          <NavbarBrand>
            <div className="flex items-center gap-2">
              <Icon icon="logos:godot-icon" width={32} />
              <p className="font-bold text-inherit text-xl">Godot Assistant</p>
            </div>
          </NavbarBrand>
          <NavbarContent justify="end">
            <NavbarItem className="hidden sm:flex">
              <Link
                color="secondary"
                href="/auth"
                className="hover:no-underline"
              >
                <Button
                  variant="bordered"
                  className="text-primary border-none focus:bg-slate-300 hover:bg-slate-300 dark:focus:bg-slate-300 dark:hover:bg-slate-300"
                  radius="md"
                >
                  Log In
                </Button>
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link href="/auth?mode=register">
                <Button
                  color="primary"
                  variant="flat"
                  radius="md"
                  className="shadow-elegant text-slate-800"
                >
                  Sign Up
                </Button>
              </Link>
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      </div>

      <main className="relative z-10 ">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-background pt-48 pb-24">
          <div className="absolute inset-0 z-0 landing-hero-overlay">
            <div className="absolute inset-0 hero-gradient-overlay bg-gradient-to-br from-primary-100/30 to-secondary-100/30" />
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 transform">
              <div className="h-96 w-96 rounded-full hero-blob-1 bg-primary-200/30 blur-3xl" />
            </div>
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 transform">
              <div className="h-96 w-96 rounded-full hero-blob-2 bg-secondary-200/30 blur-3xl" />
            </div>
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  <span className="block">Your AI-powered</span>
                  <span className="block text-primary">
                    Godot Engine Assistant
                  </span>
                </h1>
                <p className="mt-6 text-lg text-foreground-500">
                  Get instant answers to your Godot Engine questions with our
                  specialized AI assistant. Access Godot documentation,
                  community solutions, and code examples in seconds.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                  <Link href="/auth?mode=register">
                    <Button
                      size="lg"
                      color="primary"
                      className="font-medium"
                      startContent={<Icon icon="lucide:zap" width={20} />}
                    >
                      Try It Now
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button
                      size="lg"
                      variant="bordered"
                      className="font-medium"
                      startContent={<Icon icon="lucide:log-in" width={20} />}
                    >
                      Login
                    </Button>
                  </Link>
                </div>
                <div className="mt-8 flex items-center justify-center lg:justify-evenly gap-2 text-foreground-500">
                  <Icon
                    icon="lucide:shield-check"
                    className="text-success"
                    width={18}
                  />
                  <span className="text-sm">Fully Local and Secure</span>
                  <Icon
                    icon="lucide:sparkles"
                    className="text-warning"
                    width={18}
                  />
                  <span className="text-sm">Updated Document Sources</span>
                  <Icon
                    icon="lucide:refresh-cw"
                    className="text-primary"
                    width={18}
                  />
                  <span className="text-sm">Real-time web Search</span>
                </div>
              </div>
              <div className="mt-16 sm:mt-24 lg:col-span-6 lg:mt-0">
                <div className="bg-content1 shadow-lg rounded-lg overflow-hidden border border-divider">
                  <div className="bg-content2 px-4 py-3 border-b border-divider flex items-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-danger"></div>
                      <div className="w-3 h-3 rounded-full bg-warning"></div>
                      <div className="w-3 h-3 rounded-full bg-success"></div>
                    </div>
                    <div className="mx-auto text-xs text-foreground-500">
                      Godot Assistant
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-primary-100 p-2 rounded-md">
                        <Icon
                          icon="lucide:user"
                          className="text-primary"
                          width={20}
                        />
                      </div>
                      <div className="bg-content2 rounded-lg p-3 text-sm">
                        How do I implement a 2D character controller in Godot 4?
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-secondary-100 p-2 rounded-md">
                        <Icon icon="logos:godot-icon" width={20} />
                      </div>
                      <div className="bg-content2 rounded-lg p-3 text-sm">
                        <p className="mb-2">
                          Here's a basic 2D character controller for Godot 4:
                        </p>
                        <div className="bg-content3 p-2 rounded-md font-mono text-xs overflow-x-auto">
                          <pre>
                            {`extends CharacterBody2D

@export var speed = 300.0
@export var jump_velocity = -400.0

var gravity = ProjectSettings.get_setting("physics/2d/default_gravity")

func _physics_process(delta):
    # Add gravity
    if not is_on_floor():
        velocity.y += gravity * delta

    # Handle jump
    if Input.is_action_just_pressed("ui_accept") and is_on_floor():
        velocity.y = jump_velocity

    # Get input direction
    var direction = Input.get_axis("ui_left", "ui_right")

    # Handle movement
    if direction:
        velocity.x = direction * speed
    else:
        velocity.x = move_toward(velocity.x, 0, speed)

    move_and_slide()`}
                          </pre>
                        </div>
                        <p className="mt-2">
                          This code handles basic movement, jumping, and gravity
                          for a 2D character.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-16 bg-content1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Supercharge Your Godot Development
              </h2>
              <p className="text-foreground-500 max-w-2xl mx-auto">
                Our AI assistant is specifically trained on Godot Engine to help
                you build games and applications faster.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "lucide:book-open",
                  title: "Godot Documentation",
                  description:
                    "Access the entire Godot documentation with natural language queries. Get precise answers from the official docs.",
                },
                {
                  icon: "lucide:globe",
                  title: "Web Knowledge",
                  description:
                    "When documentation isn't enough, our assistant searches the web, including Reddit, GitHub, and forums for solutions.",
                },
                {
                  icon: "lucide:code",
                  title: "Code Generation",
                  description:
                    "Get ready-to-use code snippets and examples that you can directly implement in your Godot projects.",
                },
                {
                  icon: "lucide:settings",
                  title: "Customizable Models",
                  description:
                    "Choose from different AI models and adjust parameters like temperature to get responses that match your needs.",
                },
                {
                  icon: "lucide:palette",
                  title: "Theme Customization",
                  description:
                    "Personalize the UI with different themes and layouts to match your preferences and workflow.",
                },
                {
                  icon: "lucide:layers",
                  title: "Session Management",
                  description:
                    "Create, save, and continue chat sessions. Organize your conversations by project or topic.",
                },
              ].map((feature, index) => (
                <Card key={index} className="border border-divider">
                  <CardBody className="p-6">
                    <div className="bg-primary-100 p-3 rounded-md w-fit mb-4">
                      <Icon
                        icon={feature.icon}
                        className="text-primary"
                        width={24}
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-foreground-500">{feature.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Experience the Power of Godot Assistant
            </h2>
            <p className="text-foreground-500 max-w-2xl mx-auto">
              See how our AI-powered assistant can help you with Godot
              development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "lucide:message-circle",
                title: "Chat Interface",
                description:
                  "Ask questions about Godot Engine and get instant answers with code examples and explanations.",
              },
              {
                icon: "lucide:settings",
                title: "Model Selection",
                description:
                  "Choose from different AI models and adjust parameters to get responses that match your needs.",
              },
              {
                icon: "lucide:moon",
                title: "Theme Switching",
                description:
                  "Switch between light and dark themes to match your preferences and reduce eye strain.",
              },
              {
                icon: "lucide:layers",
                title: "Session Management",
                description:
                  "Create, save, and continue chat sessions. Organize your conversations by project or topic.",
              },
            ].map((item, index) => (
              <Card key={index} className="border border-divider">
                <CardBody className="p-6">
                  <div className="bg-primary-100 p-3 rounded-md w-fit mb-4">
                    <Icon
                      icon={item.icon}
                      className="text-primary"
                      width={24}
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-foreground-500">{item.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-content2 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Accelerate Your Godot Development?
            </h2>
            <p className="text-foreground-500 max-w-2xl mx-auto mb-8">
              Join thousands of developers who are building amazing games and
              applications with the help of Godot Assistant.
            </p>
            <Link href="/auth?mode=register">
              <Button size="lg" color="primary" className="font-medium">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-content1 border-t border-divider py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="logos:godot-icon" width={32} />
              <span className="font-bold text-xl">Godot Assistant</span>
            </div>
            <p className="text-foreground-500 max-w-md mb-6">
              Your AI-powered companion for Godot Engine development. Get
              answers, code examples, and solutions instantly.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                aria-label="Twitter"
                className="text-foreground-500 hover:text-primary transition-colors"
              >
                <Icon icon="lucide:twitter" width={24} />
              </Link>
              <Link
                href="#"
                aria-label="GitHub"
                className="text-foreground-500 hover:text-primary transition-colors"
              >
                <Icon icon="lucide:github" width={24} />
              </Link>
              <Link
                href="#"
                aria-label="Discord"
                className="text-foreground-500 hover:text-primary transition-colors"
              >
                <Icon icon="lucide:message-circle" width={24} />
              </Link>
            </div>
          </div>

          <div className="border-t border-divider mt-8 pt-8 text-center">
            <p className="text-sm text-foreground-500">
              © 2024 Godot Assistant. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
