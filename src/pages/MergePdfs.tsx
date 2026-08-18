import React from 'react';
import SEO from '../components/SEO';
import { Combine } from 'lucide-react';

export default function MergePdfs() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <SEO title="Merge PDFs" description="Combine multiple PDFs into a single file" />
      <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Combine className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Merge PDFs</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">This tool is currently under construction.</p>
    </div>
  );
}
