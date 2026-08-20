const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Add FolderArchive to lucide-react imports
if (!content.includes('FolderArchive')) {
  content = content.replace(
    /import \{([^}]+)\} from 'lucide-react';/,
    (match, p1) => `import {${p1}, FolderArchive} from 'lucide-react';`
  );
}

// Add the tool to getTools
const getToolsMatch = "{ id: 'watermark', name: t('tool.watermark'), desc: t('tool.watermark.desc'), icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50', link: '/watermark' },";
const newTool = getToolsMatch + "\n  { id: 'rename', name: 'Batch Rename', desc: 'Rename multiple files simultaneously and download as a ZIP.', icon: FolderArchive, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/rename' },";
content = content.replace(getToolsMatch, newTool);

fs.writeFileSync('src/pages/Home.tsx', content, 'utf8');
