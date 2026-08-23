const fs = require('fs');

let splitText = fs.readFileSync('src/pages/SplitText.tsx', 'utf8');

// Import
if (!splitText.includes('ProgressBar')) {
  splitText = splitText.replace(
    "import { FileUploader } from '../components/FileUploader';",
    "import { FileUploader } from '../components/FileUploader';\nimport { ProgressBar } from '../components/ProgressBar';"
  );
}

// State
if (!splitText.includes('const [progress, setProgress]')) {
  splitText = splitText.replace(
    "const [isProcessing, setIsProcessing] = useState(false);",
    "const [isProcessing, setIsProcessing] = useState(false);\n  const [progress, setProgress] = useState(0);"
  );
}

// Reset state
splitText = splitText.replace(
  "setIsProcessing(true);",
  "setIsProcessing(true);\n    setProgress(0);"
);

// md headers loop
splitText = splitText.replace(
  "currentPart = header + content;\n          if (i % 50 === 0) await new Promise(r => setTimeout(r, 0));",
  "currentPart = header + content;\n          if (i % 50 === 0) {\n            setProgress((i / parts.length) * 100);\n            await new Promise(r => setTimeout(r, 0));\n          }"
);

// Lines loop
splitText = splitText.replace(
  "// Yield to UI to prevent massive files from crashing browser\n          await new Promise(r => setTimeout(r, 0));\n        }\n      }",
  "setProgress((currentIndex / text.length) * 100);\n          // Yield to UI to prevent massive files from crashing browser\n          await new Promise(r => setTimeout(r, 0));\n        }\n      }"
);

// Render Progress Bar
splitText = splitText.replace(
  "{isProcessing ? 'Processing...' : 'Split File'}\n            </button>\n          </div>",
  "{isProcessing ? 'Processing...' : 'Split File'}\n            </button>\n          </div>\n          {isProcessing && (\n            <div className=\"mt-6\">\n              <ProgressBar progress={progress} label=\"Processing file...\" />\n            </div>\n          )}"
);

fs.writeFileSync('src/pages/SplitText.tsx', splitText, 'utf8');
