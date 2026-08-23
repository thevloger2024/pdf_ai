const fs = require('fs');
let content = fs.readFileSync('src/pages/ConvertTool.tsx', 'utf8');

// 1. Add import ProgressBar
if (!content.includes('ProgressBar')) {
  content = content.replace(
    "import { FileUploader } from '../components/FileUploader';",
    "import { FileUploader } from '../components/FileUploader';\nimport { ProgressBar } from '../components/ProgressBar';"
  );
}

// 2. Add state
if (!content.includes('const [progress, setProgress] = useState<number>(0);')) {
  content = content.replace(
    "const [isProcessing, setIsProcessing] = useState(false);",
    "const [isProcessing, setIsProcessing] = useState(false);\n  const [progress, setProgress] = useState<number>(0);\n  const [progressLabel, setProgressLabel] = useState<string>('');"
  );
}

// 3. Reset state in handleConvert
content = content.replace(
  "setIsProcessing(true);\n    setResult(null);",
  "setIsProcessing(true);\n    setProgress(0);\n    setProgressLabel('Reading file...');\n    setResult(null);"
);

// 4. Inject progress bar UI
content = content.replace(
  /<\/button>\n              <\/div>\n            <\/div>/g,
  `</button>\n              </div>\n              \n              {isProcessing && (\n                <div className="mt-6 text-left">\n                  <ProgressBar progress={progress} label={progressLabel} />\n                </div>\n              )}\n            </div>`
);

fs.writeFileSync('src/pages/ConvertTool.tsx', content, 'utf8');
