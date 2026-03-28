"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Globe, 
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Smartphone,
  Zap,
  FileText,
  Share2,
  Mail,
  Download
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AuditResult {
  overallScore: number;
  businessInfo?: {
    name: string;
    foundOnGoogle: boolean;
    hasWebsite: boolean;
    websiteUrl?: string;
    websiteStatus?: number;
    hasSocialMedia: boolean;
  };
  categories: {
    name: string;
    score: number;
    status: "good" | "warning" | "bad" | "unknown";
    items: {
      name: string;
      status: "pass" | "fail" | "warning" | "unknown";
      message: string;
      source?: string;
    }[];
  }[];
  recommendations: string[];
  quickWins?: string[];
  rawSources?: { name: string; url: string }[];
}

interface DigitalAuditorProps {
  initialBusinessName?: string;
  initialWebsite?: string;
}

export function DigitalAuditor({ initialBusinessName, initialWebsite }: DigitalAuditorProps) {
  const [businessUrl, setBusinessUrl] = useState(initialWebsite || "");
  const [businessName, setBusinessName] = useState(initialBusinessName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [hasAudited, setHasAudited] = useState(false);

  // Cuando cambian las props, actualizar los campos
  useEffect(() => {
    if (initialBusinessName) {
      setBusinessName(initialBusinessName);
      setBusinessUrl(initialWebsite || "");
      // Auto-iniciar auditoría si viene del Scanner
      if (initialBusinessName && !hasAudited) {
        // Pequeño delay para que se renderice
        setTimeout(() => {
          handleAudit(initialBusinessName, initialWebsite);
        }, 500);
      }
    }
  }, [initialBusinessName, initialWebsite]);

  const handleAudit = async (name?: string, url?: string) => {
    const auditName = name || businessName;
    const auditUrl = url || businessUrl;
    
    if (!auditName.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa el nombre del negocio",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setHasAudited(true);
    setAudit(null);

    try {
      const response = await fetch("/api/audit-digital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          businessName: auditName, 
          website: auditUrl 
        })
      });

      const data = await response.json();

      if (data.success && data.data) {
        setAudit(data.data);
        toast({
          title: "¡Auditoría completada!",
          description: `Score general: ${data.data.overallScore}/100`,
        });
      } else {
        throw new Error(data.error || "Error en la auditoría");
      }
    } catch (error) {
      console.error("Audit error:", error);
      toast({
        title: "Error en la auditoría",
        description: "No se pudo completar el análisis. Intenta de nuevo.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "fail":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case "Presencia Web": return <Globe className="w-4 h-4" />;
      case "Google My Business": 
      case "Visibilidad en Búsqueda": return <Search className="w-4 h-4" />;
      case "Redes Sociales": return <Share2 className="w-4 h-4" />;
      case "Reputación Online": return <FileText className="w-4 h-4" />;
      case "SEO Local": return <Zap className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Panel de Búsqueda */}
      <Card className="bg-slate-800/50 border-slate-700/50 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Auditor Digital
          </CardTitle>
          <CardDescription className="text-slate-400">
            Analiza la salud digital completa de cualquier negocio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-slate-300">
              Nombre del negocio
            </Label>
            <Input
              id="businessName"
              placeholder="Ej: Restaurante La Parrilla"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessUrl" className="text-slate-300">
              <Globe className="w-4 h-4 inline mr-2" />
              Sitio web (opcional)
            </Label>
            <Input
              id="businessUrl"
              placeholder="Ej: laparrilla.com.ar"
              value={businessUrl}
              onChange={(e) => setBusinessUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          <Button 
            onClick={() => handleAudit()}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Auditando negocio...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Iniciar Auditoría
              </>
            )}
          </Button>

          {/* Info Box */}
          <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-2">El análisis incluye:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-300">
                <Globe className="w-3 h-3 text-blue-400" /> Sitio web
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <Search className="w-3 h-3 text-blue-400" /> Google
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <Share2 className="w-3 h-3 text-blue-400" /> Redes sociales
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <FileText className="w-3 h-3 text-blue-400" /> Reseñas
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Panel de Resultados */}
      <Card className="bg-slate-800/50 border-slate-700/50 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Informe de Auditoría</span>
            {audit && (
              <div className={`text-2xl font-bold ${getScoreColor(audit.overallScore)}`}>
                {audit.overallScore}/100
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-slate-400">
            Análisis detallado de presencia digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasAudited ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                Ingresa un nombre de negocio para auditar su presencia digital
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Analizaremos más de 20 factores clave
              </p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
              <p className="text-slate-400">Auditando {businessName}...</p>
              <div className="flex justify-center gap-4 mt-4 text-xs text-slate-500">
                <span>🌐 Analizando web...</span>
                <span>📊 Verificando Google...</span>
                <span>📱 Chequeando redes...</span>
              </div>
            </div>
          ) : audit ? (
            <div className="space-y-6">
              {/* Business Info */}
              {audit.businessInfo && (
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center font-bold text-white">
                      {businessName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{audit.businessInfo.name}</p>
                      <div className="flex gap-2 mt-1">
                        {audit.businessInfo.hasWebsite && (
                          <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30">
                            Web: {audit.businessInfo.websiteStatus || 'OK'}
                          </Badge>
                        )}
                        {audit.businessInfo.foundOnGoogle && (
                          <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">
                            En Google
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Overall Score */}
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300">Score General</span>
                  <span className={`font-bold ${getScoreColor(audit.overallScore)}`}>
                    {audit.overallScore < 40 ? "⚠️ Necesita mejoras urgentes" : 
                     audit.overallScore < 70 ? "📈 En desarrollo" : "✅ Buena presencia"}
                  </span>
                </div>
                <Progress value={audit.overallScore} className="h-3" />
              </div>

              {/* Categories */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {audit.categories.map((category, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category.name)}
                        <span className="font-medium text-white">{category.name}</span>
                      </div>
                      <div className={`font-bold ${getScoreColor(category.score)}`}>
                        {category.score}%
                      </div>
                    </div>
                    <Progress value={category.score} className="h-2 mb-3" />
                    <div className="space-y-1">
                      {category.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-2 text-sm">
                          {getStatusIcon(item.status)}
                          <span className="text-slate-300">{item.name}</span>
                          <span className="text-xs text-slate-500 ml-auto">{item.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              {audit.recommendations && audit.recommendations.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-500/20">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    Recomendaciones
                  </h4>
                  <ul className="space-y-2">
                    {audit.recommendations.slice(0, 5).map((rec, idx) => (
                      <li key={idx} className="text-sm text-slate-300">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Wins */}
              {audit.quickWins && audit.quickWins.length > 0 && (
                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <h4 className="font-semibold text-emerald-400 mb-2 text-sm">Quick Wins</h4>
                  <ul className="space-y-1">
                    {audit.quickWins.map((win, idx) => (
                      <li key={idx} className="text-xs text-slate-300">• {win}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-slate-600 text-slate-300">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Detalle
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                  <Download className="w-4 h-4 mr-2" />
                  Generar PDF
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
