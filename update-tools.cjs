const fs = require('fs');

function addTracking(file, toolId) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('logToolAccess')) return;
  
  // Add import
  content = content.replace(
    "import { logActivity",
    "import { logActivity, logToolAccess"
  );
  if (!content.includes('logToolAccess')) {
     content = content.replace(
       "import { db } from '../lib/firebase';",
       "import { db, logToolAccess } from '../lib/firebase';"
     );
  }

  if(!content.includes("import { useEffect")) {
    content = content.replace("import { useState", "import { useState, useEffect");
  }

  // Find component declaration
  const componentRegex = /export default function \w+\(.*\) {/;
  
  content = content.replace(componentRegex, (match) => {
    return `${match}\n  useEffect(() => {\n    logToolAccess('${toolId}');\n  }, []);\n`;
  });

  fs.writeFileSync(file, content);
}

// Map files to tool IDs
addTracking('src/pages/Compress.tsx', 'compress');
addTracking('src/pages/Split.tsx', 'split');
addTracking('src/pages/Chunk.tsx', 'chunk');
addTracking('src/pages/Edit.tsx', 'edit');
addTracking('src/pages/Analyze.tsx', 'analyze');

// ConvertTool and CompressTool are dynamic based on URL params or info
// We'll just track 'convert' and 'compress' or their specific type.
// Actually, let's track the specific tool info in CompressTool and ConvertTool.
