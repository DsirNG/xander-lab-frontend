import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Cpu, Box, CheckCircle2 } from 'lucide-react';

/**
 * Shared phase/timeline card component.
 * Renders an animated card with an index-based icon, title, description, and bullet points.
 *
 * `color` controls the accent color used for the circle border, icon tint, and card hover border.
 * Defaults to 'primary' (Tailwind theme color). Pass e.g. 'blue-600' for a fixed color scheme.
 */
const COLOR_SCHEMES = {
    primary: {
        border: 'border-primary',
        text: 'text-primary',
        hoverBorder: 'hover:border-primary/50',
    },
    blue: {
        border: 'border-blue-600',
        text: 'text-blue-600',
        hoverBorder: 'hover:border-blue-600/50',
    },
};

const PhaseCard = ({ phase, index, color = 'primary' }) => {
    const scheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.primary;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-8 pb-12 border-l-2 border-slate-200 last:border-0 last:pb-0"
        >
            <div className={`absolute left-[-16px] top-0 w-8 h-8 rounded-full bg-white border-2 ${scheme.border} flex items-center justify-center ${scheme.text} shadow-sm`}>
                {index === 0 && <Compass className="w-4 h-4" />}
                {index === 1 && <Cpu className="w-4 h-4" />}
                {index === 2 && <Box className="w-4 h-4" />}
            </div>

            <div className={`bg-white/50 rounded-3xl p-5 sm:p-8 border border-slate-200 ${scheme.hoverBorder} transition-colors shadow-sm`}>
                <div className="text-heading sm:text-2xl font-bold text-slate-900 mb-2 break-words">
                    {phase.title}
                </div>
                <div className="text-slate-600 mb-6 text-body sm:text-lg">
                    {phase.desc}
                </div>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {phase.points.map((point, i) => (
                        <li key={i} className="flex items-center space-x-2 text-slate-500 text-body">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="min-w-0">{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
};

export default PhaseCard;
