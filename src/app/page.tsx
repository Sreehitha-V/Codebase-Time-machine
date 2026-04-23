"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GitBranch, Zap, Brain, BarChart3, Play, Code2, ArrowRight, Github, Star } from "lucide-react";

const features = [
  {
    icon: GitBranch,
    title: "Commit Timeline",
    description: "Interactive visual timeline of every commit. Click any node to explore changes in detail.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Brain,
    title: "AI Explanations",
    description: "Each commit explained in plain English. Understand what changed, why, and the impact.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Code2,
    title: "Diff Viewer",
    description: "Side-by-side code comparison with syntax highlighting and change indicators.",
    color: "from-orange-500 to-pink-500",
  },
  {
    icon: Play,
    title: "Story Mode",
    description: "Watch your codebase evolve as an animated story. AI narrates each step automatically.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Evolution Insights",
    description: "Commit frequency, top contributors, hotspot files — understand your codebase at a glance.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Paste a GitHub URL and get a full analysis in seconds. No setup required.",
    color: "from-pink-500 to-rose-500",
  },
];

const stats = [
  { value: "100+", label: "Commits analyzed per repo" },
  { value: "AI", label: "Powered explanations" },
  { value: "Real-time", label: "GitHub integration" },
  { value: "Free", label: "To get started" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060812] text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Time Machine
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden md:flex items-center gap-8 text-sm text-white/60"
        >
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <Link
            href="/login"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            Get started
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-32 px-6 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Powered by AI • GitHub Integration • Real-time Analysis
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-6xl md:text-8xl font-bold leading-[0.9] tracking-tight mb-6"
        >
          See how code
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
            evolves.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-white/50 max-w-2xl mx-auto mb-10"
        >
          Understand why it changes. Visualize your GitHub repository&apos;s full
          history with AI-powered explanations, interactive timelines, and deep insights.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="group flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 rounded-xl font-medium text-white hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-cyan-500/20"
          >
            Analyze Your Repo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all"
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </motion.div>

        {/* Hero visual - animated timeline mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 relative"
        >
          <div className="glass rounded-2xl p-6 max-w-4xl mx-auto border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 bg-white/5 rounded h-6 ml-4" />
            </div>

            {/* Fake timeline */}
            <div className="relative py-8">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              <div className="flex justify-between items-center relative">
                {[
                  { label: "Initial", color: "bg-green-400", active: false },
                  { label: "Add auth", color: "bg-blue-400", active: false },
                  { label: "Dashboard", color: "bg-cyan-400", active: true },
                  { label: "Fix bugs", color: "bg-yellow-400", active: false },
                  { label: "v1.0", color: "bg-violet-400", active: false },
                ].map((node, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className={`flex flex-col items-center gap-2 ${node.active ? "scale-110" : ""}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full ${node.color} ${
                        node.active ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-black/20 shadow-lg shadow-cyan-400/30" : ""
                      }`}
                    />
                    <span className="text-xs text-white/50 hidden sm:block">{node.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Selected commit details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="grid grid-cols-3 gap-4 mt-4"
            >
              <div className="bg-white/5 rounded-xl p-3 text-left">
                <div className="text-xs text-white/40 mb-1">Commit</div>
                <div className="text-sm font-mono text-cyan-400">3fa8c12</div>
                <div className="text-xs text-white/60 mt-1 truncate">Add dashboard UI</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-left col-span-2">
                <div className="text-xs text-white/40 mb-1">AI Explanation</div>
                <div className="text-xs text-white/70 leading-relaxed">
                  A new dashboard interface was added with analytics charts and user metrics visualization...
                </div>
              </div>
            </motion.div>
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-2xl blur-xl -z-10" />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-3xl font-bold text-gradient mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Everything you need to
              <br />
              <span className="text-gradient">understand your codebase</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              From commit analysis to AI-powered narration, we give you superpowers
              to understand any GitHub repository.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group glass rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl font-bold mb-4"
          >
            Up and running in{" "}
            <span className="text-gradient">30 seconds</span>
          </motion.h2>
          <p className="text-white/50 mb-16">No configuration. No setup. Just paste and go.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Paste GitHub URL", desc: "Enter any public GitHub repository URL" },
              { step: "02", title: "Analyze", desc: "We fetch commits, diffs, and build the timeline" },
              { step: "03", title: "Explore", desc: "Browse commits, get AI explanations, watch story mode" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="font-display text-6xl font-bold text-white/5 mb-4">{item.step}</div>
                <h3 className="font-display font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-sm text-white/50">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center glass rounded-3xl p-12 border border-white/10"
        >
          <h2 className="font-display text-4xl font-bold mb-4">
            Start exploring your
            <br />
            <span className="text-gradient">code history</span>
          </h2>
          <p className="text-white/50 mb-8">
            Free to use. No credit card required. Works with any public GitHub repo.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 rounded-xl font-medium text-white hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-cyan-500/20"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <GitBranch className="w-4 h-4" />
            Codebase Time Machine
          </div>
          <div className="text-sm text-white/30">
            Built with Next.js, AI & ❤️
          </div>
        </div>
      </footer>
    </div>
  );
}
