const fs = require('fs');

let content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const enWatermark = `    'nav.watermark': 'Watermark',\n    'tool.watermark': 'Add Watermark',\n    'tool.watermark.desc': 'Add custom text watermarks to your PDF pages easily.',\n`;
const hiWatermark = `    'nav.watermark': 'वाटरमार्क (Watermark)',\n    'tool.watermark': 'वाटरमार्क जोड़ें',\n    'tool.watermark.desc': 'अपने PDF पृष्ठों में आसानी से कस्टम टेक्स्ट वाटरमार्क जोड़ें।',\n`;

content = content.replace("'nav.edit': 'Edit',", "'nav.edit': 'Edit',\n" + enWatermark);
content = content.replace("'nav.edit': 'संपादित करें (Edit)',", "'nav.edit': 'संपादित करें (Edit)',\n" + hiWatermark);

fs.writeFileSync('src/i18n/translations.ts', content);
