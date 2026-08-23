const fs = require('fs');
let code = fs.readFileSync('src/pages/Chunk.tsx', 'utf8');

// 1. Add zipUrl state
code = code.replace(
  "const [resultUrls, setResultUrls] = useState<{url: string, name: string}[]>([]);",
  "const [resultUrls, setResultUrls] = useState<{url: string, name: string}[]>([]);\n  const [zipUrl, setZipUrl] = useState<string | null>(null);"
);

// 2. Reset zipUrl on escape
code = code.replace(
  "setResultUrls([]);",
  "setResultUrls([]);\n      setZipUrl(null);"
);

// 3. Update onSave keyboard shortcut
const oldOnSave = `onSave: () => {
      if (resultUrls.length > 0) {
        resultUrls.forEach((res, index) => {
          setTimeout(() => {
            const a = document.createElement('a');
            a.href = res.url;
            a.download = res.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }, index * 200); // Stagger downloads
        });
        toast.success('Downloads started successfully!');
      } else if (file && !isProcessing && pagesPerChunk >= 1) {
        handleChunk();
      }
    }`;

const newOnSave = `onSave: () => {
      if (zipUrl && file) {
        const a = document.createElement('a');
        a.href = zipUrl;
        a.download = \`chunked_\${file.name}.zip\`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Downloaded archive successfully!');
      } else if (file && !isProcessing && pagesPerChunk >= 1) {
        handleChunk();
      }
    }`;

code = code.replace(oldOnSave, newOnSave);

// 4. Set zipUrl
code = code.replace(
  "const zipBlob = await zip.generateAsync({ type: 'blob' });",
  "const zipBlob = await zip.generateAsync({ type: 'blob' });\n      setZipUrl(URL.createObjectURL(zipBlob));"
);

// 5. Add "Download All (.zip)" button in UI
const oldButtons = `<div className="flex justify-center">
            <button onClick={() => { setFile(null); setResultUrls([]); }} className="px-8 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              Process Another File
            </button>
          </div>`;

const newButtons = `<div className="flex flex-col sm:flex-row justify-center gap-4">
            {zipUrl && (
              <a href={zipUrl} onClick={() => toast.success('Downloaded archive successfully!')} download={\`chunked_\${file?.name}.zip\`} className="flex-1 max-w-[250px] px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2">
                <Download className="w-5 h-5" /> Download All (.zip)
              </a>
            )}
            <button onClick={() => { setFile(null); setResultUrls([]); setZipUrl(null); }} className="flex-1 max-w-[250px] px-8 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              Process Another File
            </button>
          </div>`;
          
code = code.replace(oldButtons, newButtons);

fs.writeFileSync('src/pages/Chunk.tsx', code, 'utf8');
