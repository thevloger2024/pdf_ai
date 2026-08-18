const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace Header Logo/Title
content = content.replace(
  '<Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400 tracking-tight">\n            <FileText className="h-6 w-6" />\n            PDF AI\n          </Link>',
  `<Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400 tracking-tight">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg font-black text-xs">MRC</div>
            <span className="hidden sm:inline-block">Update Students</span>
          </Link>`
);

// Replace Footer Title
content = content.replace(
  '<div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-lg">\n            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />\n            PDF AI\n          </div>',
  `<div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
            <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded font-black text-[10px]">MRC</div>
            Update Students
          </div>`
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
