import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  variant?: "default" | "glass" | "outline";
}

/**
 * Card Component
 * A premium reusable card container with various style variants.
 */
export const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  description, 
  className = "",
  variant = "default" 
}) => {
  const variants = {
    default: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-premium hover:shadow-premium-hover",
    glass: "glass-panel shadow-premium hover:shadow-premium-hover border border-zinc-200/50 dark:border-white/10",
    outline: "bg-transparent border-2 border-dashed border-zinc-200 dark:border-zinc-800"
  };

  return (
    <div className={`rounded-3xl transition-all duration-300 ${variants[variant]} ${className}`}>
      {(title || description) && (
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800">
          {title && <h3 className="text-xl font-black uppercase italic tracking-tighter text-black dark:text-white">{title}</h3>}
          {description && <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">{description}</p>}
        </div>
      )}
      <div className={title || description ? "px-8 py-6" : ""}>
        {children}
      </div>
    </div>
  );
};
