import React, { useState } from 'react';
import {
    ShoppingBag,
    Tag,
    Smartphone,
    Watch,
    Headphones,
    Camera
} from 'lucide-react';
import { useDragDrop } from '../../../hooks/useDragDrop';
import { motion, AnimatePresence } from 'framer-motion';

const ShoppingDemo = () => {
    // ----------------------------------------------------------------------------------
    // Scenario D-1: Add to Cart
    // ----------------------------------------------------------------------------------
    const [products, setProducts] = useState([
        { id: 'p1', name: 'Smart Phone', price: '$899', icon: Smartphone, color: 'text-blue-500' },
        { id: 'p2', name: 'Smart Watch', price: '$299', icon: Watch, color: 'text-orange-500' },
        { id: 'p3', name: 'Headphones', price: '$199', icon: Headphones, color: 'text-purple-500' },
        { id: 'p4', name: 'Camera', price: '$1299', icon: Camera, color: 'text-emerald-500' },
    ]);
    const [cartItems, setCartItems] = useState([]);
    const [cartAnimating, setCartAnimating] = useState(false);

    // ----------------------------------------------------------------------------------
    // Scenario D-2: Tagging
    // ----------------------------------------------------------------------------------
    const [tags] = useState([
        { id: 'tag-sale', label: 'Sale -20%', color: 'rose' },
        { id: 'tag-new', label: 'New Arrival', color: 'emerald' },
        { id: 'tag-best', label: 'Best Seller', color: 'amber' },
    ]);
    // Product -> Tags map
    const [productTags, setProductTags] = useState({
        'p1': [],
        'p2': [],
        'p3': [],
        'p4': [],
    });

    const dragDrop = useDragDrop({
        onDrop: (source, target) => {
            if (!source) return;

            // Case D-1: Product -> Cart
            // Cart target id is 'cart-zone'
            if (target && target.id === 'cart-zone') {
                // Check if it's a product
                const product = products.find(p => p.id === source.id);
                if (product) {
                    setCartItems(prev => [...prev, product]);
                    // Trigger cart animation
                    setCartAnimating(true);
                    setTimeout(() => setCartAnimating(false), 500);
                }
                return;
            }

            // Case D-2: Tag -> Product
            // Source is tag check
            if (source.id && source.id.startsWith('tag-')) {
                // Target is product
                if (target && productTags[target.id]) {
                    // Check duplicate
                    if (!productTags[target.id].find(t => t.id === source.id)) {
                        setProductTags(prev => ({
                            ...prev,
                            [target.id]: [...prev[target.id], source]
                        }));
                    }
                }
            }
        },
        getDragPreview: (item) => {
            // Differentiate preview based on type
            const el = document.createElement('div');

            if (item.id.startsWith('tag-')) {
                el.className = `px-3 py-1.5 rounded-full font-bold text-xs bg-white shadow-lg border-2 border-slate-200`;
                el.innerHTML = item.label;
                // Dynamic color classes is tricky with inline style vs className in simple 'createElement'
                // Just keeping it simple white pill for now
            } else {
                // Product preview
                el.className = 'bg-white p-2 rounded-xl shadow-2xl border border-slate-200 w-24 h-24 flex items-center justify-center';
                // We can't render react Icon here easily without ReactDOM, so simpler placeholder or image
                el.innerHTML = `<span class="text-3xl">📦</span>`;
            }
            return el;
        }
    });

    return (
        <div className="flex flex-col space-y-12 relative min-h-[500px]">

            {/* Scenario D-1: Add to Cart */}
            <div className="relative">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider">Drag to Cart</h3>
                    <div className="flex items-center space-x-2">
                        {/* Tags Source */}
                        {tags.map(tag => (
                            <div
                                key={tag.id}
                                draggable
                                onDragStart={(e) => dragDrop.handleDragStart(tag, e)}
                                onDragEnd={dragDrop.handleDragEnd}
                                className={`
                                      px-3 py-1 rounded-full text-xs font-bold cursor-grab border transition-all hover:scale-105 active:scale-95
                                      bg-${tag.color}-100 text-${tag.color}-600 border-${tag.color}-200
                                      dark:bg-${tag.color}-900/30 dark:text-${tag.color}-300 dark:border-${tag.color}-800
                                  `}
                                style={{
                                    // Fallback colors for tailwind strict scanning usually failing dynamic
                                    backgroundColor: tag.color === 'rose' ? '#ffe4e6' : tag.color === 'emerald' ? '#d1fae5' : '#fef3c7',
                                    color: tag.color === 'rose' ? '#e11d48' : tag.color === 'emerald' ? '#059669' : '#d97706',
                                    borderColor: 'transparent'
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <Tag className="w-3 h-3" />
                                    <span>{tag.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map(product => (
                        <motion.div
                            key={product.id}
                            draggable
                            onDragStart={(e) => dragDrop.handleDragStart(product, e)}
                            onDrop={(e) => dragDrop.handleDrop(product, e)} // Allow dropping tags
                            onDragOver={(e) => dragDrop.handleDragOver(product, e)}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group relative cursor-move"
                        >
                            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-slate-100 dark:bg-slate-700 ${product.color}`}>
                                <product.icon className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white mb-1">{product.name}</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{product.price}</p>

                            {/* Attached Tags Area */}
                            <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
                                <AnimatePresence>
                                    {productTags[product.id]?.map((tag, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0, x: 10 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            key={`${tag.id}-${idx}`}
                                            className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm"
                                        >
                                            {tag.label}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Cart Drop Zone (Floating or Fixed) */}
            <div className="absolute bottom-6 right-6 z-50">
                <motion.div
                    animate={cartAnimating ? { scale: [1, 1.2, 0.9, 1.1, 1], rotate: [0, -5, 5, -5, 0] } : {}}
                    onDragOver={(e) => {
                        e.preventDefault();
                        // Highlight or something? handled by framer mostly
                    }}
                    onDrop={(e) => dragDrop.handleDrop({ id: 'cart-zone' }, e)}
                    className={`
                        w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl cursor-default
                        border-4 ${dragDrop.dragOverItem?.id === 'cart-zone' ? 'border-white scale-110' : 'border-blue-700'}
                        transition-transform
                     `}
                >
                    <div className="relative">
                        <ShoppingBag className="w-8 h-8" />
                        {cartItems.length > 0 && (
                            <motion.span
                                key={cartItems.length}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-blue-600"
                            >
                                {cartItems.length}
                            </motion.span>
                        )}
                    </div>
                </motion.div>
                {cartItems.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-24 right-0 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4"
                    >
                        <h4 className="text-sm font-bold border-b border-slate-100 dark:border-slate-700 pb-2 mb-2 text-slate-800 dark:text-white">Cart Summary</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {cartItems.map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                                    <span className="font-mono text-slate-400">{item.price}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between font-bold text-blue-600">
                            <span>Total</span>
                            <span>
                                ${cartItems.reduce((acc, i) => acc + parseInt(i.price.slice(1)), 0)}
                            </span>
                        </div>
                    </motion.div>
                )}
            </div>

        </div>
    );
};

export default ShoppingDemo;
