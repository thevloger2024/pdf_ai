const fs = require('fs');

let content = fs.readFileSync('src/pages/SplitPdf.tsx', 'utf8');

// Imports
content = content.replace(
  "import { motion } from 'motion/react';",
  "import { motion } from 'motion/react';\nimport { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';\nimport { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';\nimport { CSS } from '@dnd-kit/utilities';\nimport { GripHorizontal } from 'lucide-react';"
);

// Add SortableGridItem component
const sortableComponent = `
function SortableGridItem({ id, page, isSelected, onClick, onMouseEnter }: { id: string, page: number, isSelected: boolean, onClick: () => void, onMouseEnter: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="relative group touch-none">
      <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={\`w-full relative aspect-[1/1.4] rounded-lg border-2 flex items-center justify-center transition-all overflow-hidden \${
          isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
        } \${isDragging ? 'shadow-xl scale-105 border-blue-400' : ''}\`}
      >
        <span className={\`font-bold \${isSelected ? 'text-blue-600' : 'text-slate-400'}\`}>{page}</span>
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white z-10">
            <Check className="w-3 h-3" />
          </div>
        )}
      </button>
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute bottom-2 left-1/2 -translate-x-1/2 p-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <GripHorizontal className="w-4 h-4" />
      </div>
    </div>
  );
}
`;

content = content.replace("export default function SplitPdf", sortableComponent + "\nexport default function SplitPdf");

// Add pages state
content = content.replace(
  "const [pageCount, setPageCount] = useState<number>(0);",
  "const [pageCount, setPageCount] = useState<number>(0);\n  const [pagesOrder, setPagesOrder] = useState<string[]>([]);"
);

// Modify loadPdf to initialize pagesOrder
content = content.replace(
  "setPageCount(pdfDoc.getPageCount());",
  "const count = pdfDoc.getPageCount();\n      setPageCount(count);\n      setPagesOrder(Array.from({length: count}, (_, i) => String(i + 1)));"
);

// Modify togglePage to not sort
content = content.replace(
  "prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page].sort((a, b) => a - b)",
  "prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page]"
);

// Remove the old Select All that depends on pageCount
content = content.replace(
  "setSelectedPages(Array.from({length: pageCount}, (_, i) => i + 1))",
  "setSelectedPages(pagesOrder.map(Number))"
);

// Handle drag end
const handleDragEnd = `
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPagesOrder((items) => {
        const oldIndex = items.indexOf(String(active.id));
        const newIndex = items.indexOf(String(over.id));
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
`;

content = content.replace("const handleExtract = async () => {", handleDragEnd + "\n  const handleExtract = async () => {");

// Update handleExtract to map selectedPages according to their order in pagesOrder
// The selection is just filtering pagesOrder to keep only selected ones
content = content.replace(
  "const copiedPages = await newPdf.copyPages(pdfDoc, selectedPages.map(p => p - 1));",
  "const orderedSelectedPages = pagesOrder.map(Number).filter(p => selectedPages.includes(p));\n      const copiedPages = await newPdf.copyPages(pdfDoc, orderedSelectedPages.map(p => p - 1));"
);

// Update JSX
const oldGrid = /<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mb-8 max-h-\[50vh\] overflow-y-auto p-2">[\s\S]*?<\/div>\s*<div className="flex justify-between items-center pt-6/;
const newGrid = `<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={pagesOrder} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mb-8 max-h-[50vh] overflow-y-auto p-2">
                {pagesOrder.map(id => {
                  const page = Number(id);
                  const isSelected = selectedPages.includes(page);
                  return (
                    <SortableGridItem 
                      key={id} 
                      id={id} 
                      page={page} 
                      isSelected={isSelected} 
                      onClick={() => togglePage(page)} 
                      onMouseEnter={() => setPreviewPage(page)} 
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
          <div className="flex justify-between items-center pt-6`;

content = content.replace(oldGrid, newGrid);

fs.writeFileSync('src/pages/SplitPdf.tsx', content, 'utf8');
