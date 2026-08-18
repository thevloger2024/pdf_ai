const fs = require('fs');

function fix(filename) {
  let content = fs.readFileSync(filename, 'utf8');
  content = content.replace("import { useAuth } from '../hooks/useAuth';", "import { User } from '../types';");
  content = content.replace("export default function MergePdfs() {", "export default function MergePdfs({ user }: { user: User | null }) {");
  content = content.replace("const { user } = useAuth();", "");
  content = content.replace("export default function MergePages() {", "export default function MergePages({ user }: { user: User | null }) {");
  fs.writeFileSync(filename, content, 'utf8');
}

fix('src/pages/MergePdfs.tsx');
fix('src/pages/MergePages.tsx');
