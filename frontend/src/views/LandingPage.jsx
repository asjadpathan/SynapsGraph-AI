import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Search, 
  UploadCloud, 
  Network, 
  MessageSquare, 
  BookmarkPlus, 
  BookOpen, 
  TrendingUp, 
  Sparkles, 
  Users, 
  FolderKanban, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Github, 
  ShieldCheck, 
  Zap, 
  Globe
} from 'lucide-react';

export default function LandingPage({ onLogin, onGetStarted }) {
  const features = [
    { icon: Search, title: "Semantic Search", desc: "Query hundreds of paper abstracts using high-dimensional dense vector representations." },
    { icon: UploadCloud, title: "PDF Upload & Parsing", desc: "Automated GROBID XML parsing extracting authors, TEI metadata, and full text structure." },
    { icon: Network, title: "Knowledge Graph", desc: "Interactive Neo4j graph linking authors, citations, papers, and thematic concepts." },
    { icon: MessageSquare, title: "AI Chat Assistant", desc: "Conversational RAG backed by Gemini 3.6 Flash providing precise grounded answers." },
    { icon: BookmarkPlus, title: "Citation Recommendation", desc: "Discover missing cross-citations and relevant related work based on cosine similarity." },
    { icon: BookOpen, title: "Literature Review", desc: "Generate multi-section structured literature reviews directly from uploaded paper collections." },
    { icon: Sparkles, title: "Research Gap Detection", desc: "AI-assisted discovery of under-explored methods, limitations, and future directions." },
    { icon: TrendingUp, title: "Trend Analysis", desc: "Track temporal publication velocity, topic evolution, and citation metrics over time." },
    { icon: Users, title: "Author Analytics", desc: "Map co-authorship networks, institution affiliations, and top published researchers." },
    { icon: FolderKanban, title: "Workspace Management", desc: "Organize research projects into isolated spaces with dedicated Qdrant & Neo4j scopes." }
  ];

  const workflow = [
    { step: "01", title: "Upload PDF", desc: "Drag & drop research paper PDFs in single or batch mode.", icon: UploadCloud },
    { step: "02", title: "Extract Text", desc: "GROBID extracts titles, authors, and structured TEI metadata.", icon: BookOpen },
    { step: "03", title: "Generate Embeddings", desc: "Sentence Transformers encode text into dense 384-d vectors.", icon: Zap },
    { step: "04", title: "Semantic Search", desc: "Index stored in Qdrant for real-time similarity query.", icon: Search },
    { step: "05", title: "Knowledge Graph", desc: "Neo4j maps paper-author relations & co-citation networks.", icon: Network },
    { step: "06", title: "AI Analysis", desc: "Gemini models synthesize research gaps & Literature Reviews.", icon: Sparkles },
    { step: "07", title: "Dashboard", desc: "Explore findings, interactive graph views & analytics.", icon: Brain }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Landing Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-glow">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-slate-900 via-brand-600 to-brand-500 dark:from-white dark:to-brand-400 bg-clip-text text-transparent">
            SynapsGraph AI
          </span>
        </div>

        {/* Center Nav Items */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <a href="#home" className="hover:text-brand-500 transition-colors">Home</a>
          <a href="#features" className="hover:text-brand-500 transition-colors">Features</a>
          <a href="#workflow" className="hover:text-brand-500 transition-colors">Workflow</a>
          <a href="#pricing" className="hover:text-brand-500 transition-colors">Pricing</a>
          <a href="#docs" className="hover:text-brand-500 transition-colors">Documentation</a>
          <a href="#contact" className="hover:text-brand-500 transition-colors">Contact</a>
        </div>

        {/* Right CTA */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onLogin}
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 px-3 py-2 transition-colors"
          >
            Login
          </button>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-soft hover:shadow-glow transition-all flex items-center space-x-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative px-6 lg:px-12 py-20 lg:py-32 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen Academic Research Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Discover Research Papers using <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500 bg-clip-text text-transparent">AI & Knowledge Graphs</span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Upload hundreds of research papers and instantly discover deep insights through Semantic Search, Knowledge Graphs, Citation Recommendations, Literature Reviews, and AI Research Gap Analysis.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {["Semantic Vector Search", "Knowledge Graph Extraction", "Citation Recommendation", "Literature Review Synthesis", "Research Gap Detection", "Author Analytics"].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base shadow-glow hover:scale-105 transition-all flex items-center space-x-3"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onGetStarted}
                className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-base transition-all flex items-center space-x-2"
              >
                <Play className="w-4 h-4 text-brand-500 fill-brand-500" />
                <span>Watch Demo</span>
              </button>
            </div>
          </motion.div>

          {/* Right Hero Graphic: Animated Knowledge Graph Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto rounded-3xl bg-gradient-to-tr from-brand-500/10 via-indigo-500/10 to-transparent p-6 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-glass flex items-center justify-center">
              {/* Central Glowing Hub */}
              <div className="relative z-10 w-24 h-24 rounded-full bg-brand-500 text-white flex flex-col items-center justify-center shadow-glow animate-pulse">
                <Brain className="w-10 h-10" />
                <span className="text-[10px] font-bold mt-1 uppercase">Synaps</span>
              </div>

              {/* Orbiting Satellite Nodes */}
              {[
                { label: "Transformer", top: "15%", left: "20%", icon: BookOpen },
                { label: "RAG Model", top: "20%", right: "15%", icon: Search },
                { label: "Neo4j Graph", bottom: "25%", left: "15%", icon: Network },
                { label: "Qdrant Index", bottom: "18%", right: "20%", icon: Zap },
                { label: "Gemini 3.6", top: "50%", left: "5%", icon: Sparkles },
                { label: "Co-Authors", top: "52%", right: "5%", icon: Users }
              ].map((node, i) => {
                const IconComponent = node.icon;
                return (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{ top: node.top, left: node.left, right: node.right, bottom: node.bottom }}
                    className="absolute z-20 flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-soft"
                  >
                    <IconComponent className="w-4 h-4 text-brand-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{node.label}</span>
                  </motion.div>
                );
              })}

              {/* Decorative SVG Connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-brand-300/40 dark:stroke-brand-700/40 stroke-2" strokeDasharray="4 4">
                <line x1="50%" y1="50%" x2="25%" y2="20%" />
                <line x1="50%" y1="50%" x2="75%" y2="25%" />
                <line x1="50%" y1="50%" x2="20%" y2="70%" />
                <line x1="50%" y1="50%" x2="80%" y2="75%" />
                <line x1="50%" y1="50%" x2="10%" y2="50%" />
                <line x1="50%" y1="50%" x2="90%" y2="50%" />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 px-6 lg:px-12 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Complete AI Research Toolkit
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base">
              Everything you need to accelerate literature analysis, map domain graphs, and extract novel scientific hypotheses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -6 }}
                  className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-all shadow-sm hover:shadow-soft"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            How SynapsGraph Works
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            From raw PDF documents to multi-layered knowledge graphs in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflow.slice(0, 4).map((w, idx) => {
            const Icon = w.icon;
            return (
              <div key={idx} className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-3xl font-black text-brand-500/30 dark:text-brand-400/20">{w.step}</span>
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 text-brand-500 flex items-center justify-center my-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{w.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{w.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 max-w-4xl mx-auto">
          {workflow.slice(4, 7).map((w, idx) => {
            const Icon = w.icon;
            return (
              <div key={idx} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-3xl font-black text-brand-500/30 dark:text-brand-400/20">{w.step}</span>
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 text-brand-500 flex items-center justify-center my-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{w.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{w.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 lg:px-12 bg-slate-100/70 dark:bg-slate-900/70 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Simple, Transparent Pricing</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Choose the ideal plan for individual researchers, labs, or academic institutions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Individual Researcher</h3>
                <p className="text-xs text-slate-500">Perfect for exploring papers & literature.</p>
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white">$0 <span className="text-xs font-semibold text-slate-400">/ month</span></div>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Up to 50 Papers per project</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Basic Knowledge Graph</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> AI Q&A with Gemini 3.6</li>
              </ul>
              <button onClick={onGetStarted} className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                Start Free
              </button>
            </div>

            {/* Pro */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-brand-500 shadow-glow space-y-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-500 text-white text-[10px] font-bold uppercase rounded-full tracking-wider">
                Most Popular
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pro Lab</h3>
                <p className="text-xs text-slate-500">For PhD students & research teams.</p>
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white">$29 <span className="text-xs font-semibold text-slate-400">/ month</span></div>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Unlimited Papers & Workspaces</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Advanced Neo4j Knowledge Graph</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Automated Gap & Trend Detection</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Multi-format Review Export</li>
              </ul>
              <button onClick={onGetStarted} className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-soft">
                Get Started
              </button>
            </div>

            {/* Institution */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Enterprise / Univ</h3>
                <p className="text-xs text-slate-500">For university libraries & R&D hubs.</p>
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white">Custom</div>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Dedicated Qdrant & Neo4j Instance</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> SSO & Custom Role Permissions</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /> 24/7 SLA Support</li>
              </ul>
              <button onClick={onGetStarted} className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-6 lg:px-12 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">SynapsGraph AI</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <a href="#privacy" className="hover:text-slate-800 dark:hover:text-white">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-800 dark:hover:text-white">Terms of Service</a>
            <a href="#docs" className="hover:text-slate-800 dark:hover:text-white">Documentation</a>
            <a href="#github" className="hover:text-slate-800 dark:hover:text-white flex items-center gap-1"><Github className="w-3.5 h-3.5" /> GitHub</a>
            <a href="#contact" className="hover:text-slate-800 dark:hover:text-white">Contact Us</a>
          </div>

          <p className="text-xs text-slate-400">© 2026 SynapsGraph AI Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
