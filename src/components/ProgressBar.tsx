import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  progress: number;
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const safeProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className="w-full mt-4">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{Math.round(safeProgress)}%</span>
        </div>
      )}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
