const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Revert title
content = content.replace(
  `<div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium text-sm border border-blue-100 dark:border-blue-800">
              By MRC.dev
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Update Students</span>
          </h1>`,
  `<h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">PDF AI</span>
          </h1>`
);

// Revert getTools array
const newGetTools = `const getTools = (t: any) => [
  { id: 'compress', name: t('tool.compress'), desc: t('tool.compress.desc'), icon: FileMinus, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/compress-hub' },
  { id: 'merge', name: 'Merge PDF', desc: 'Combine multiple PDFs or pages into a single document.', icon: Combine, color: 'text-purple-600', bg: 'bg-purple-50', link: '/merge-hub' },
  { id: 'split', name: t('tool.split'), desc: t('tool.split.desc'), icon: SplitSquareHorizontal, color: 'text-amber-600', bg: 'bg-amber-50', link: '/split' },
  { id: 'chunk', name: t('tool.chunk'), desc: t('tool.chunk.desc'), icon: FileDown, color: 'text-blue-600', bg: 'bg-blue-50', link: '/chunk' },
  { id: 'edit', name: t('tool.edit'), desc: t('tool.edit.desc'), icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/edit' },
  { id: 'watermark', name: t('tool.watermark'), desc: t('tool.watermark.desc'), icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50', link: '/watermark' },
];`;

content = content.replace(/const getTools = \(t: any\) => \[\s*[\s\S]*?\];/g, newGetTools);

// Revert Render
const renderRegex = /<Link to=\{tool\.link\} className="group relative flex flex-col h-full bg-white dark:bg-slate-800\/90[\s\S]*?<\/Link>/g;
const newRender = `<Link to={tool.link} className="group flex flex-col h-full bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div className={\`w-14 h-14 rounded-xl \${tool.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform\`}>
                  <Icon className={\`w-7 h-7 \${tool.color}\`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-2">{tool.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1">{tool.desc}</p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm mt-auto">
                  Open Tool <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>`;

content = content.replace(renderRegex, newRender);

fs.writeFileSync('src/pages/Home.tsx', content, 'utf8');
