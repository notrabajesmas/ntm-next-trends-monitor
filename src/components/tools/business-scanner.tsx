"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Building2, 
  Globe, 
  Phone, 
  Star, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  Eye,
  ExternalLink,
  Shield
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BusinessResult {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  hasWebsite: boolean;
  hasClaimed: boolean;
  issues: string[];
  businessType: string;
  source?: string;
}

interface BusinessScannerProps {
  onAuditBusiness?: (businessName: string, website?: string) => void;
}

export function BusinessScanner({ onAuditBusiness }: BusinessScannerProps) {
  const [location, setLocation] = useState("");
  const [businessType, setBusinessType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BusinessResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessResult | null>(null);

  const handleSearch = async () => {
    if (!location.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa una zona geográfica",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setSelectedBusiness(null);

    try {
      const response = await fetch("/api/scan-businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, businessType })
      });

      const data = await response.json();

      if (data.success && data.data?.businesses) {
        const businesses = data.data.businesses.map((b: Record<string, unknown>, i: number) => ({
          id: `business_${i}`,
          name: b.name as string,
          address: b.address as string,
          phone: b.phone as string | undefined,
          website: b.website as string | undefined,
          rating: b.rating as number | undefined,
          reviewCount: b.reviewCount as number | undefined,
          hasWebsite: !!b.website,
          hasClaimed: false,
          issues: (b.issues as string[]) || [],
          businessType: b.businessType as string,
          source: b.source as string | undefined
        }));
        
        setResults(businesses);
        toast({
          title: "¡Análisis completado!",
          description: `Se encontraron ${businesses.length} negocios con oportunidades`,
        });
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error en la búsqueda",
        description: "No se pudo completar el análisis. Intenta de nuevo.",
        variant: "destructive"
      });
      setResults([]);
    }

    setIsLoading(false);
  };

  const handleViewMore = (business: BusinessResult) => {
    setSelectedBusiness(selectedBusiness?.id === business.id ? null : business);
  };

  const handleAuditBusiness = (business: BusinessResult) => {
    // Notificar al componente padre para cambiar a la tab de Auditor
    if (onAuditBusiness) {
      onAuditBusiness(business.name, business.website);
    }
    
    toast({
      title: "Auditoría Digital",
      description: `Iniciando auditoría para "${business.name}"...`,
    });
  };

  const handleSearchInGoogle = (business: BusinessResult) => {
    const query = encodeURIComponent(`"${business.name}" ${business.address}`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;
    
    const headers = ['Nombre', 'Dirección', 'Teléfono', 'Website', 'Rating', 'Reseñas', 'Tipo', 'Problemas'];
    const rows = results.map(b => [
      b.name,
      b.address,
      b.phone || 'N/A',
      b.website || 'Sin sitio web',
      b.rating?.toString() || 'N/A',
      b.reviewCount?.toString() || 'N/A',
      b.businessType,
      b.issues.join('; ')
    ]);
    
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `negocios_${location.replace(/\s+/g, '_')}.csv`;
    a.click();
    
    toast({
      title: "CSV descargado",
      description: `Se exportaron ${results.length} negocios`,
    });
  };

  const getIssueBadge = (issue: string) => {
    if (issue.includes("Sin sitio web")) return "destructive";
    if (issue.includes("no reclamado")) return "warning";
    if (issue.includes("Rating")) return "secondary";
    return "outline";
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Panel de Búsqueda */}
      <Card className="bg-slate-800/50 border-slate-700/50 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-400" />
            Scanner de Negocios
          </CardTitle>
          <CardDescription className="text-slate-400">
            Encuentra negocios sin presencia digital en cualquier zona
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location" className="text-slate-300">
              <MapPin className="w-4 h-4 inline mr-2" />
              Zona geográfica
            </Label>
            <Input
              id="location"
              placeholder="Ej: Palermo, Buenos Aires"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">
              <Building2 className="w-4 h-4 inline mr-2" />
              Tipo de negocio
            </Label>
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="restaurant">Restaurantes</SelectItem>
                <SelectItem value="store">Tiendas</SelectItem>
                <SelectItem value="service">Servicios</SelectItem>
                <SelectItem value="health">Salud</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analizando zona...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Analizar Zona
              </>
            )}
          </Button>

          {/* Info Box */}
          <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-400">
              <AlertTriangle className="w-3 h-3 inline mr-1 text-amber-400" />
              Este análisis consume <strong className="text-white">1 crédito</strong>. 
              Los resultados incluyen fuentes para verificar.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Panel de Resultados */}
      <Card className="bg-slate-800/50 border-slate-700/50 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Resultados del Análisis</span>
            {results.length > 0 && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                {results.length} oportunidades
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-slate-400">
            Negocios detectados con oportunidades de mejora digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasSearched ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                Ingresa una zona geográfica para comenzar el análisis
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Detectaremos negocios sin sitio web, sin presencia digital o con problemas
              </p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-spin" />
              <p className="text-slate-400">Analizando negocios en {location}...</p>
              <p className="text-sm text-slate-500 mt-2">
                Esto puede tomar unos segundos
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <p className="text-slate-400">No se encontraron resultados</p>
              <p className="text-sm text-slate-500 mt-2">
                Intenta con otra zona o tipo de negocio
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {results.map((business) => (
                <div key={business.id}>
                  <div 
                    className={`p-4 bg-slate-900/50 rounded-lg border transition-colors ${
                      selectedBusiness?.id === business.id 
                        ? 'border-emerald-500/50' 
                        : 'border-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-white">{business.name}</h4>
                          {business.hasWebsite ? (
                            <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30">
                              <Globe className="w-3 h-3 mr-1" />
                              Web
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              <XCircle className="w-3 h-3 mr-1" />
                              Sin Web
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-400 flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3" />
                          {business.address}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                          {business.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {business.phone}
                            </span>
                          )}
                          {business.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              {business.rating} ({business.reviewCount} reseñas)
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {business.issues.slice(0, 3).map((issue, idx) => (
                            <Badge 
                              key={idx} 
                              variant={getIssueBadge(issue) as "destructive" | "secondary" | "outline"}
                              className="text-xs"
                            >
                              {issue}
                            </Badge>
                          ))}
                          {business.issues.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{business.issues.length - 3} más
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-slate-600 text-slate-300 hover:text-white"
                          onClick={() => handleViewMore(business)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {selectedBusiness?.id === business.id ? 'Ocultar' : 'Ver más'}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Panel expandido con más opciones */}
                    {selectedBusiness?.id === business.id && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                            onClick={() => handleAuditBusiness(business)}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Auditar Presencia Digital
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-slate-300"
                            onClick={() => handleSearchInGoogle(business)}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Buscar en Google
                          </Button>
                        </div>
                        
                        {business.source && (
                          <div className="mt-3 p-2 bg-slate-800/50 rounded text-xs text-slate-400">
                            <strong>Fuente:</strong>{' '}
                            <a href={business.source} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                              {business.source}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Export Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                <Button 
                  variant="outline" 
                  className="flex-1 border-slate-600 text-slate-300"
                  onClick={handleExportCSV}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                  onClick={() => {
                    toast({
                      title: "Generando PDF",
                      description: "El reporte se está generando...",
                    });
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generar PDF
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
