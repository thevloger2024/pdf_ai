const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Import
const importRegex = /const Edit = React.lazy\(\(\) => import\('\.\/pages\/Edit'\)\);/;
content = content.replace(importRegex, "const Edit = React.lazy(() => import('./pages/Edit'));\nconst Watermark = React.lazy(() => import('./pages/Watermark'));");

// 2. Add Route
const routeRegex = /<Route path="\/edit" element=\{<Edit user=\{user\} \/>\} \/>/;
content = content.replace(routeRegex, `<Route path="/edit" element={<Edit user={user} />} />\n            <Route path="/watermark" element={<Watermark user={user} />} />`);

// 3. Add to Navbar
const iconImportRegex = /SplitSquareHorizontal, FileDown, FileEdit, Sparkles, Menu, X, Languages \} from 'lucide-react';/;
content = content.replace(iconImportRegex, "SplitSquareHorizontal, FileDown, FileEdit, Sparkles, Menu, X, Languages, Droplets } from 'lucide-react';");

const navLinkRegex = /<Link to="\/edit"[^>]*>[\s\S]*?<\/Link>/;
content = content.replace(navLinkRegex, `<Link to="/edit" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"><FileEdit className="w-4 h-4" />{t('nav.edit')}</Link>\n            <Link to="/watermark" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"><Droplets className="w-4 h-4" />{t('nav.watermark')}</Link>`);

const mobileNavRegex = /<Link to="\/edit" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"><FileEdit className="w-5 h-5" \/>\{t\('nav.edit'\)\}<\/Link>/;
content = content.replace(mobileNavRegex, `<Link to="/edit" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"><FileEdit className="w-5 h-5" />{t('nav.edit')}</Link>\n              <Link to="/watermark" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"><Droplets className="w-5 h-5" />{t('nav.watermark')}</Link>`);

fs.writeFileSync('src/App.tsx', content);

let homeContent = fs.readFileSync('src/pages/Home.tsx', 'utf8');
const iconImportHomeRegex = /SplitSquareHorizontal, FileText, ArrowRight, Clock, Download, Trash2 \} from 'lucide-react';/;
homeContent = homeContent.replace(iconImportHomeRegex, "SplitSquareHorizontal, FileText, ArrowRight, Clock, Download, Trash2, Droplets } from 'lucide-react';");

const toolsRegex = /\{ id: 'edit', name: t\('tool\.edit'\)[\s\S]*?\n/;
homeContent = homeContent.replace(toolsRegex, `{ id: 'edit', name: t('tool.edit'), desc: t('tool.edit.desc'), icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/edit' },\n  { id: 'watermark', name: t('tool.watermark'), desc: t('tool.watermark.desc'), icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50', link: '/watermark' },\n`);

fs.writeFileSync('src/pages/Home.tsx', homeContent);
