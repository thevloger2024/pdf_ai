const fs = require('fs');

function fixCompress() {
  let content = fs.readFileSync('src/pages/CompressTool.tsx', 'utf8');
  content = content.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';");
  
  const effect = `  useEffect(() => {\n    if (type) logToolAccess('compress_' + type);\n  }, [type]);`;
  content = content.replace(effect, "");
  
  content = content.replace("const { type } = useParams<{ type: string }>();", "const { type } = useParams<{ type: string }>();\n" + effect);
  fs.writeFileSync('src/pages/CompressTool.tsx', content);
}

function fixConvert() {
  let content = fs.readFileSync('src/pages/ConvertTool.tsx', 'utf8');
  const effect = `  useEffect(() => {\n    if (type) logToolAccess('convert_' + type);\n  }, [type]);`;
  content = content.replace(effect, "");
  
  content = content.replace("const { type } = useParams<{ type: string }>();", "const { type } = useParams<{ type: string }>();\n" + effect);
  fs.writeFileSync('src/pages/ConvertTool.tsx', content);
}

function fixEdit() {
  let content = fs.readFileSync('src/pages/Edit.tsx', 'utf8');
  content = content.replace("import { useState, useEffect, useEffect } from 'react';", "import { useState, useEffect } from 'react';");
  fs.writeFileSync('src/pages/Edit.tsx', content);
}

fixCompress();
fixConvert();
fixEdit();

