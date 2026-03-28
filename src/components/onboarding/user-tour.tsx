"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search,
  TrendingUp,
  FileText,
  BarChart3,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  position: "top" | "bottom" | "left" | "right" | "center";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "¡Bienvenido a NTM!",
    description:
      "Next Trends Monitor es tu kit completo de análisis digital. Te ayudaremos a descubrir oportunidades de negocio, analizar tendencias y auditar presencias digitales. ¡Vamos a conocer las herramientas!",
    icon: <Sparkles className="w-8 h-8 text-emerald-500" />,
    position: "center",
  },
  {
    id: "scanner",
    title: "Scanner de Negocios",
    description:
      "Encuentra negocios locales con datos reales de Google Places. Descubre qué negocios tienen problemas de presencia digital y conviértelos en oportunidades. Perfecto para agencias y consultores.",
    icon: <Search className="w-8 h-8 text-emerald-500" />,
    targetSelector: "[data-tour='scanner']",
    position: "bottom",
  },
  {
    id: "auditor",
    title: "Auditor Digital",
    description:
      "Analiza la presencia digital completa de cualquier negocio. Evalúa su sitio web, redes sociales, SEO y más. Obtén un reporte detallado con recomendaciones de mejora.",
    icon: <BarChart3 className="w-8 h-8 text-cyan-500" />,
    targetSelector: "[data-tour='auditor']",
    position: "bottom",
  },
  {
    id: "trends",
    title: "Cazador de Tendencias",
    description:
      "Detecta tendencias emergentes en tu industria antes que nadie. Analiza patrones de mercado y descubre oportunidades de nicho con inteligencia artificial.",
    icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
    targetSelector: "[data-tour='trends']",
    position: "bottom",
  },
  {
    id: "reports",
    title: "Generador de Reportes",
    description:
      "Crea reportes profesionales listos para presentar a clientes. Exporta en PDF con branding corporativo o en Excel para análisis detallado. Incluye métricas, gráficos y recomendaciones.",
    icon: <FileText className="w-8 h-8 text-orange-500" />,
    targetSelector: "[data-tour='reports']",
    position: "bottom",
  },
];

const STORAGE_KEY = "ntm_tour_completed";

interface UserTourProps {
  forceShow?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function UserTour({ forceShow = false, onComplete, onSkip }: UserTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Check if tour should be shown
  useEffect(() => {
    const tourCompleted = localStorage.getItem(STORAGE_KEY);
    if (!tourCompleted || forceShow) {
      // Small delay to let the page render
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  // Update target element position
  const updateTargetPosition = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Only update if different
        setTargetRect((prev) => {
          if (
            prev &&
            prev.top === rect.top &&
            prev.left === rect.left &&
            prev.width === rect.width &&
            prev.height === rect.height
          ) {
            return prev;
          }
          return rect;
        });
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    // Use requestAnimationFrame to avoid synchronous setState
    const rafId = requestAnimationFrame(() => {
      updateTargetPosition();
    });
    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateTargetPosition);
      window.removeEventListener("scroll", updateTargetPosition);
    };
  }, [updateTargetPosition]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    onSkip?.();
  };

  const step = TOUR_STEPS[currentStep];
  const isCentered = step.position === "center";

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (isCentered || !targetRect) {
      return {};
    }

    const tooltipWidth = 350;
    const tooltipHeight = 200;
    const gap = 16;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    switch (step.position) {
      case "bottom":
        top = targetRect.bottom + gap;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "top":
        top = targetRect.top - tooltipHeight - gap;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - gap;
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + gap;
        break;
    }

    // Keep within viewport
    left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, viewportHeight - tooltipHeight - 16));

    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      zIndex: 10002,
    };
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
            onClick={handleSkip}
          />

          {/* Highlight for target element */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-[10001] pointer-events-none"
              style={{
                top: targetRect.top - 4,
                left: targetRect.left - 4,
                width: targetRect.width + 8,
                height: targetRect.height + 8,
                borderRadius: "12px",
                boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)",
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={
              isCentered
                ? {
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 10002,
                  }
                : getTooltipStyle()
            }
          >
            <Card className="p-6 shadow-2xl border-emerald-500/20 bg-white dark:bg-slate-900 max-w-md">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Paso {currentStep + 1} de {TOUR_STEPS.length}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-slate-600"
                  onClick={handleSkip}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {step.description}
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-4">
                {TOUR_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? "w-6 bg-emerald-500"
                        : index < currentStep
                        ? "w-2 bg-emerald-300 dark:bg-emerald-700"
                        : "w-2 bg-slate-300 dark:bg-slate-700"
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  Saltar tour
                </Button>
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={handlePrev}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    className="bg-emerald-500 hover:bg-emerald-600 gap-1"
                  >
                    {currentStep === TOUR_STEPS.length - 1
                      ? "¡Empezar!"
                      : "Siguiente"}
                    {currentStep < TOUR_STEPS.length - 1 && (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to check if tour should be shown
export function useShouldShowTour(): boolean {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to avoid synchronous setState
    const rafId = requestAnimationFrame(() => {
      const tourCompleted = localStorage.getItem(STORAGE_KEY);
      setShouldShow(!tourCompleted);
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  return shouldShow;
}

// Function to reset tour (useful for testing or user request)
export function resetTour(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export default UserTour;
