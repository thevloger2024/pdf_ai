const fs = require('fs');

function addDynamicTracking(file, prefix) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('logToolAccess')) return;
  
  // Add import
  content = content.replace(
    "import { logActivity",
    "import { logActivity, logToolAccess"
  );

  // Find component declaration
  const componentRegex = /export default function \w+\(.*\) {/;
  
  content = content.replace(componentRegex, (match) => {
    return `${match}\n  useEffect(() => {\n    if (type) logToolAccess('${prefix}_' + type);\n  }, [type]);\n`;
  });

  fs.writeFileSync(file, content);
}

addDynamicTracking('src/pages/CompressTool.tsx', 'compress');
addDynamicTracking('src/pages/ConvertTool.tsx', 'convert');

