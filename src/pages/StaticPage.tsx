import { motion } from 'motion/react';

export default function StaticPage({ title, content }: { title: string, content: string }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-200 mb-8">{title}</h1>
        <div className="prose prose-slate prose-lg">
          <p>{content}</p>
        </div>
      </motion.div>
    </div>
  );
}
