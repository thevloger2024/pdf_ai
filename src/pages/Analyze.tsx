import { toast } from "react-hot-toast";
import SEO from '../components/SEO';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileUploader } from '../components/FileUploader';
import { Bot, Loader2, FileScan } from 'lucide-react';
import { User } from '../types';
import { logActivity, logToolAccess } from '../lib/firebase';
import ReactMarkdown from 'react-markdown';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export default function Analyze({ user }: { user: User | null }) {
  useEffect(() => {
    logToolAccess('analyze');
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('Please summarize the key points of this document.');
  const [isThinking, setIsThinking] = useState(false);
  const [highThinking, setHighThinking] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useKeyboardShortcuts({
    onEscape: () => {
      setFile(null);
      setResult(null);
      toast('File cleared', { icon: '🧹' });
    },
    onSave: () => {
      if (file && !isThinking) {
        handleAnalyze();
      }
    }
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setIsThinking(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);
    formData.append('thinking', highThinking.toString());

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (response.ok) {
        setResult(data.text);
        if (user) {
          logActivity(user.uid, 'ai_analyze', { highThinking });
        }
      } else {
        throw new Error(data.error || 'Failed to analyze');
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Error: " + error.message);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row gap-8 items-start">
      <SEO title="AI Insights" description="Use Gemini AI to analyze your PDF or image instantly." />
      <div className="w-full md:w-1/2">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-200 mb-2 flex items-center gap-3">
            <FileScan className="w-8 h-8 text-purple-600 dark:text-purple-400" /> AI Insights
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Upload a PDF or Image. Ask Gemini to extract data, summarize, or analyze it instantly.</p>
        </div>

        {!file ? (
          <FileUploader onFileSelect={setFile} title="Select PDF or Image" accept=".pdf,.png,.jpg,.jpeg,.webp" />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-6">
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
              <button onClick={() => { setFile(null); setResult(null); }} className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 font-medium">Remove</button>
            </div>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">What do you want to know?</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all mb-4 min-h-[100px] resize-y"
              placeholder="E.g., Summarize this in 3 bullet points."
            />

            <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700/50 rounded-xl mb-6 cursor-pointer hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={highThinking}
                onChange={(e) => setHighThinking(e.target.checked)}
                className="w-5 h-5 text-purple-600 dark:text-purple-400 rounded border-slate-300 dark:border-slate-700 focus:ring-purple-500"
              />
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-200">Enable High Thinking</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Uses Gemini Pro for complex reasoning (slower).</div>
              </div>
            </label>

            <button 
              onClick={handleAnalyze} 
              disabled={isThinking || !prompt.trim()}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isThinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
              {isThinking ? 'Analyzing Document...' : 'Analyze with AI'}
            </button>
          </motion.div>
        )}
      </div>

      <div className="w-full md:w-1/2">
        {result ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm min-h-[400px]">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" /> AI Response
            </h2>
            <div className="prose prose-slate prose-purple max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </motion.div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 border-dashed h-full min-h-[400px] flex flex-col items-center justify-center text-center text-slate-400">
            <Bot className="w-16 h-16 mb-4 opacity-50" />
            <p>Upload a document and ask a question<br/>to see AI insights here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
