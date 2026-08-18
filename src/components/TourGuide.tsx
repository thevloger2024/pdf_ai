import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Check, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const steps = [
  {
    targetId: 'nav-tour-tools',
    title: 'Essential Tools',
    content: 'Convert, compress, split, and edit your PDFs right from here.',
  },
  {
    targetId: 'nav-tour-mobile-menu',
    title: 'Navigation Menu',
    content: 'Access all your tools and settings from this menu.',
    mobileOnly: true,
  }
];

export function TourGuide() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem('has_seen_tour');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        updateTargetRect(0);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      const handleResize = () => updateTargetRect(currentStep);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isVisible, currentStep]);

  const updateTargetRect = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step) return;

    // Skip desktop-only steps on mobile and vice versa
    const isMobile = window.innerWidth < 768;
    
    let el = document.getElementById(step.targetId);
    
    // Fallbacks if the specific element isn't visible (e.g. mobile vs desktop)
    if (isMobile && !step.mobileOnly && step.targetId !== 'nav-tour-mobile-menu') {
       el = document.getElementById('nav-tour-mobile-menu');
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      // If we can't find it, center the tooltip
      setTargetRect(null);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      
      // Skip if mobileOnly but we are on desktop
      const isMobile = window.innerWidth < 768;
      if (steps[next].mobileOnly && !isMobile) {
        completeTour();
        return;
      }
      
      setCurrentStep(next);
      updateTargetRect(next);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      updateTargetRect(prev);
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    localStorage.setItem('has_seen_tour', 'true');
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {/* Dark overlay backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] pointer-events-auto"
          onClick={completeTour}
        />

        {/* Highlight ring around the target element */}
        {targetRect && (
          <motion.div
            initial={false}
            animate={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute border-2 border-white bg-white/10 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.5)] z-[101]"
          />
        )}

        {/* Tooltip Dialog */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            position: 'absolute',
            top: targetRect ? targetRect.bottom + 20 : '20%',
            left: targetRect ? Math.max(16, Math.min(window.innerWidth - 320 - 16, targetRect.left + (targetRect.width / 2) - 160)) : '50%',
            transform: targetRect ? 'none' : 'translate(-50%, -50%)',
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-[320px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-5 z-[102] pointer-events-auto border border-slate-100 dark:border-slate-700"
        >
          {/* Arrow pointing to target */}
          {targetRect && (
            <div 
              className="absolute -top-2 w-4 h-4 bg-white dark:bg-slate-800 rotate-45 border-l border-t border-slate-100 dark:border-slate-700"
              style={{
                left: Math.max(16, Math.min(288, targetRect.left + (targetRect.width / 2) - (targetRect ? Math.max(16, Math.min(window.innerWidth - 320 - 16, targetRect.left + (targetRect.width / 2) - 160)) : 0) - 8))
              }}
            />
          )}

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                Quick Tour {currentStep + 1}/{steps.length}
              </span>
              <button onClick={completeTour} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              {currentStepData.content}
            </p>

            <div className="flex items-center justify-between">
              <button 
                onClick={prevStep}
                disabled={currentStep === 0}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-0 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button 
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5 transition-colors"
              >
                {currentStep === steps.length - 1 || (window.innerWidth >= 768 && currentStep === 1) ? (
                  <>Done <Check className="w-4 h-4" /></>
                ) : (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
