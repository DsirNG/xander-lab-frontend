import React from "react";

/**
 * 3D Cyber Dagger on Pedestal with 360° Turntable
 */
export const Dagger3DShowcase = ({ className = "w-full h-44" }) => (
    <svg
        viewBox="0 0 320 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient id="bladeGrad" x1="120" y1="120" x2="270" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="40%" stopColor="#f8fafc" />
                <stop offset="70%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <linearGradient id="handleGrad" x1="60" y1="160" x2="140" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="40%" stopColor="#b45309" />
                <stop offset="80%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id="metalGuard" x1="110" y1="120" x2="160" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="pedestalGrad" x1="120" y1="130" x2="200" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="turntableGlow" x1="50" y1="140" x2="270" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <filter id="shadowDagger" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#1e1b4b" floodOpacity="0.25" />
            </filter>
        </defs>

        {/* 360° Turntable Ellipse Ring */}
        <ellipse
            cx="160"
            cy="160"
            rx="96"
            ry="24"
            stroke="url(#turntableGlow)"
            strokeWidth="3"
            strokeDasharray="8 6"
        />
        {/* Rotation Arrow Indicator */}
        <path d="M236 154 L244 162 L234 168" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Pedestal Stand */}
        <g filter="url(#shadowDagger)">
            <ellipse cx="160" cy="158" rx="28" ry="8" fill="url(#pedestalGrad)" />
            <rect x="156" y="110" width="8" height="48" rx="4" fill="url(#metalGuard)" />
            <ellipse cx="160" cy="110" rx="14" ry="4" fill="#64748b" />
        </g>

        {/* Floating Cyber Dagger */}
        <g filter="url(#shadowDagger)">
            {/* Blade */}
            <path
                d="M140 100 L210 50 L270 28 L230 70 L170 104 Z"
                fill="url(#bladeGrad)"
                stroke="#64748b"
                strokeWidth="1"
            />
            {/* Blade Spine Ridge */}
            <path d="M144 100 L220 54 L270 28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />

            {/* Guard Mechanism */}
            <rect x="126" y="88" width="28" height="24" rx="6" transform="rotate(-35 126 88)" fill="url(#metalGuard)" />
            <circle cx="134" cy="98" r="4" fill="#38bdf8" />

            {/* Leather / Mechanical Handle */}
            <path
                d="M124 106 L82 144 C76 150 68 156 58 154 C50 152 54 140 62 134 L106 94 Z"
                fill="url(#handleGrad)"
            />
            {/* Handle Straps / Grip */}
            <path d="M112 114 L102 104 M98 126 L88 116 M84 138 L74 128" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
            {/* Pommel */}
            <circle cx="56" cy="150" r="8" fill="url(#metalGuard)" />
            <circle cx="56" cy="150" r="3" fill="#fbbf24" />
        </g>
    </svg>
);

/**
 * 3D Holographic AI Brain on Luminous Pedestal
 */
export const HolographicBrain3D = ({ className = "w-28 h-28" }) => (
    <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <radialGradient id="brainGlow" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#a5b4fc" />
                <stop offset="40%" stopColor="#60a5fa" />
                <stop offset="80%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4338ca" />
            </radialGradient>
            <linearGradient id="pedestalGlow" x1="40" y1="130" x2="120" y2="150" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e0e7ff" />
                <stop offset="100%" stopColor="#c7d2fe" />
            </linearGradient>
            <filter id="brainFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>

        {/* Ambient Glow */}
        <circle cx="80" cy="70" r="45" fill="#c7d2fe" opacity="0.45" filter="blur(16px)" />

        {/* Floating Pedestal */}
        <ellipse cx="80" cy="136" rx="42" ry="10" fill="url(#pedestalGlow)" opacity="0.8" />
        <ellipse cx="80" cy="134" rx="34" ry="6" stroke="#818cf8" strokeWidth="2" fill="#ffffff" />

        {/* 3D Brain Core */}
        <g filter="url(#brainFilter)">
            {/* Left Hemisphere */}
            <path
                d="M74 42 C60 40 44 50 44 68 C44 78 48 86 52 94 C56 100 66 106 74 106 C76 106 78 100 78 94 C78 78 78 54 74 42 Z"
                fill="url(#brainGlow)"
            />
            {/* Right Hemisphere */}
            <path
                d="M86 42 C100 40 116 50 116 68 C116 78 112 86 108 94 C104 100 94 106 86 106 C84 106 82 100 82 94 C82 78 82 54 86 42 Z"
                fill="url(#brainGlow)"
            />

            {/* Brain convolutions / Gyri curves */}
            <path d="M52 62 C58 58 66 64 74 62" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
            <path d="M48 76 C56 74 64 82 74 78" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
            <path d="M54 90 C62 88 68 94 76 92" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />

            <path d="M108 62 C102 58 94 64 86 62" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
            <path d="M112 76 C104 74 96 82 86 78" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
            <path d="M106 90 C98 88 92 94 84 92" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
        </g>

        {/* Neural Synapse Sparkles */}
        <circle cx="48" cy="50" r="3" fill="#38bdf8" />
        <circle cx="112" cy="52" r="3" fill="#e879f9" />
        <circle cx="80" cy="32" r="3.5" fill="#818cf8" />
    </svg>
);

/**
 * 3D Luminous Security Shield with Padlock (01 ChatGPT 沙箱隔离)
 */
export const SecurityShield3D = ({ className = "w-full h-36" }) => (
    <svg
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient id="shieldGrad" x1="40" y1="20" x2="160" y2="140" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#bfdbfe" />
                <stop offset="40%" stopColor="#60a5fa" />
                <stop offset="80%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <filter id="shieldShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#2563eb" floodOpacity="0.3" />
            </filter>
        </defs>

        <circle cx="100" cy="80" r="50" fill="#dbeafe" opacity="0.6" filter="blur(18px)" />

        <g filter="url(#shieldShadow)">
            {/* Outer Glass Ring */}
            <ellipse cx="100" cy="130" rx="46" ry="14" fill="#e0e7ff" opacity="0.5" />

            {/* Main Shield */}
            <path
                d="M100 24 L142 42 C142 84 126 114 100 132 C74 114 58 84 58 42 Z"
                fill="url(#shieldGrad)"
                stroke="#93c5fd"
                strokeWidth="2.5"
            />
            {/* Inner Shield Bevel */}
            <path
                d="M100 32 L134 47 C134 82 120 106 100 122 C80 106 66 82 66 47 Z"
                fill="#ffffff"
                fillOpacity="0.15"
            />

            {/* 3D Padlock */}
            <rect x="88" y="74" width="24" height="20" rx="5" fill="#ffffff" />
            <path d="M92 74 V64 C92 59.5 95.5 56 100 56 C104.5 56 108 59.5 108 64 V74" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="82" r="2.5" fill="#2563eb" />
            <path d="M100 84.5 V88" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
        </g>
    </svg>
);

/**
 * 3D Dynamic Server Racks / Model Gateway (02 动态多模型网关)
 */
export const ServerGateway3D = ({ className = "w-full h-36" }) => (
    <svg
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient id="serverGrad1" x1="60" y1="40" x2="140" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="glowLayer" x1="70" y1="60" x2="130" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <filter id="serverShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#6366f1" floodOpacity="0.25" />
            </filter>
        </defs>

        <circle cx="100" cy="80" r="50" fill="#ede9fe" opacity="0.5" filter="blur(16px)" />

        {/* Stacked Server Layers (Isometric Perspective) */}
        <g filter="url(#serverShadow)">
            {/* Bottom Layer */}
            <g transform="translate(0, 36)">
                <path d="M60 76 L100 58 L140 76 L100 94 Z" fill="url(#serverGrad1)" stroke="#cbd5e1" />
                <path d="M60 76 L60 88 L100 106 L100 94 Z" fill="#94a3b8" />
                <path d="M140 76 L140 88 L100 106 L100 94 Z" fill="#cbd5e1" />
                <circle cx="90" cy="98" r="2" fill="#38bdf8" />
                <circle cx="98" cy="102" r="2" fill="#34d399" />
            </g>

            {/* Middle Glow Layer */}
            <g transform="translate(0, 18)">
                <path d="M60 62 L100 44 L140 62 L100 80 Z" fill="url(#glowLayer)" opacity="0.9" />
                <path d="M60 62 L60 72 L100 90 L100 80 Z" fill="#6366f1" />
                <path d="M140 62 L140 72 L100 90 L100 80 Z" fill="#a855f7" />
                <circle cx="90" cy="82" r="2" fill="#ffffff" />
                <circle cx="98" cy="86" r="2" fill="#ffffff" />
            </g>

            {/* Top Layer */}
            <g>
                <path d="M60 48 L100 30 L140 48 L100 66 Z" fill="url(#serverGrad1)" stroke="#cbd5e1" />
                <path d="M60 48 L60 58 L100 76 L100 66 Z" fill="#94a3b8" />
                <path d="M140 48 L140 58 L100 76 L100 66 Z" fill="#cbd5e1" />
                <circle cx="90" cy="68" r="2" fill="#34d399" />
                <circle cx="98" cy="72" r="2" fill="#38bdf8" />
            </g>
        </g>
    </svg>
);

/**
 * 3D Audit Ledger Document with Checkmark (03 确定性计费账本)
 */
export const AuditLedger3D = ({ className = "w-full h-36" }) => (
    <svg
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient id="docGrad" x1="60" y1="20" x2="140" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#ede9fe" />
            </linearGradient>
            <filter id="docShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#7c3aed" floodOpacity="0.22" />
            </filter>
        </defs>

        <circle cx="100" cy="80" r="50" fill="#f5f3ff" opacity="0.6" filter="blur(16px)" />

        {/* 3D Ledger Sheet */}
        <g filter="url(#docShadow)">
            {/* Folded Document */}
            <rect x="68" y="32" width="64" height="84" rx="10" fill="url(#docGrad)" stroke="#c4b5fd" strokeWidth="1.5" />
            {/* Rows & Chart Silhouette */}
            <rect x="78" y="44" width="24" height="5" rx="2" fill="#8b5cf6" />
            <rect x="78" y="54" width="44" height="3" rx="1.5" fill="#c4b5fd" />
            <rect x="78" y="61" width="36" height="3" rx="1.5" fill="#ddd6fe" />

            {/* Pie Chart Mini Vector */}
            <circle cx="88" cy="86" r="12" fill="#ddd6fe" />
            <path d="M88 86 L88 74 A12 12 0 0 1 100 86 Z" fill="#7c3aed" />

            {/* Glowing Verified Checkmark Badge */}
            <g transform="translate(112, 88)">
                <circle cx="16" cy="16" r="16" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                <path d="M10 16 L14 20 L22 12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
        </g>
    </svg>
);

/**
 * 3D Connected Multi-Platform Devices (04 全端协同)
 */
export const ConnectedDevices3D = ({ className = "w-full h-36" }) => (
    <svg
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <filter id="deviceShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#6366f1" floodOpacity="0.2" />
            </filter>
        </defs>

        <circle cx="100" cy="80" r="50" fill="#e0e7ff" opacity="0.6" filter="blur(16px)" />

        <g filter="url(#deviceShadow)">
            {/* Tablet / Web View in Background */}
            <rect x="94" y="34" width="58" height="80" rx="10" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
            <rect x="100" y="44" width="46" height="60" rx="6" fill="#e0e7ff" />
            <circle cx="123" cy="108" r="2" fill="#64748b" />

            {/* Mobile Phone in Foreground */}
            <rect x="58" y="52" width="42" height="74" rx="8" fill="#ffffff" stroke="#6366f1" strokeWidth="2" />
            <rect x="62" y="58" width="34" height="56" rx="4" fill="#ede9fe" />
            <circle cx="79" cy="120" r="2" fill="#6366f1" />

            {/* Connecting Wireless/Sync Wave */}
            <path d="M84 76 C94 76 98 68 112 68" stroke="#6366f1" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" />
            <circle cx="98" cy="72" r="3" fill="#6366f1" />
        </g>
    </svg>
);

/**
 * 3D Code Cube on Pedestal (Roadmap 阶段 01: Code-Only 3D)
 */
export const CodeCube3D = ({ className = "w-28 h-28" }) => (
    <svg
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient id="cubeTop" x1="40" y1="40" x2="100" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <linearGradient id="cubeLeft" x1="40" y1="60" x2="70" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
            <linearGradient id="cubeRight" x1="70" y1="60" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
        </defs>

        {/* Pedestal platform */}
        <ellipse cx="70" cy="116" rx="44" ry="12" fill="#e0e7ff" opacity="0.7" />
        <ellipse cx="70" cy="114" rx="34" ry="8" stroke="#818cf8" strokeWidth="2" fill="#ffffff" />

        {/* 3D Isometric Glowing Code Cube */}
        <g transform="translate(0, 10)">
            {/* Top Face */}
            <path d="M70 28 L98 44 L70 60 L42 44 Z" fill="url(#cubeTop)" />
            {/* Left Face */}
            <path d="M42 44 L70 60 L70 92 L42 76 Z" fill="url(#cubeLeft)" />
            {/* Right Face */}
            <path d="M98 44 L70 60 L70 92 L98 76 Z" fill="url(#cubeRight)" />

            {/* Code Brackets on Left Face */}
            <path d="M52 60 L48 68 L52 76" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M60 60 L64 68 L60 76" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
    </svg>
);

/**
 * 3D Robot / Character Face with Emojis (Roadmap 阶段 03)
 */
export const BlendshapeFace3D = ({ className = "w-28 h-28" }) => (
    <svg
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <radialGradient id="faceGrad" cx="45%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ede9fe" />
                <stop offset="60%" stopColor="#c4b5fd" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </radialGradient>
        </defs>

        <circle cx="70" cy="70" r="40" fill="#f5f3ff" opacity="0.7" filter="blur(14px)" />

        {/* 3D Humanoid Head */}
        <ellipse cx="70" cy="70" rx="30" ry="38" fill="url(#faceGrad)" />
        {/* Wireframe Blendshape Grid */}
        <ellipse cx="70" cy="70" rx="28" ry="36" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 3" />
        <path d="M50 64 Q70 60 90 64" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.6" fill="none" />
        <path d="M58 84 Q70 92 82 84" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="60" cy="64" r="2.5" fill="#4c1d95" />
        <circle cx="80" cy="64" r="2.5" fill="#4c1d95" />

        {/* Floating Expression Bubbles */}
        <circle cx="28" cy="50" r="10" fill="#fed7aa" />
        <text x="23" y="54" fontSize="10">😊</text>
        <circle cx="112" cy="46" r="10" fill="#bfdbfe" />
        <text x="107" y="50" fontSize="10">😮</text>
        <circle cx="106" cy="94" r="10" fill="#bbf7d0" />
        <text x="101" y="98" fontSize="10">😍</text>
    </svg>
);

/**
 * 3D Open World Floating Island (Roadmap 阶段 04)
 */
export const OpenWorldIsland3D = ({ className = "w-28 h-28" }) => (
    <svg
        viewBox="0 0 160 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient id="islandRock" x1="40" y1="80" x2="120" y2="130" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="60%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="islandGrass" x1="40" y1="60" x2="120" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
        </defs>

        <circle cx="80" cy="70" r="45" fill="#dbeafe" opacity="0.6" filter="blur(16px)" />

        {/* Floating Mountains & Trees on Top */}
        <path d="M52 68 L68 40 L84 68 Z" fill="#93c5fd" />
        <path d="M76 68 L92 46 L108 68 Z" fill="#60a5fa" />
        <path d="M96 68 L108 54 L120 68 Z" fill="#3b82f6" />

        {/* Island Grass Surface */}
        <ellipse cx="80" cy="72" rx="52" ry="14" fill="url(#islandGrass)" />

        {/* Inverted Floating Island Rock */}
        <path
            d="M28 72 Q80 82 132 72 L88 124 C84 128 76 128 72 124 Z"
            fill="url(#islandRock)"
        />

        {/* Floating clouds */}
        <ellipse cx="44" cy="80" rx="14" ry="6" fill="#ffffff" opacity="0.8" />
        <ellipse cx="120" cy="76" rx="16" ry="6" fill="#ffffff" opacity="0.8" />
    </svg>
);
