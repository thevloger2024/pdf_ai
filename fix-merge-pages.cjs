const fs = require('fs');
let text = fs.readFileSync('src/pages/MergePages.tsx', 'utf8');

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
  "setIsProcessing(true);\n    setProgress(0);\n    setProgressLabel('Starting merge...');\n    try {"
);

const mergeLoopOld = "for (const item of files) {";
const mergeLoopNew = "for (let i = 0; i < files.length; i++) {\n        const item = files[i];\n        setProgress((i / files.length) * 100);\n        setProgressLabel(`Processing file ${i + 1} of ${files.length}...`);";
text = text.replace(mergeLoopOld, mergeLoopNew);

// Add progress bar in UI
text = text.replace(
  "</button>\n        </div>\n      )}",
  "</button>\n        </div>\n        {isProcessing && (\n          <div className=\"mt-6\">\n            <ProgressBar progress={progress} label={progressLabel} />\n          </div>\n        )}\n      )}"
);

fs.writeFileSync('src/pages/MergePages.tsx', text, 'utf8');
