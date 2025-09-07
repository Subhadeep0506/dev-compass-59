import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Zap, Shield, Bot, Database, Cpu, Globe } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient canvas */}
      <div className="pointer-events-none absolute inset-0 -z-10 animate-gradient bg-[radial-gradient(1400px_700px_at_50%_-10%,rgba(217,70,239,0.75),transparent),radial-gradient(1100px_600px_at_90%_20%,rgba(14,165,233,0.65),transparent),radial-gradient(1100px_600px_at_10%_80%,rgba(16,185,129,0.65),transparent),linear-gradient(115deg,rgba(217,70,239,0.35),rgba(14,165,233,0.35),rgba(16,185,129,0.35))]" />

      {/* Floating blurry blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/40 blur-3xl mix-blend-lighten animate-blob" />
      <div className="pointer-events-none absolute top-10 right-[-5rem] h-80 w-80 rounded-full bg-cyan-400/40 blur-3xl mix-blend-lighten animate-blob animation-delay-2000" />
      <div className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-emerald-400/40 blur-3xl mix-blend-lighten animate-blob animation-delay-4000" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-4">
          <nav className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-8 h-8 text-primary" />
              <span className="text-xl font-extrabold bg-gradient-to-r from-fuchsia-500 via-violet-500 to-emerald-500 bg-clip-text text-transparent">GodotChat</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button className="shadow-elegant">Get Started</Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="relative overflow-hidden px-6 pt-20 pb-12">
          <div className="max-w-7xl mx-auto text-center">
            <Badge className="bg-fuchsia-600 text-white border-fuchsia-400/60">Secure • Fast • Flexible</Badge>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-emerald-500 bg-clip-text text-transparent">Modern AI chat</span>{' '}
              <span className="text-foreground">for teams and builders</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/90 mb-8 max-w-3xl mx-auto">
              Chat, manage knowledge, and ship faster with a delightful RAG experience—privacy-first and developer-friendly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=register">
                <Button size="lg" className="text-lg px-8 py-6 shadow-elegant">Create free account</Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">Try demo</Button>
              </Link>
            </div>

            {/* Glass stats */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[{label:'People supported',value:'12k+'},{label:'Satisfaction',value:'98%'},{label:'Orgs',value:'120+'},{label:'Access',value:'24/7'}].map((s,i)=> (
                <div key={i} className="rounded-2xl p-[1px] bg-gradient-to-b from-fuchsia-500/40 via-cyan-400/30 to-emerald-400/40">
                  <div className="rounded-2xl bg-background/60 backdrop-blur-xl ring-1 ring-border/40 p-4 shadow-sm">
                    <div className="text-2xl font-bold">{s.value}</div>
                    <div className="text-sm text-muted-foreground">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Features Section (gradient blurry cards) */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Everything you need for RAG</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {icon: <Zap className="w-5 h-5" />, title: 'Fast context ingestion', desc: 'Drag-and-drop docs with smart chunking and embeddings.'},
                {icon: <Shield className="w-5 h-5" />, title: 'Privacy by default', desc: 'Encrypted storage and strict access controls.'},
                {icon: <Bot className="w-5 h-5" />, title: 'Agentic workflows', desc: 'Tools, function calls, and external sources.'},
                {icon: <Database className="w-5 h-5" />, title: 'Vector DB support', desc: 'Plug into your favorite databases.'},
                {icon: <Cpu className="w-5 h-5" />, title: 'Model-flexible', desc: 'Switch between providers without rewrites.'},
                {icon: <Globe className="w-5 h-5" />, title: 'Citations & web', desc: 'Ground outputs with verifiable sources.'},
              ].map((f, i) => (
                <div key={i} className="relative rounded-2xl p-[1px] bg-gradient-to-b from-fuchsia-500/40 via-violet-500/25 to-cyan-400/35">
                  <Card className="bg-background/60 backdrop-blur-xl ring-1 ring-border/40 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-elegant">
                    <CardHeader className="flex-row items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-fuchsia-600/20 text-fuchsia-300 flex items-center justify-center">{f.icon}</div>
                      <CardTitle className="text-lg">{f.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm text-foreground/90">{f.desc}</CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">Loved by builders</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {quote: 'We shipped our assistant in a weekend.', author: 'Product startup'},
                {quote: 'The privacy model fits healthcare.', author: 'Clinical org'},
                {quote: 'Docs ingestion is insanely fast.', author: 'Dev team'},
              ].map((t, i) => (
                <div key={i} className="rounded-2xl p-[1px] bg-gradient-to-b from-fuchsia-500/40 via-cyan-400/30 to-emerald-400/40">
                  <div className="rounded-2xl bg-background/60 backdrop-blur-xl ring-1 ring-border/40 p-5 shadow-sm">
                    <p className="text-sm text-foreground">“{t.quote}”</p>
                    <p className="mt-3 text-xs text-foreground/80">{t.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="rounded-2xl p-[1px] bg-gradient-to-r from-fuchsia-500/50 via-violet-500/40 to-emerald-500/50">
              <div className="rounded-2xl bg-background/60 backdrop-blur-xl ring-1 ring-border/40 px-8 py-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to build?</h2>
                <p className="text-lg text-muted-foreground mb-8">Create your account and deploy your RAG assistant today.</p>
                <Link to="/auth?mode=register">
                  <Button size="lg" className="text-lg px-8 py-6 shadow-elegant">Get started</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-border/50">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-muted-foreground">© 2024 GodotChat. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
