const fs = require('fs');

let content = fs.readFileSync('src/pages/MergePages.tsx', 'utf8');

// Imports
content = content.replace(
  "import { motion } from 'motion/react';",
  "import { motion } from 'motion/react';\nimport { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';\nimport { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';\nimport { CSS } from '@dnd-kit/utilities';\nimport { GripVertical } from 'lucide-react';"
);

// Add SortableItem component
const sortableComponent = `
function SortablePageItem({ id, item, onRemove, onRangeChange }: { id: string, item: any, onRemove: () => void, onRangeChange: (val: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={\`flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border \${isDragging ? 'border-pink-500 shadow-md' : 'border-slate-100 dark:border-slate-700/50'} relative\`}>
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
        <button {...attributes} {...listeners} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg shrink-0">
          <FileIcon className="w-5 h-5" />
        </div>
        <div className="truncate min-w-0">
          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{item.file.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
        <div className="flex-1 sm:w-48">
          <input 
            type="text" 
            value={item.pageRange}
            onChange={(e) => onRangeChange(e.target.value)}
            // Prevent pointer events to bubble up when typing so DND doesn't interfere with input focus
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="e.g. 1, 3, 5-10"
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onRemove} className="p-1.5 text-red-400 hover:text-red-600 ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
`;

content = content.replace("export default function MergePages", sortableComponent + "\nexport default function MergePages");

// Update interface to include id
content = content.replace(
  "interface FileWithPages {\n  file: File;\n  pageRange: string;\n}",
  "interface FileWithPages {\n  id: string;\n  file: File;\n  pageRange: string;\n}"
);

// Update handleFileChange
content = content.replace(
  "setFiles(prev => [...prev, ...newFiles.map(f => ({ file: f, pageRange: '' }))]);",
  "setFiles(prev => [...prev, ...newFiles.map(f => ({ id: Math.random().toString(36).substring(7), file: f, pageRange: '' }))]);"
);

// Remove moveFile method and update removeFile
content = content.replace(
  /const removeFile = .*?\n  };\n/,
  "const removeFile = (idToRemove: string) => {\n    setFiles(prev => prev.filter(f => f.id !== idToRemove));\n  };\n"
);
content = content.replace(/const moveFile = [\s\S]*?};\n\n/, ""); // Remove moveFile entirely

// Update updatePageRange
content = content.replace(
  /const updatePageRange = \(index: number, value: string\) => {[\s\S]*?};\n/,
  `const updatePageRange = (id: string, value: string) => {
    const newFiles = [...files];
    const targetIdx = newFiles.findIndex(f => f.id === id);
    if(targetIdx > -1) {
      newFiles[targetIdx].pageRange = value;
      setFiles(newFiles);
    }
  };\n`
);

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

// Update JSX
const oldList = /<div className="space-y-4 mb-8">[\s\S]*?<\/div>\s*<button\s*onClick={handleMerge}/;
const newList = `<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4 mb-8">
                    {files.map((item) => (
                      <SortablePageItem 
                        key={item.id} 
                        id={item.id} 
                        item={item} 
                        onRemove={() => removeFile(item.id)} 
                        onRangeChange={(val) => updatePageRange(item.id, val)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <button
                onClick={handleMerge}`;

content = content.replace(oldList, newList);

fs.writeFileSync('src/pages/MergePages.tsx', content, 'utf8');
