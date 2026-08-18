const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. Update the state to include 'stats'
content = content.replace(
  "useState<'overview' | 'users' | 'activity' | 'developer'>('overview')",
  "useState<'overview' | 'users' | 'activity' | 'developer' | 'stats'>('overview')"
);

// Add toolStats state
content = content.replace(
  "const [tab, setTab] = useState",
  "const [toolStats, setToolStats] = useState<Record<string, number>>({});\n  const [tab, setTab] = useState"
);

// Add BarChart icon import
content = content.replace(
  "Users, Activity, Settings, Database, Loader2, Code, Image as ImageIcon",
  "Users, Activity, Settings, Database, Loader2, Code, Image as ImageIcon, BarChart"
);

// Fetch stats in useEffect
const fetchRegex = /const logsSnapshot = await getDocs\(logsQ\);/;
content = content.replace(fetchRegex, `const logsSnapshot = await getDocs(logsQ);\n        \n        const statsDoc = await getDoc(doc(db, 'stats', 'toolUsage'));\n        if (statsDoc.exists()) {\n          setToolStats(statsDoc.data() as Record<string, number>);\n        }`);

// Add the Stats tab button in navigation
const tabsRegex = /<button[\s\S]*?onClick=\{\(\) => setTab\('activity'\)\}[\s\S]*?<\/button>/;
content = content.replace(tabsRegex, (match) => {
  return `${match}\n          <button\n            onClick={() => setTab('stats')}\n            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors \${tab === 'stats' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}\`}\n          >\n            <BarChart className="w-5 h-5" />\n            <span className="font-medium">Tool Stats</span>\n          </button>`;
});

// Add the Stats tab content
const contentRegex = /\{tab === 'activity' && \([\s\S]*?<\/table>[\s]*<\/div>[\s]*\)\}/;
content = content.replace(contentRegex, (match) => {
  return `${match}\n\n          {tab === 'stats' && (\n            <div className="p-8">\n              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-6">Tool Usage Statistics</h2>\n              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">\n                {Object.entries(toolStats).sort((a,b) => b[1] - a[1]).map(([tool, count]) => (\n                  <div key={tool} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50">\n                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 capitalize">{tool.replace('_', ' ')}</h3>\n                    <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{count}</p>\n                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total visits/usages</p>\n                  </div>\n                ))}\n                {Object.keys(toolStats).length === 0 && (\n                  <p className="text-slate-500 dark:text-slate-400 col-span-full">No tool usage data found yet.</p>\n                )}\n              </div>\n            </div>\n          )}`;
});

fs.writeFileSync('src/pages/Admin.tsx', content);
