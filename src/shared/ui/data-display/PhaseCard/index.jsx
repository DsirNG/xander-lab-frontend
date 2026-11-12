import React from "react";
import { motion } from "framer-motion";
import { Compass, Cpu, Box, CheckCircle2 } from "lucide-react";

/**
 * Shared phase/timeline card component.
 * Renders an animated card with an index-based icon, title, description, and bullet points.
 *
 * `color` controls the accent color used for the circle border, icon tint, and card hover border.
 * Legacy color names remain supported with neutral UI tokens.
 */
const COLOR_SCHEMES = {
    primary: {
        border: "border-border-strong",
        text: "text-ink",
        hoverBorder: "hover:border-border-strong",
    },
    blue: {
        border: "border-border-strong",
        text: "text-ink",
        hoverBorder: "hover:border-border-strong/50",
    },
};

const PhaseCard = ({ phase, index, color = "primary" }) => {
    const scheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.primary;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-8 pb-12 border-l-2 border-border last:border-0 last:pb-0"
        >
            <div
                className={`absolute left-[-16px] top-0 w-8 h-8 rounded-full bg-canvas border-2 ${scheme.border} flex items-center justify-center ${scheme.text}`}
            >
                {index === 0 && <Compass className="w-4 h-4" />}
                {index === 1 && <Cpu className="w-4 h-4" />}
                {index === 2 && <Box className="w-4 h-4" />}
            </div>

            <div
                className={`bg-canvas rounded-card p-4 sm:p-6 border border-border ${scheme.hoverBorder} transition-colors`}
            >
                <div className="text-heading text-ink mb-2 break-words">
                    {phase.title}
                </div>
                <div className="text-ink-muted mb-6 text-body">
                    {phase.desc}
                </div>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {phase.points.map((point, i) => (
                        <li
                            key={i}
                            className="flex items-center space-x-2 text-ink-secondary text-body"
                        >
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                            <span className="min-w-0">{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
};

export default PhaseCard;
