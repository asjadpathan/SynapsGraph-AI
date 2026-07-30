import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Brain, 
  Loader2, 
  Sparkles, 
  FileText, 
  Code, 
  Network, 
  Database, 
  LayoutDashboard 
} from 'lucide-react';

export default function ProcessingScreen({ onComplete }) {
  const steps = [
    { label: "Reading PDF", icon: FileText, delay: 600 },
    { label: "Extracting Text", icon: Code, delay: 1200 },
    { label: "Parsing Document", icon: Sparkles, delay: 1800 },
    { label: "Generating Embeddings", icon: Database, delay: 2500 },
    { label: "Building Knowledge Graph", icon: Network, delay: 3200 },
    { label: "Preparing Dashboard", icon: LayoutDashboard, delay: 4000 }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress > 15 && currentStep < 1) setCurrentStep(1);
    if (progress > 35 && currentStep < 2) setCurrentStep(2);
    if (progress > 55 && currentStep < 3) setCurrentStep(3);
    if (progress > 75 && currentStep < 4) setCurrentStep(4);
    if (progress > 92 && currentStep < 5) setCurrentStep(5);
  }, [progress, currentStep]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 space-y-8 z-10 text-center"
      >
        {/* Animated Central Icon */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-brand-500/20 animate-ping" />
          <div className="w-20 h-20 rounded-3xl bg-brand-500 text-white flex items-center justify-center shadow-glow z-10">
            <Brain className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Processing Papers</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Synthesizing vector representations and Neo4j graph nodes...
          </p>
        </div>

        {/* Progress Bar & ETA */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
            <span>Overall Progress</span>
            <span className="text-brand-500">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 p-0.5 overflow-hidden border border-slate-200 dark:border-slate-700">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium text-right">
            Estimated time remaining: {Math.max(1, Math.ceil((100 - progress) / 25))}s
          </p>
        </div>

        {/* Multi-step Checklist */}
        <div className="space-y-3 text-left border-t border-slate-100 dark:border-slate-800 pt-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                  isCurrent
                    ? 'bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 shadow-sm'
                    : isDone
                    ? 'bg-slate-50 dark:bg-slate-800/40'
                    : 'opacity-40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isDone ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : isCurrent ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold ${isCurrent ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {step.label}
                  </span>
                </div>

                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {isCurrent && <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
