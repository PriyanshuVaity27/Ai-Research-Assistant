
import React from 'react';
import { cn } from "@/lib/utils";

interface NeonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  color?: 'blue' | 'purple' | 'cyan' | 'multi';
  as?: React.ElementType;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const NeonText = React.forwardRef<HTMLDivElement, NeonTextProps>(
  ({ className, children, color = 'blue', as = 'div', size = 'base', ...props }, ref) => {
    const Component = as;
    
    const getGlowClass = () => {
      switch (color) {
        case 'blue':
          return 'text-electric-blue drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]';
        case 'purple':
          return 'text-deep-purple drop-shadow-[0_0_10px_rgba(128,0,128,0.7)]';
        case 'cyan':
          return 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]';
        case 'multi':
          return 'text-gradient drop-shadow-[0_0_10px_rgba(128,0,255,0.5)]';
        default:
          return 'text-electric-blue drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]';
      }
    };
    
    const getSizeClass = () => {
      switch (size) {
        case 'xs': return 'text-xs';
        case 'sm': return 'text-sm';
        case 'base': return 'text-base';
        case 'lg': return 'text-lg';
        case 'xl': return 'text-xl';
        case '2xl': return 'text-2xl';
        case '3xl': return 'text-3xl';
        case '4xl': return 'text-4xl';
        default: return 'text-base';
      }
    };
    
    return (
      <Component
        ref={ref}
        className={cn(
          'font-medium tracking-wide',
          getSizeClass(),
          getGlowClass(),
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

NeonText.displayName = "NeonText";

export { NeonText };
