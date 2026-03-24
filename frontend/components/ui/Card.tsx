import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Card Component
 * A premium reusable card container.
 */
export const Card: React.FC<CardProps> = ({ children, title, description, className = "" }) => {
  return (
    <div className={`bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-sm transition-all hover:shadow-md ${className}`}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900">
          {title && <h3 className="text-lg font-semibold text-black dark:text-zinc-100">{title}</h3>}
          {description && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
