import { ReactNode } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

type AnimationVariant = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'fade';

interface ScrollRevealProps {
    children: ReactNode;
    variant?: AnimationVariant;
    delay?: number;
    duration?: number;
    className?: string;
}

const variantStyles: Record<AnimationVariant, { hidden: string; visible: string }> = {
    'fade-up': {
        hidden: 'opacity-0 translate-y-8',
        visible: 'opacity-100 translate-y-0',
    },
    'fade-down': {
        hidden: 'opacity-0 -translate-y-8',
        visible: 'opacity-100 translate-y-0',
    },
    'fade-left': {
        hidden: 'opacity-0 translate-x-8',
        visible: 'opacity-100 translate-x-0',
    },
    'fade-right': {
        hidden: 'opacity-0 -translate-x-8',
        visible: 'opacity-100 translate-x-0',
    },
    'zoom-in': {
        hidden: 'opacity-0 scale-95',
        visible: 'opacity-100 scale-100',
    },
    'fade': {
        hidden: 'opacity-0',
        visible: 'opacity-100',
    },
};

export default function ScrollReveal({
    children,
    variant = 'fade-up',
    delay = 0,
    duration = 600,
    className = '',
}: ScrollRevealProps) {
    const [ref, isVisible] = useScrollReveal<HTMLDivElement>();
    const styles = variantStyles[variant];

    return (
        <div
            ref={ref}
            className={`transition-all ease-out ${isVisible ? styles.visible : styles.hidden} ${className}`}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}
