const fs = require('fs');
let code = fs.readFileSync('src/pages/SplitText.tsx', 'utf8');

// 1. Add zipUrl state
if (!code.includes('const [zipUrl, setZipUrl]')) {
  code = code.replace(
    "const [results, setResults] = useState<{name: string, url: string}[]>([]);",
    "const [results, setResults] = useState<{name: string, url: string}[]>([]);\n  const [zipUrl, setZipUrl] = useState<string | null>(null);"
  );
}

// 2. Reset zipUrl on handleFileSelect
code = code.replace(
  "setResults([]);",
  "setResults([]);\n    setZipUrl(null);"
);

// 3. Set zipUrl
code = code.replace(
  "const zipBlob = await zip.generateAsync({ type: 'blob' });",
  "const zipBlob = await zip.generateAsync({ type: 'blob' });\n      setZipUrl(URL.createObjectURL(zipBlob));"
);

// 4. Update downloadAll method to use zipUrl instead of staggered downloads
const oldDownloadAll = `const downloadAll = () => {
    results.forEach(res => {
      const a = document.createElement('a');
      a.href = res.url;
      a.download = res.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
    toast.success('Downloads started!');
  };`;

const newDownloadAll = `const downloadAll = () => {
    if (zipUrl && file) {
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = \`split_\${file.name}.zip\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Downloaded archive successfully!');
    }
  };`;
  
code = code.replace(oldDownloadAll, newDownloadAll);

// 5. Update UI "Process Another File" to also reset zipUrl
code = code.replace(
  "onClick={() => {setFile(null); setResults([]);}}",
  "onClick={() => {setFile(null); setResults([]); setZipUrl(null);}}"
);

// 6. Fix "Download All" button in UI to be more prominent and explicitly say "(.zip)"
code = code.replace(
  "<Download className=\"w-4 h-4\" /> Download All",
  "<Download className=\"w-4 h-4\" /> Download All (.zip)"
);

fs.writeFileSync('src/pages/SplitText.tsx', code, 'utf8');
