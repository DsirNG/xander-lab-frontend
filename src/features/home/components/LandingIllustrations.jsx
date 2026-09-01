import React from "react";

/**
 * 3D Glowing Holographic Ring
 */
export const GlowingRing3D = ({ className = "w-24 h-24" }) => (
    <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient id="ringGrad1" x1="20" y1="30" x2="180" y2="170" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="35%" stopColor="#c084fc" />
                <stop offset="70%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="ringGrad2" x1="160" y1="20" x2="40" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e879f9" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.9" />
            </linearGradient>
            <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="ringShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#6366f1" floodOpacity="0.35" />
            </filter>
        </defs>

        {/* Background glow ring */}
        <ellipse
            cx="100"
            cy="100"
            rx="68"
            ry="46"
            transform="rotate(-25 100 100)"
            stroke="url(#ringGrad1)"
            strokeWidth="20"
            filter="url(#ringGlow)"
            opacity="0.4"
        />

        {/* Main 3D torus ring */}
        <g filter="url(#ringShadow)">
            <ellipse
                cx="100"
                cy="100"
                rx="65"
                ry="42"
                transform="rotate(-25 100 100)"
                stroke="url(#ringGrad1)"
                strokeWidth="18"
                strokeLinecap="round"
            />
            <ellipse
                cx="98"
                cy="98"
                rx="62"
                ry="39"
                transform="rotate(-25 100 100)"
                stroke="url(#ringGrad2)"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.85"
            />
        </g>

        {/* Floating light orbs around the ring */}
        <circle cx="50" cy="55" r="7" fill="#c084fc" filter="url(#ringGlow)" />
        <circle cx="152" cy="70" r="5" fill="#38bdf8" filter="url(#ringGlow)" />
        <circle cx="145" cy="148" r="8" fill="#818cf8" filter="url(#ringGlow)" />
        <circle cx="42" cy="130" r="4" fill="#e879f9" opacity="0.8" />
    </svg>
);

/**
 * 3D Chat Bubbles Illustration (智能对话)
 */
export const ChatBubbles3D = ({ className = "w-full h-36" }) => (
    <svg
        viewBox="0 0 240 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient id="chatBubbleGrad1" x1="30" y1="20" x2="160" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="chatBubbleGrad2" x1="100" y1="60" x2="210" y2="150" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e0e7ff" />
                <stop offset="100%" stopColor="#c7d2fe" />
            </linearGradient>
            <filter id="chatShadow1" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#4f46e5" floodOpacity="0.28" />
            </filter>
            <filter id="chatShadow2" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1e1b4b" floodOpacity="0.08" />
            </filter>
        </defs>

        {/* Ambient subtle light */}
        <circle cx="120" cy="80" r="60" fill="#e0e7ff" opacity="0.45" filter="blur(20px)" />

        {/* Main 3D Bubble (Primary) */}
        <g filter="url(#chatShadow1)">
            <rect x="40" y="32" width="110" height="74" rx="24" fill="url(#chatBubbleGrad1)" />
            {/* Tail */}
            <path d="M56 104 L44 122 C52 118 64 108 68 106 Z" fill="#6366f1" />

            {/* Glossy top edge highlight */}
            <path
                d="M56 36 C50 36 45 41 45 47 L45 56 C60 48 95 44 140 45 C146 45 146 39 140 36 Z"
                fill="white"
                opacity="0.3"
            />

            {/* Dots */}
            <circle cx="70" cy="69" r="6" fill="white" />
            <circle cx="95" cy="69" r="6" fill="white" />
            <circle cx="120" cy="69" r="6" fill="white" />
        </g>

        {/* Secondary 3D Bubble (Light Accent) */}
        <g filter="url(#chatShadow2)">
            <rect x="120" y="68" width="90" height="60" rx="20" fill="url(#chatBubbleGrad2)" />
            {/* Tail */}
            <path d="M192 126 L202 140 C195 137 186 130 182 128 Z" fill="#c7d2fe" />
            <circle cx="145" cy="98" r="4.5" fill="#6366f1" opacity="0.75" />
            <circle cx="165" cy="98" r="4.5" fill="#6366f1" opacity="0.75" />
            <circle cx="185" cy="98" r="4.5" fill="#6366f1" opacity="0.75" />
        </g>

        {/* Floating mini sparkles */}
        <circle cx="34" cy="40" r="4" fill="#a5b4fc" opacity="0.8" />
        <circle cx="218" cy="54" r="5" fill="#818cf8" opacity="0.6" />
        <circle cx="185" cy="28" r="3" fill="#c084fc" opacity="0.7" />
    </svg>
);

/**
 * 3D Globe with Orbital Rings Illustration (联网搜索)
 */
export const GlobeWithOrbit3D = ({ className = "w-full h-36" }) => (
    <svg
        viewBox="0 0 240 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <radialGradient id="globeGrad" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="45%" stopColor="#3b82f6" />
                <stop offset="85%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#1e3a8a" />
            </radialGradient>
            <linearGradient id="orbitGrad" x1="20" y1="40" x2="220" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#c084fc" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
            </linearGradient>
            <filter id="globeShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#2563eb" floodOpacity="0.3" />
            </filter>
        </defs>

        {/* Ambient glow */}
        <circle cx="120" cy="80" r="55" fill="#bfdbfe" opacity="0.4" filter="blur(16px)" />

        {/* Back part of orbit ring */}
        <path
            d="M48 68 C72 38 168 38 192 68"
            stroke="url(#orbitGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="6 4"
            opacity="0.6"
        />

        {/* Main 3D Globe Sphere */}
        <g filter="url(#globeShadow)">
            <circle cx="120" cy="80" r="42" fill="url(#globeGrad)" />

            {/* Latitude / longitude grid curves */}
            <ellipse cx="120" cy="80" rx="20" ry="42" stroke="white" strokeWidth="1.5" strokeOpacity="0.35" />
            <ellipse cx="120" cy="80" rx="36" ry="18" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
            <path d="M78 80 H162" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />

            {/* Glossy top-left reflection */}
            <ellipse cx="106" cy="62" rx="14" ry="8" transform="rotate(-30 106 62)" fill="white" opacity="0.35" />
        </g>

        {/* Front part of orbit ring */}
        <ellipse
            cx="120"
            cy="80"
            rx="76"
            ry="24"
            transform="rotate(-22 120 80)"
            stroke="url(#orbitGrad)"
            strokeWidth="6"
            strokeLinecap="round"
        />

        {/* Small satellite orbs on the orbit */}
        <circle cx="62" cy="100" r="6" fill="#38bdf8" filter="drop-shadow(0 2px 4px rgba(56,189,248,0.5))" />
        <circle cx="182" cy="62" r="5" fill="#c084fc" filter="drop-shadow(0 2px 4px rgba(192,132,252,0.5))" />
    </svg>
);

/**
 * 3D Creative Canvas & Pencil Illustration (内容创作)
 */
export const CreationCanvas3D = ({ className = "w-full h-36" }) => (
    <svg
        viewBox="0 0 240 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient id="canvasCardGrad1" x1="60" y1="30" x2="160" y2="130" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ede9fe" />
                <stop offset="100%" stopColor="#ddd6fe" />
            </linearGradient>
            <linearGradient id="canvasCardGrad2" x1="80" y1="40" x2="180" y2="140" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f5f3ff" />
            </linearGradient>
            <linearGradient id="pencilGrad" x1="120" y1="40" x2="190" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="60%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <filter id="canvasShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#7c3aed" floodOpacity="0.2" />
            </filter>
        </defs>

        {/* Ambient glow */}
        <circle cx="120" cy="80" r="55" fill="#ede9fe" opacity="0.5" filter="blur(16px)" />

        {/* Background Card */}
        <g filter="url(#canvasShadow)">
            <rect
                x="60"
                y="38"
                width="88"
                height="68"
                rx="14"
                transform="rotate(-8 60 38)"
                fill="url(#canvasCardGrad1)"
            />
            {/* Mini image silhouette on back card */}
            <circle cx="86" cy="56" r="8" fill="#c4b5fd" opacity="0.6" />
            <path d="M72 82 L86 68 L104 84 L120 74 L134 88 H72 Z" fill="#c4b5fd" opacity="0.6" />
        </g>

        {/* Foreground Main Canvas Card */}
        <g filter="url(#canvasShadow)">
            <rect
                x="82"
                y="46"
                width="92"
                height="72"
                rx="16"
                fill="url(#canvasCardGrad2)"
                stroke="#ede9fe"
                strokeWidth="2"
            />
            {/* Image placeholder inside canvas */}
            <rect x="94" y="58" width="68" height="34" rx="8" fill="#e0e7ff" />
            <circle cx="108" cy="70" r="5" fill="#818cf8" />
            <path d="M98 88 L114 74 L132 88 L146 78 L158 88 H98 Z" fill="#a5b4fc" />
            {/* Lines of text placeholder */}
            <rect x="94" y="100" width="44" height="4" rx="2" fill="#c7d2fe" />
            <rect x="94" y="107" width="28" height="4" rx="2" fill="#e0e7ff" />
        </g>

        {/* 3D Stylus / Pencil Floating */}
        <g filter="url(#canvasShadow)">
            <g transform="rotate(35 160 55)">
                {/* Pencil body */}
                <rect x="150" y="20" width="12" height="60" rx="6" fill="url(#pencilGrad)" />
                {/* Tip */}
                <path d="M150 80 L156 94 L162 80 Z" fill="#fbbf24" />
                <path d="M154 90 L156 94 L158 90 Z" fill="#1e1b4b" />
                {/* Cap */}
                <rect x="150" y="20" width="12" height="10" rx="3" fill="#c7d2fe" />
            </g>
        </g>

        {/* Sparkles */}
        <circle cx="198" cy="100" r="4" fill="#818cf8" />
        <circle cx="56" cy="70" r="5" fill="#c084fc" opacity="0.7" />
    </svg>
);

/**
 * 3D Stacked Knowledge Base Folders Illustration (个人知识库)
 */
export const KnowledgeFolders3D = ({ className = "w-full h-36" }) => (
    <svg
        viewBox="0 0 240 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient id="folderGrad1" x1="50" y1="30" x2="160" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="60%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="folderGrad2" x1="70" y1="40" x2="180" y2="130" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
            <linearGradient id="cardGrad" x1="90" y1="45" x2="170" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f3e8ff" />
            </linearGradient>
            <filter id="folderShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#6b21a8" floodOpacity="0.25" />
            </filter>
        </defs>

        {/* Ambient glow */}
        <circle cx="120" cy="80" r="55" fill="#f3e8ff" opacity="0.6" filter="blur(18px)" />

        {/* Back Folder Layer 1 */}
        <g filter="url(#folderShadow)">
            <path
                d="M58 48 C58 42 63 38 69 38 H96 L108 48 H152 C158 48 163 53 163 59 V108 C163 114 158 119 152 119 H69 C63 119 58 114 58 108 Z"
                fill="url(#folderGrad1)"
                transform="rotate(-6 58 48)"
            />
        </g>

        {/* Middle Folder Layer 2 */}
        <g filter="url(#folderShadow)">
            <path
                d="M74 54 C74 48 79 44 85 44 H112 L124 54 H168 C174 54 179 59 179 65 V114 C179 120 174 125 168 125 H85 C79 125 74 120 74 114 Z"
                fill="url(#folderGrad2)"
                opacity="0.9"
            />
        </g>

        {/* Floating White Knowledge Card / Doc in the front */}
        <g filter="url(#folderShadow)">
            <rect
                x="98"
                y="52"
                width="72"
                height="82"
                rx="14"
                fill="url(#cardGrad)"
                stroke="#f3e8ff"
                strokeWidth="1.5"
                transform="rotate(6 98 52)"
            />

            {/* Doc contents */}
            <g transform="rotate(6 98 52)">
                <rect x="110" y="66" width="30" height="6" rx="3" fill="#a855f7" />
                <rect x="110" y="78" width="48" height="4" rx="2" fill="#d8b4fe" />
                <rect x="110" y="86" width="42" height="4" rx="2" fill="#e9d5ff" />
                <rect x="110" y="94" width="36" height="4" rx="2" fill="#e9d5ff" />
                <circle cx="152" cy="116" r="6" fill="#7c3aed" opacity="0.85" />
            </g>
        </g>

        {/* Decorative sparkles */}
        <circle cx="48" cy="62" r="5" fill="#c084fc" opacity="0.75" />
        <circle cx="198" cy="74" r="6" fill="#818cf8" opacity="0.8" />
        <circle cx="180" cy="132" r="4" fill="#a855f7" opacity="0.6" />
    </svg>
);
