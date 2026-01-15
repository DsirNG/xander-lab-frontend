import React, { useState, useRef, useEffect } from 'react';
import {
    GitCommit,
    Database,
    Server,
    Globe,
    X
} from 'lucide-react';
import { motion } from 'framer-motion';

// Simple Bezier Curve Calculation
const getBezierPath = (start, end) => {
    const dx = Math.abs(end.x - start.x);
    // Control points for smooth S-curve
    const cp1x = start.x + dx * 0.5;
    const cp1y = start.y;
    const cp2x = end.x - dx * 0.5;
    const cp2y = end.y;
    return `M${start.x},${start.y} C${cp1x},${cp1y} ${cp2x},${cp2y} ${end.x},${end.y}`;
};

const FlowchartDemo = () => {
    // Canvas State
    const [nodes, setNodes] = useState([
        { id: 'start', x: 50, y: 150, label: 'Start', type: 'start', icon: GitCommit },
        { id: 'db', x: 300, y: 50, label: 'Database', type: 'db', icon: Database },
        { id: 'server', x: 300, y: 250, label: 'Server', type: 'server', icon: Server },
        { id: 'web', x: 550, y: 150, label: 'Web', type: 'web', icon: Globe },
    ]);
    const [connections, setConnections] = useState([
        { id: 'c1', from: 'start', to: 'db' }
    ]);

    // Dragging Connection State
    const [isConnecting, setIsConnecting] = useState(false);
    const [dragStartNode, setDragStartNode] = useState(null);
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 }); // Mouse Pos relative to canvas

    // Moving Node State
    const [isMovingNode, setIsMovingNode] = useState(false);
    const [movingNodeId, setMovingNodeId] = useState(null);
    const [nodeOffset, setNodeOffset] = useState({ x: 0, y: 0 });

    const canvasRef = useRef(null);

    // Helper: Get Node Anchor Point (Right side for source, Left for target simplistically)
    const getNodeAnchor = (nodeId, side = 'right') => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return { x: 0, y: 0 };
        // Node size assumed approx 120x60 typically
        // Just hardcoding offsets based on rendered node size logic below
        // Node w=140, h=64 ideally
        if (side === 'right') return { x: node.x + 140, y: node.y + 32 };
        if (side === 'left') return { x: node.x, y: node.y + 32 };
        return { x: node.x, y: node.y };
    };

    const handleCanvasMouseMove = (e) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isConnecting) {
            setDragPos({ x, y });
        } else if (isMovingNode && movingNodeId) {
            setNodes(nodes.map(n =>
                n.id === movingNodeId
                    ? { ...n, x: x - nodeOffset.x, y: y - nodeOffset.y }
                    : n
            ));
        }
    };

    const handleCanvasMouseUp = () => {
        setIsConnecting(false);
        setDragStartNode(null);
        setIsMovingNode(false);
        setMovingNodeId(null);
    };

    // Node Drag Logic (Position)
    const startMovingNode = (e, node) => {
        e.stopPropagation(); // Prevent canvas handlers if any specific ones exist
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setNodeOffset({ x: mouseX - node.x, y: mouseY - node.y });
        setMovingNodeId(node.id);
        setIsMovingNode(true);
    };

    // Connection Logic
    const startConnection = (e, nodeId) => {
        e.stopPropagation();
        e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        setDragStartNode(nodeId);
        setDragPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setIsConnecting(true);
    };

    const finishConnection = (e, targetNodeId) => {
        e.stopPropagation();
        if (isConnecting && dragStartNode && dragStartNode !== targetNodeId) {
            // Avoid duplicates
            if (!connections.find(c => c.from === dragStartNode && c.to === targetNodeId)) {
                setConnections([...connections, {
                    id: `${dragStartNode}-${targetNodeId}-${Date.now()}`,
                    from: dragStartNode,
                    to: targetNodeId
                }]);
            }
        }
        handleCanvasMouseUp();
    };

    return (
        <div
            ref={canvasRef}
            className="relative w-full h-[500px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden cursor-crosshair select-none"
            style={{
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '-10px -10px'
            }}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
        >
            {/* SVG Layer for Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none sticky-svg">
                {/* Existing Connections */}
                {connections.map(conn => {
                    const start = getNodeAnchor(conn.from, 'right');
                    const end = getNodeAnchor(conn.to, 'left');
                    return (
                        <g key={conn.id}>
                            <path
                                d={getBezierPath(start, end)}
                                fill="none"
                                stroke="#94a3b8"
                                strokeWidth="3"
                                className="dark:stroke-slate-600"
                            />
                            {/* Delete connection area */}
                            <circle cx={(start.x + end.x) / 2} cy={(start.y + end.y) / 2} r="10" fill="transparent"
                                className="cursor-pointer pointer-events-auto hover:fill-red-500/20"
                                onClick={() => setConnections(connections.filter(c => c.id !== conn.id))} />
                        </g>
                    );
                })}

                {/* Active Dragging Line */}
                {isConnecting && dragStartNode && (
                    <path
                        d={getBezierPath(getNodeAnchor(dragStartNode, 'right'), dragPos)}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray="5,5"
                        className="animate-dash"
                    />
                )}
            </svg>

            {/* Nodes */}
            {nodes.map(node => (
                <div
                    key={node.id}
                    className="absolute w-[140px] h-[64px] bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between px-3 group transition-colors hover:border-blue-400 z-10"
                    style={{ left: node.x, top: node.y }}
                    onMouseDown={(e) => startMovingNode(e, node)}
                >
                    {/* Left Connector (Target) */}
                    <div
                        className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 -ml-4 border-2 border-white dark:border-slate-800 cursor-pointer hover:scale-125 hover:bg-blue-500 transition-transform"
                        onMouseUp={(e) => finishConnection(e, node.id)}
                    />

                    <div className="flex items-center space-x-3 pointer-events-none">
                        <node.icon className="w-5 h-5 text-slate-500" />
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{node.label}</span>
                    </div>

                    {/* Right Connector (Source) */}
                    <div
                        className="w-3 h-3 rounded-full bg-blue-500 -mr-4 border-2 border-white dark:border-slate-800 cursor-pointer hover:scale-125 transition-transform"
                        onMouseDown={(e) => startConnection(e, node.id)}
                    />

                    {/* Delete button on hover */}
                    <button
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setNodes(nodes.filter(n => n.id !== node.id));
                            setConnections(connections.filter(c => c.from !== node.id && c.to !== node.id));
                        }}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ))}

            <div className="absolute bottom-4 left-4 text-xs font-mono text-slate-400 pointer-events-none bg-white/80 dark:bg-black/50 p-2 rounded-lg">
                Draw lines from right dots • Drop on left dots
            </div>
        </div>
    );
};

export default FlowchartDemo;
