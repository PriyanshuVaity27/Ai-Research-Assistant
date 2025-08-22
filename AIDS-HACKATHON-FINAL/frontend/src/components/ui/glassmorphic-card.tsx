
import React from 'react';
import { cn } from "@/lib/utils";

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
  glowColor?: string;
}

const GlassmorphicCard = React.forwardRef<HTMLDivElement, GlassmorphicCardProps>(
  ({ className, children, variant = 'default', glowColor, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl backdrop-blur-xl transition-all duration-300",
          variant === 'default' && "neo-blur p-6",
          variant === 'elevated' && "neo-blur p-6 hover:translate-y-[-5px]",
          variant === 'bordered' && "neo-blur border-2 border-white/10 p-6",
          glowColor && "before:absolute before:inset-0 before:rounded-2xl before:opacity-30 before:blur-xl before:content-['']",
          className
        )}
        style={
          glowColor
            ? {
                '--glow-color': glowColor,
                '--before-background': `radial-gradient(circle at center, var(--glow-color) 0%, transparent 70%)`,
              } as React.CSSProperties
            : undefined
        }
        {...props}
      >
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassmorphicCard.displayName = "GlassmorphicCard";

export { GlassmorphicCard };
