const fs = require('fs');

let content = fs.readFileSync('src/pages/MergePdfs.tsx', 'utf8');

// Imports
content = content.replace(
  "import { motion } from 'motion/react';",
  "import { motion } from 'motion/react';\nimport { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';\nimport { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';\nimport { CSS } from '@dnd-kit/utilities';\nimport { GripVertical } from 'lucide-react';"
);

// Add SortableItem component
const sortableComponent = `
function SortableFileItem({ id, file, onRemove }: { id: string, file: File, onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={\`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border \${isDragging ? 'border-purple-500 shadow-md' : 'border-slate-100 dark:border-slate-700/50'} relative\`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <button {...attributes} {...listeners} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg shrink-0">
          <FileIcon className="w-5 h-5" />
        </div>
        <div className="truncate">
          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{file.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onRemove} className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
`;

content = content.replace("export default function MergePdfs", sortableComponent + "\nexport default function MergePdfs");

// Change state to include id
content = content.replace(
  "const [files, setFiles] = useState<File[]>([]);",
  "const [files, setFiles] = useState<{id: string, file: File}[]>([]);"
);

// Update handleFileChange
content = content.replace(
  "setFiles(prev => [...prev, ...newFiles]);",
  "setFiles(prev => [...prev, ...newFiles.map(f => ({ id: Math.random().toString(36).substring(7), file: f }))]);"
);

// Remove moveFile method and update removeFile
content = content.replace(
  /const removeFile = .*?\n  };\n/,
  "const removeFile = (idToRemove: string) => {\n    setFiles(prev => prev.filter(f => f.id !== idToRemove));\n  };\n"
);
content = content.replace(/const moveFile = [\s\S]*?};\n\n/, ""); // Remove moveFile entirely

// Handle drag end
const handleDragEnd = `
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
`;

content = content.replace("const handleMerge = async () => {", handleDragEnd + "\n  const handleMerge = async () => {");

// Update handleMerge usage of files
content = content.replace("for (const file of files) {", "for (const item of files) {");
content = content.replace("const arrayBuffer = await file.arrayBuffer();", "const arrayBuffer = await item.file.arrayBuffer();");
content = content.replace("const newName = `merged_${files[0].name.replace('.pdf', '')}_and_${files.length - 1}_others.pdf`;", "const newName = `merged_${files[0].file.name.replace('.pdf', '')}_and_${files.length - 1}_others.pdf`;");

// Update JSX
const oldList = /<div className="space-y-3 mb-8">[\s\S]*?<\/div>\s*<button\s*onClick={handleMerge}/;
const newList = `<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3 mb-8">
                    {files.map((item) => (
                      <SortableFileItem key={item.id} id={item.id} file={item.file} onRemove={() => removeFile(item.id)} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <button
                onClick={handleMerge}`;

content = content.replace(oldList, newList);

fs.writeFileSync('src/pages/MergePdfs.tsx', content, 'utf8');
