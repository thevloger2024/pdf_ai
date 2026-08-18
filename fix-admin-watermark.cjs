const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const toolNamesRegex = /const TOOL_NAMES: Record<string, string> = \{([\s\S]*?)\};/;

content = content.replace(toolNamesRegex, (match, p1) => {
    if (!p1.includes('watermark')) {
        return `const TOOL_NAMES: Record<string, string> = {${p1}  watermark: 'Add Watermark',\n};`;
    }
    return match;
});

const actionMapRegex = /const actionMap: Record<string, \{ icon: any, label: string \}> = \{([\s\S]*?)\};/;
content = content.replace(actionMapRegex, (match, p1) => {
    if (!p1.includes('watermark_pdf')) {
        return `const actionMap: Record<string, { icon: any, label: string }> = {${p1}    watermark_pdf: { icon: Edit3, label: 'Added Watermark' },\n  };`;
    }
    return match;
});


fs.writeFileSync('src/pages/Admin.tsx', content);
