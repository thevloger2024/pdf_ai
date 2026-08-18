const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const oldRender = `<div className="relative z-10 flex flex-col h-full bg-white dark:bg-slate-800/90 transition-transform duration-300 group-hover:-translate-y-2">`;
const newRender = `<div className="relative z-10 flex flex-col h-full transition-transform duration-300 group-hover:-translate-y-4">`;

content = content.replace(oldRender, newRender);

fs.writeFileSync('src/pages/Home.tsx', content, 'utf8');
