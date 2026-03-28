"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  TrendingUp,
  Shield,
  FileText,
  MapPin,
  Star,
  Globe,
  Phone,
  ExternalLink,
  Download,
  Share2,
  Clock,
  Eye
} from "lucide-react";

interface SharedReportViewProps {
  report: {
    id: string;
    title: string;
    reportType: string;
    content: any;
    userName: string;
    viewCount: number;
    createdAt: Date;
    expiresAt?: Date | null;
  };
}

export function SharedReportView({ report }: SharedReportViewProps) {
  const [copied, setCopied] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "scanner": return <Search className="w-5 h-5" />;
      case "trends": return <TrendingUp className="w-5 h-5" />;
      case "auditor": return <Shield className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      scanner: "Scanner de Negocios",
      trends: "Cazador de Tendencias",
      auditor: "Auditor Digital"
    };
    return names[type] || type;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            {getTypeIcon(report.reportType)}
            <span className="ml-2">{getTypeName(report.reportType)}</span>
          </Badge>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {report.title}
          </h1>
          
          <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(report.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {report.viewCount} vistas
            </span>
          </div>
          
          <p className="text-slate-500 text-sm">
            Generado por <span className="text-emerald-400">{report.userName}</span> con NTM
          </p>
        </div>

        {/* Content */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            {/* Scanner Results */}
            {report.reportType === "scanner" && report.content.businesses && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Negocios Encontrados ({report.content.businesses.length})
                </h2>
                
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {report.content.businesses.map((business: any, idx: number) => (
                    <div 
                      key={idx}
                      className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-white">{business.name}</h3>
                          <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {business.address}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {business.rating && (
                              <Badge variant="outline" className="text-xs text-amber-400">
                                <Star className="w-3 h-3 mr-1 fill-amber-400" />
                                {business.rating}
                              </Badge>
                            )}
                            {business.phone && (
                              <Badge variant="outline" className="text-xs text-slate-400">
                                <Phone className="w-3 h-3 mr-1" />
                                {business.phone}
                              </Badge>
                            )}
                            {business.website && (
                              <Badge variant="outline" className="text-xs text-emerald-400">
                                <Globe className="w-3 h-3 mr-1" />
                                Web
                              </Badge>
                            )}
                          </div>
                          
                          {business.issues && business.issues.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {business.issues.slice(0, 3).map((issue: string, i: number) => (
                                <span 
                                  key={i}
                                  className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 rounded"
                                >
                                  {issue}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {business.googleMapsUrl && (
                          <a
                            href={business.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trends Results */}
            {report.reportType === "trends" && (
              <div className="space-y-6">
                {report.content.trendScore && (
                  <div className="text-center p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-sm text-slate-400 mb-2">Score de Tendencia</p>
                    <p className="text-5xl font-bold text-white">{report.content.trendScore}</p>
                    <p className="text-sm text-purple-400 mt-2">{report.content.trendLevel}</p>
                  </div>
                )}
                
                {report.content.opportunities && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Oportunidades</h3>
                    <ul className="space-y-2">
                      {report.content.opportunities.map((opp: string, i: number) => (
                        <li key={i} className="text-slate-300 text-sm pl-4 border-l-2 border-emerald-500">
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Auditor Results */}
            {report.reportType === "auditor" && (
              <div className="space-y-6">
                {report.content.overallScore !== undefined && (
                  <div className="text-center p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-slate-400 mb-2">Score General</p>
                    <p className="text-5xl font-bold text-white">{report.content.overallScore}</p>
                    <p className="text-sm text-blue-400 mt-2">/100</p>
                  </div>
                )}
                
                {report.content.categories && (
                  <div className="space-y-3">
                    {report.content.categories.map((cat: any, i: number) => (
                      <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">{cat.name}</span>
                          <span className={`font-bold ${cat.score >= 70 ? 'text-emerald-400' : cat.score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                            {cat.score}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${cat.score >= 70 ? 'bg-emerald-500' : cat.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${cat.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Generic fallback */}
            {!["scanner", "trends", "auditor"].includes(report.reportType) && (
              <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                {JSON.stringify(report.content, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300"
            onClick={handleCopyLink}
          >
            <Share2 className="w-4 h-4 mr-2" />
            {copied ? "¡Copiado!" : "Copiar Link"}
          </Button>
          
          <Button
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
            onClick={handleExportPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 pt-4">
          <p>
            Generado con{" "}
            <a href="/" className="text-emerald-400 hover:underline">
              NTM - Next Trends Monitor
            </a>
          </p>
          {report.expiresAt && (
            <p className="mt-1">
              Válido hasta: {formatDate(report.expiresAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
