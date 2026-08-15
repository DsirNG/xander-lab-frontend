import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Sparkles, Cpu } from 'lucide-react';

const PARTICLE_ICONS = [Cpu, Zap, Shield, Sparkles];
const PARTICLES = [
    { x: 8, y: 18, duration: 17, size: 96 },
    { x: 24, y: 72, duration: 21, size: 132 },
    { x: 41, y: 35, duration: 19, size: 104 },
    { x: 58, y: 81, duration: 23, size: 156 },
    { x: 73, y: 14, duration: 20, size: 118 },
    { x: 87, y: 59, duration: 24, size: 172 },
    { x: 34, y: 92, duration: 18, size: 88 },
    { x: 65, y: 47, duration: 22, size: 144 },
].map((particle, index) => ({
    ...particle,
    Icon: PARTICLE_ICONS[index % PARTICLE_ICONS.length],
}));

/**
 * 漂浮粒子集
 */
const FloatingParticles = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {PARTICLES.map((p, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: p.x + "%",
                        y: p.y + "%",
                        opacity: 0
                    }}
                    animate={{
                        y: [null, "-20%", "20%"],
                        opacity: [0, 0.15, 0],
                        rotate: [0, 360],
                        scale: [0.8, 1, 0.8]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute text-accent"
                >
                    <p.Icon size={p.size} strokeWidth={0.5} />
                </motion.div>
            ))}
        </div>
    );
};

export default FloatingParticles;
