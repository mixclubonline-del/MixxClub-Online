/**
 * StaggeredList — Animation wrapper that staggers children's entrance.
 * 
 * Wraps each child in a framer-motion div with a staggered
 * slide-up-and-fade-in animation. Scroll-triggered via whileInView.
 */

import React, { Children, ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface StaggeredListProps {
    /** Array of children to stagger */
    children: ReactNode;
    /** Base delay between each child (seconds) */
    delay?: number;
    /** Additional className for the wrapper */
    className?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
    children,
    delay = 0.05,
    className,
}) => {
    const items = Children.toArray(children);

    return (
        <div className={className}>
            {items.map((child, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{
                        delay: index * delay,
                        duration: 0.35,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                >
                    {child}
                </motion.div>
            ))}
        </div>
    );
};
