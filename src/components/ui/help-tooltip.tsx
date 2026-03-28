"use client";

import React, { useState, ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info, AlertCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type HelpVariant = "default" | "info" | "warning" | "tip";

interface HelpTooltipProps {
  content: ReactNode;
  title?: string;
  variant?: HelpVariant;
  icon?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
  iconClassName?: string;
  contentClassName?: string;
  showIcon?: boolean;
  children?: ReactNode;
}

const variantConfig: Record<
  HelpVariant,
  {
    icon: ReactNode;
    iconColor: string;
    borderColor: string;
    bgColor: string;
  }
> = {
  default: {
    icon: <HelpCircle className="h-4 w-4" />,
    iconColor: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
    borderColor: "border-slate-200 dark:border-slate-700",
    bgColor: "bg-slate-50 dark:bg-slate-800",
  },
  info: {
    icon: <Info className="h-4 w-4" />,
    iconColor: "text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
  },
  warning: {
    icon: <AlertCircle className="h-4 w-4" />,
    iconColor:
      "text-amber-400 hover:text-amber-600 dark:hover:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-800",
    bgColor: "bg-amber-50 dark:bg-amber-950",
  },
  tip: {
    icon: <Lightbulb className="h-4 w-4" />,
    iconColor:
      "text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
  },
};

export function HelpTooltip({
  content,
  title,
  variant = "default",
  icon,
  side = "top",
  align = "center",
  className,
  iconClassName,
  contentClassName,
  showIcon = true,
  children,
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = variantConfig[variant];

  const displayIcon = icon || config.icon;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          {children ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 cursor-help",
                className
              )}
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              {children}
              {showIcon && (
                <span className={cn(config.iconColor, iconClassName)}>
                  {displayIcon}
                </span>
              )}
            </span>
          ) : (
            <button
              type="button"
              className={cn(
                "inline-flex items-center justify-center p-1 rounded-full transition-colors",
                config.iconColor,
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                className
              )}
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              {displayIcon}
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          sideOffset={8}
          className={cn(
            "max-w-xs p-0 border shadow-lg",
            config.borderColor,
            contentClassName
          )}
        >
          <div
            className={cn(
              "px-3 py-2 border-b",
              config.borderColor,
              config.bgColor
            )}
          >
            <div className="flex items-center gap-2">
              <span className={config.iconColor}>{displayIcon}</span>
              {title && (
                <span className="font-medium text-sm text-slate-700 dark:text-slate-200">
                  {title}
                </span>
              )}
            </div>
          </div>
          <div className="px-3 py-2">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {content}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Simplified inline help icon
interface HelpIconProps {
  content: string;
  title?: string;
  variant?: HelpVariant;
  className?: string;
}

export function HelpIcon({
  content,
  title,
  variant = "default",
  className,
}: HelpIconProps) {
  return (
    <HelpTooltip
      content={content}
      title={title}
      variant={variant}
      className={className}
    />
  );
}

// Help badge for inline use
interface HelpBadgeProps {
  content: string;
  label?: string;
  variant?: HelpVariant;
  className?: string;
}

export function HelpBadge({
  content,
  label = "?",
  variant = "default",
  className,
}: HelpBadgeProps) {
  const config = variantConfig[variant];

  return (
    <HelpTooltip content={content} variant={variant} showIcon={false}>
      <span
        className={cn(
          "inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full cursor-help",
          "bg-slate-100 dark:bg-slate-800",
          config.iconColor,
          "border border-current/20",
          className
        )}
      >
        {label}
      </span>
    </HelpTooltip>
  );
}

// Section help for headings
interface SectionHelpProps {
  title: string;
  description: string;
  variant?: HelpVariant;
  className?: string;
}

export function SectionHelp({
  title,
  description,
  variant = "default",
  className,
}: SectionHelpProps) {
  return (
    <HelpTooltip
      content={description}
      title={title}
      variant={variant}
      showIcon={true}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-help",
          className
        )}
      >
        {title}
      </span>
    </HelpTooltip>
  );
}

export default HelpTooltip;
