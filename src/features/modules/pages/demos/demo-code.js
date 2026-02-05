export const SINGLE_FILE_CODE = `// React 相关
import React, { useState } from 'react'

// 第三方库
import { 
    FileText, 
    Image as ImageIcon,
    Music,
    Video,
    Archive
} from 'lucide-react'

// 内部模块（路径别名）
import { useDragDrop } from '@hooks/useDragDrop'

const SingleFileTransferDemo = () => {
    // ... items state
    const dragDrop = useDragDrop({
        onDrop: (source, target) => {
            // Transfer logic
        }
    });

    return (
        <div className="flex gap-8">
            {/* Draggable Items */}
            <div className="space-y-3">
                {items.map(item => (
                    <div draggable {...dragListeners}>
                        {item.name}
                    </div>
                ))}
            </div>
            
            {/* Drop Zone */}
            <div className="border-dashed p-8">
                Drop Here
            </div>
        </div>
    );
};`;

export const MULTI_FILE_CODE = `// Advanced batch selection and drag preview logic
// ... (Similar to single file but with multi-select state)
`;

export const SORTABLE_CODE = `const SortableListDemo = () => {
    const [items, setItems] = useState(['Prototyping', 'Development', ...]);
    
    // ... useDragDrop hook with reorder logic
    
    return (
        <div className="space-y-2">
            {items.map((item) => (
                <div draggable className="cursor-move ...">
                    {item}
                </div>
            ))}
        </div>
    );
};`;

export const KANBAN_CODE = `const KanbanDemo = () => {
    const [columns, setColumns] = useState({
        todo: { title: 'To Do', items: [...] },
        done: { title: 'Done', items: [...] }
    });

    const dragDrop = useDragDrop({
        onDrop: (source, target) => {
             // Logic to move items between columns
             // or reorder within same column
        }
    });

    return (
        <div className="flex space-x-6">
            {Object.entries(columns).map(([id, col]) => (
                <div key={id} className="w-72 bg-slate-100 rounded-2xl">
                     <h3>{col.title}</h3>
                     {col.items.map(item => (
                         <DraggableItem key={item.id} item={item} />
                     ))}
                </div>
            ))}
        </div>
    )
}`

export const LAYOUT_CODE = `const LayoutBuilderDemo = () => {
    // Tools sidebar + Grid state
    const dragDrop = useDragDrop({
        onDrop: (source, target) => {
            if (source.isTool) {
                // Instantiate new component on grid
            } else {
                // Reorder existing grid items
            }
        }
    });

    return (
        <div className="flex">
            <SidebarTools />
            <GridCanvas items={gridItems} />
        </div>
    );
};`;

export const SHOPPING_CODE = `const ShoppingDemo = () => {
    // Products + Tags + Cart State
    const dragDrop = useDragDrop({
        onDrop: (source, target) => {
             if (target.id === 'cart-zone') {
                 addToCart(source);
             }
             if (source.isTag && target.isProduct) {
                 addTagToProduct(target, source);
             }
        }
    });

    return (
        <div>
             <ProductGrid />
             <CartDropZone />
        </div>
    );
};`;

export const FLOWCHART_CODE = `const FlowchartDemo = () => {
    // Custom mouse event handling for Bezier curves
    // Not using standard Drag and Drop API for connectors to ensure smooth drawing
    
    const [connections, setConnections] = useState([]);
    
    return (
        <div 
            onMouseMove={handleDraw} 
            onMouseUp={finishConnection}
            className="relative"
        >
            <SVGOverlay lines={connections} />
            {nodes.map(node => (
                <Node 
                   onMouseDown={startConnection} 
                   {...node} 
                />
            ))}
        </div>
    );
};`;
