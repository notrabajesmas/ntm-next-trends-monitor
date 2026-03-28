"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  FileText, 
  Download,
  Loader2,
  CheckCircle,
  Clock,
  FileBarChart,
  FilePieChart,
  FileSpreadsheet,
  Eye,
  Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Report {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  status: "ready" | "processing" | "failed";
  pdfUrl?: string;
  pdfFilename?: string;
}

export function ReportsGenerator() {
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  const handleGenerate = async () => {
    if (!reportTitle.trim() || !reportType) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el título y tipo de reporte",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: reportTitle,
          reportType: reportType,
          content: reportContent,
          language: "es",
        }),
      });

      const result = await response.json();

      if (result.success && result.report) {
        const newReport: Report = {
          id: result.report.id,
          title: reportTitle,
          type: reportType,
          createdAt: new Date().toLocaleString("es-AR"),
          status: "ready",
          pdfUrl: result.report.pdfUrl,
          pdfFilename: result.report.pdfFilename,
        };

        setReports([newReport, ...reports]);
        
        toast({
          title: "¡Reporte generado!",
          description: "El PDF está listo para descargar",
        });
      } else {
        throw new Error(result.error || "Error generating report");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setReportTitle("");
      setReportType("");
      setReportContent("");
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case "business_scan": return <FileBarChart className="w-5 h-5 text-emerald-400" />;
      case "trend_analysis": return <FilePieChart className="w-5 h-5 text-orange-400" />;
      case "digital_audit": return <FileText className="w-5 h-5 text-blue-400" />;
      case "competitor_analysis": return <FileSpreadsheet className="w-5 h-5 text-purple-400" />;
      default: return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case "business_scan": return "Scanner de Negocios";
      case "trend_analysis": return "Análisis de Tendencias";
      case "digital_audit": return "Auditoría Digital";
      case "competitor_analysis": return "Análisis de Competencia";
      default: return type;
    }
  };

  const handleDownload = (report: Report) => {
    if (report.pdfUrl) {
      // Create download link
      const link = document.createElement('a');
      link.href = report.pdfUrl;
      link.download = report.pdfFilename || `NTM_Report_${report.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Descargando...",
        description: "El PDF se está descargando",
      });
    }
  };

  const handleDelete = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
    toast({
      title: "Reporte eliminado",
      description: "El reporte fue eliminado correctamente",
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Panel de Creación */}
      <Card className="bg-slate-800/50 border-slate-700/50 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Generador de Reportes
          </CardTitle>
          <CardDescription className="text-slate-400">
            Crea reportes PDF profesionales automáticamente con IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportTitle" className="text-slate-300">
              Título del reporte
            </Label>
            <Input
              id="reportTitle"
              placeholder="Ej: Análisis Q1 2026 - Palermo"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">
              Tipo de reporte
            </Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="business_scan">
                  <div className="flex items-center gap-2">
                    <FileBarChart className="w-4 h-4 text-emerald-400" />
                    Scanner de Negocios
                  </div>
                </SelectItem>
                <SelectItem value="trend_analysis">
                  <div className="flex items-center gap-2">
                    <FilePieChart className="w-4 h-4 text-orange-400" />
                    Análisis de Tendencias
                  </div>
                </SelectItem>
                <SelectItem value="digital_audit">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    Auditoría Digital
                  </div>
                </SelectItem>
                <SelectItem value="competitor_analysis">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                    Análisis de Competencia
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportContent" className="text-slate-300">
              Notas adicionales (opcional)
            </Label>
            <Textarea
              id="reportContent"
              placeholder="Agrega contexto o instrucciones especiales para el reporte..."
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
            />
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generando PDF con IA...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generar Reporte PDF
              </>
            )}
          </Button>

          <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
            <p className="text-xs text-slate-300 mb-2">✨ Los reportes incluyen:</p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Resumen ejecutivo generado por IA</li>
              <li>• Hallazgos clave identificados</li>
              <li>• Tablas de datos profesionales</li>
              <li>• Recomendaciones accionables</li>
              <li>• Diseño con branding NTM</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Panel de Reportes */}
      <Card className="bg-slate-800/50 border-slate-700/50 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Mis Reportes</span>
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
              {reports.length} reportes
            </Badge>
          </CardTitle>
          <CardDescription className="text-slate-400">
            Historial de reportes generados con IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                No tienes reportes generados aún
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Crea tu primer reporte usando el panel de la izquierda
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {reports.map((report) => (
                <div 
                  key={report.id}
                  className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      {getReportIcon(report.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white truncate">{report.title}</h4>
                        {report.status === "ready" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Listo
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                            <Clock className="w-3 h-3 mr-1 animate-pulse" />
                            Procesando
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span>{getReportTypeLabel(report.type)}</span>
                        <span>{report.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-slate-400 hover:text-white"
                        disabled={report.status !== "ready"}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                        disabled={report.status !== "ready"}
                        onClick={() => handleDownload(report)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-slate-400 hover:text-red-400"
                        onClick={() => handleDelete(report.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
