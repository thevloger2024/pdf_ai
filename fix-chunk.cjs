const fs = require('fs');
let text = fs.readFileSync('src/pages/Chunk.tsx', 'utf8');

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
  "setIsProcessing(true);\n    setProgress(0);\n    setProgressLabel('Loading PDF...');\n    try {"
);

const chunkLoopOld = "while (startIdx < pageCount) {";
const chunkLoopNew = "while (startIdx < pageCount) {\n        setProgress((startIdx / pageCount) * 100);\n        setProgressLabel(`Creating chunk ${chunkNum}...`);";
text = text.replace(chunkLoopOld, chunkLoopNew);

// Add progress bar in UI
text = text.replace(
  "</button>\n          </div>\n        </div>",
  "</button>\n          </div>\n          {isProcessing && (\n            <div className=\"mt-6\">\n              <ProgressBar progress={progress} label={progressLabel} />\n            </div>\n          )}\n        </div>"
);

fs.writeFileSync('src/pages/Chunk.tsx', text, 'utf8');
