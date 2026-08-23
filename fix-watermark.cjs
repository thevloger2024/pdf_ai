const fs = require('fs');
let text = fs.readFileSync('src/pages/Watermark.tsx', 'utf8');

if (!text.includes('ProgressBar')) {
  text = text.replace(
    "import { FileUploader } from '../components/FileUploader';",
    "import { FileUploader } from '../components/FileUploader';\nimport { ProgressBar } from '../components/ProgressBar';"
  );
}

if (!text.includes('const [progress, setProgress]')) {
  text = text.replace(
    "const [isProcessing, setIsProcessing] = useState(false);",
    "const [isProcessing, setIsProcessing] = useState(false);\n  const [progress, setProgress] = useState(0);\n  const [progressLabel, setProgressLabel] = useState('');"
  );
}

text = text.replace(
  "setIsProcessing(true);\n    try {",
  "setIsProcessing(true);\n    setProgress(0);\n    setProgressLabel('Starting watermark...');\n    try {"
);

const loopOld = "for (const pageIndex of pagesToWatermark) {";
const loopNew = "for (let i = 0; i < pagesToWatermark.length; i++) {\n        const pageIndex = pagesToWatermark[i];\n        setProgress((i / pagesToWatermark.length) * 100);\n        setProgressLabel(`Processing page ${i + 1} of ${pagesToWatermark.length}...`);";
text = text.replace(loopOld, loopNew);

text = text.replace(
  "</button>\n              </div>\n            </div>",
  "</button>\n              </div>\n              {isProcessing && (\n                <div className=\"mt-6\">\n                  <ProgressBar progress={progress} label={progressLabel} />\n                </div>\n              )}\n            </div>"
);

fs.writeFileSync('src/pages/Watermark.tsx', text, 'utf8');
