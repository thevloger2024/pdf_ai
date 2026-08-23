const fs = require('fs');
let code = fs.readFileSync('src/pages/Compress.tsx', 'utf8');

code = code.replace(
  "Note: Extreme compression requires image downsampling which is limited in the browser environment.",
  "Note: To achieve significant file size reduction, the PDF pages are rasterized into optimized images. This removes text selectability but drastically reduces size."
);

// We should also remove the amber warning if it says "The file size didn't reduce much." because now it WILL reduce much.
// But it's fine to leave the warning if it somehow fails to compress.

fs.writeFileSync('src/pages/Compress.tsx', code, 'utf8');
