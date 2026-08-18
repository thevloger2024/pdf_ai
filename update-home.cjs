const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const newGetTools = `const getTools = (t: any) => [
  { 
    id: 'compress', name: t('tool.compress'), desc: t('tool.compress.desc'), icon: FileMinus, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/compress-hub',
    subTools: [
      { name: 'PDF', link: '/compress' },
      { name: 'Images (PNG/JPG)', link: '/compress-tool/png' },
      { name: 'Documents (Excel/PPT/MD)', link: '/compress-tool/excel' }
    ]
  },
  { 
    id: 'merge', name: 'Merge PDF', desc: 'Combine multiple PDFs or pages into a single document.', icon: Combine, color: 'text-purple-600', bg: 'bg-purple-50', link: '/merge-hub',
    subTools: [
      { name: 'Merge Multiple PDFs', link: '/merge-pdfs' },
      { name: 'Merge Pages to PDF', link: '/merge-pages' }
    ]
  },
  { 
    id: 'convert', name: t('nav.convert'), desc: 'Convert files to and from PDF format.', icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50', link: '/convert',
    subTools: [
      { name: 'Word/Excel/PPT to PDF', link: '/convert' },
      { name: 'PDF to Images', link: '/convert' }
    ]
  },
  { 
    id: 'split', name: t('tool.split'), desc: t('tool.split.desc'), icon: SplitSquareHorizontal, color: 'text-amber-600', bg: 'bg-amber-50', link: '/split',
    subTools: [
      { name: 'Extract Pages', link: '/split' },
      { name: 'Save as separate files', link: '/split' }
    ]
  },
  { 
    id: 'chunk', name: t('tool.chunk'), desc: t('tool.chunk.desc'), icon: FileDown, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/chunk',
    subTools: [
      { name: 'Split by size', link: '/chunk' },
      { name: 'Split by page count', link: '/chunk' }
    ]
  },
  { 
    id: 'edit', name: t('tool.edit'), desc: t('tool.edit.desc'), icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50', link: '/edit',
    subTools: [
      { name: 'Edit Text', link: '/edit' },
      { name: 'Modify Content', link: '/edit' }
    ]
  },
  { 
    id: 'watermark', name: t('tool.watermark'), desc: t('tool.watermark.desc'), icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50', link: '/watermark',
    subTools: [
      { name: 'Add Text Watermark', link: '/watermark' },
      { name: 'Confidential Stamps', link: '/watermark' }
    ]
  },
];`;

content = content.replace(/const getTools = \(t: any\) => \[\s*[\s\S]*?\];/g, newGetTools);

content = content.replace("import { FileDown, FileMinus, FileScan, SplitSquareHorizontal, FileText, ArrowRight, Clock, Download, Trash2, Droplets, Combine } from 'lucide-react';", 
"import { FileDown, FileMinus, FileScan, SplitSquareHorizontal, FileText, ArrowRight, Clock, Download, Trash2, Droplets, Combine, RefreshCw, ChevronRight } from 'lucide-react';");

const renderRegex = /<Link to=\{tool\.link\} className="group flex flex-col[\s\S]*?<\/Link>/g;
const newRender = `<Link to={tool.link} className="group relative flex flex-col h-full bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative z-10 flex flex-col h-full bg-white dark:bg-slate-800/90 transition-transform duration-300 group-hover:-translate-y-2">
                  <div className={\`w-14 h-14 rounded-xl \${tool.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform\`}>
                    <Icon className={\`w-7 h-7 \${tool.color}\`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-2">{tool.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1 group-hover:opacity-0 transition-opacity duration-300">{tool.desc}</p>
                </div>
                
                {/* Hover Content */}
                <div className="absolute left-0 right-0 bottom-0 p-6 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-in-out bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 z-20 h-auto min-h-[50%] flex flex-col justify-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Included Tools:</h4>
                  <ul className="space-y-2 mb-4">
                    {tool.subTools?.map((sub, idx) => (
                      <li key={idx} className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                        <ChevronRight className="w-3 h-3 mr-1.5 text-blue-500" />
                        {sub.name}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-bold text-sm mt-auto">
                    Open Tool <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>`;

content = content.replace(renderRegex, newRender);

fs.writeFileSync('src/pages/Home.tsx', content, 'utf8');
