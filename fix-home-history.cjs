const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Import HistoryModal
if (!content.includes('HistoryModal')) {
  content = content.replace(
    "import { getHistory, clearHistory, HistoryItem } from '../lib/storage';",
    "import { getHistory, clearHistory, HistoryItem } from '../lib/storage';\nimport { HistoryModal } from '../components/HistoryModal';"
  );
}
if (!content.includes('HistoryModal')) {
    // If it didn't match the exact import line, fallback:
    content = "import { HistoryModal } from '../components/HistoryModal';\n" + content;
}

// Add state for modal
if (!content.includes('isHistoryModalOpen')) {
  content = content.replace(
    "const [history, setHistory] = useState<HistoryItem[]>([]);",
    "const [history, setHistory] = useState<HistoryItem[]>([]);\n  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);"
  );
}

// Add "All History" button next to "Clear History"
const clearHistoryButton = `<button
              onClick={handleClearHistory}
              className="text-sm flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear History
            </button>`;

const newButtons = `<div className="flex items-center gap-4">
              <button
                onClick={() => setIsHistoryModalOpen(true)}
                className="text-sm flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                <Clock className="w-4 h-4" /> All History
              </button>
              <button
                onClick={handleClearHistory}
                className="text-sm flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Clear History
              </button>
            </div>`;

content = content.replace(clearHistoryButton, newButtons);

// Inject HistoryModal before final div closure
content = content.replace(
  "    </div>\n  );\n}",
  "      <HistoryModal \n        isOpen={isHistoryModalOpen} \n        onClose={() => setIsHistoryModalOpen(false)} \n        history={history} \n        onClearHistory={handleClearHistory} \n      />\n    </div>\n  );\n}"
);

fs.writeFileSync('src/pages/Home.tsx', content, 'utf8');
