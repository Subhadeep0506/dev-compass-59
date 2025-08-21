import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Zap, Shield, Users } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary-glow/20">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary-glow/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent/50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-4">
          <nav className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">GodotChat</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="px-6 py-20">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              AI-Powered Chat Experience
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Engage with intelligent conversations, get instant help, and discover the future of AI assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=register">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Chatting Now
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Why Choose GodotChat?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Get instant responses powered by cutting-edge AI technology.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
                <p className="text-muted-foreground">
                  Your conversations are encrypted and protected with enterprise-grade security.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Collaborative</h3>
                <p className="text-muted-foreground">
                  Share conversations and collaborate with your team seamlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Conversations?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who are already experiencing the future of AI chat.
            </p>
            <Link to="/auth?mode=register">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-border/50">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-muted-foreground">
              © 2024 GodotChat. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;