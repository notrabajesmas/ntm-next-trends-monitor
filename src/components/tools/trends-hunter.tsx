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
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Search, 
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Loader2,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TrendResult {
  id: string;
  keyword: string;
  platform: string;
  searchVolume: number;
  growthRate: number;
  competition: "low" | "medium" | "high";
  trendScore: number;
  opportunity: "high" | "medium" | "low";
  relatedKeywords: string[];
  insights: string;
}

// Demo data para tendencias
const demoTrends: TrendResult[] = [
  {
    id: "1",
    keyword: "ia para pequeños negocios",
    platform: "Google",
    searchVolume: 12500,
    growthRate: 245,
    competition: "low",
    trendScore: 92,
    opportunity: "high",
    relatedKeywords: ["automatización ia", "chatbot negocios", "ia ventas"],
    insights: "Tendencia explosiva con baja competencia. Ideal para contenido educativo y servicios de consultoría."
  },
  {
    id: "2",
    keyword: "comida saludable delivery",
    platform: "Google",
    searchVolume: 28000,
    growthRate: 45,
    competition: "medium",
    trendScore: 78,
    opportunity: "medium",
    relatedKeywords: ["viandas saludables", "comida fitness delivery", "menu semanal saludable"],
    insights: "Mercado en crecimiento constante. Oportunidad en nichos específicos como keto o vegano."
  },
  {
    id: "3",
    keyword: "trabajo remoto latinoamérica",
    platform: "Twitter",
    searchVolume: 8500,
    growthRate: 180,
    competition: "low",
    trendScore: 88,
    opportunity: "high",
    relatedKeywords: ["jobs latam", "remote work latam", "trabajo desde casa"],
    insights: "Alto crecimiento, poca competencia. Perfecto para plataformas de empleo o contenido sobre carreras remotas."
  },
  {
    id: "4",
    keyword: "invertir en cripto 2024",
    platform: "YouTube",
    searchVolume: 45000,
    growthRate: -15,
    competition: "high",
    trendScore: 45,
    opportunity: "low",
    relatedKeywords: ["bitcoin 2024", "ethereum precio", "mejores criptos"],
    insights: "Tendencia en declive con alta competencia. No recomendado para nuevos entrantes."
  },
  {
    id: "5",
    keyword: "minimalismo digital",
    platform: "Google",
    searchVolume: 5200,
    growthRate: 320,
    competition: "low",
    trendScore: 95,
    opportunity: "high",
    relatedKeywords: ["detox digital", "productividad minimalista", "apps minimalistas"],
    insights: "🔥 Tendencia emergente con crecimiento exponencial. Muy poca competencia. Oportunidad única."
  }
];

export function TrendsHunter() {
  const [keyword, setKeyword] = useState("");
  const [platform, setPlatform] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TrendResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa un nicho o palabra clave",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Filtrar y ordenar por opportunity score
    const filtered = [...demoTrends]
      .filter(t => platform === "all" || t.platform.toLowerCase() === platform)
      .sort((a, b) => b.trendScore - a.trendScore);
    
    setResults(filtered);
    setIsLoading(false);

    toast({
      title: "¡Análisis completado!",
      description: `Se detectaron ${filtered.length} tendencias para "${keyword}"`,
    });
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case "high": return "text-emerald-400";
      case "medium": return "text-amber-400";
      case "low": return "text-red-400";
      default: return "text-slate-400";
    }
  };

  const getCompetitionBadge = (competition: string) => {
    switch (competition) {
      case "low": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "medium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "high": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 100) return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
    if (rate > 0) return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
    if (rate < 0) return <ArrowDownRight className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Panel de Búsqueda */}
      <Card className="bg-slate-800/50 border-slate-700/50 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Cazador de Tendencias
          </CardTitle>
          <CardDescription className="text-slate-400">
            Detecta tendencias emergentes antes que tu competencia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyword" className="text-slate-300">
              <Search className="w-4 h-4 inline mr-2" />
              Nicho o palabra clave
            </Label>
            <Input
              id="keyword"
              placeholder="Ej: marketing digital, fitness, finanzas"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Plataforma
            </Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Todas las plataformas" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">Todas las plataformas</SelectItem>
                <SelectItem value="google">Google Trends</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analizando tendencias...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Cazar Tendencias
              </>
            )}
          </Button>

          {/* Quick Stats */}
          <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-2">Tendencias detectadas hoy:</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-emerald-400">12</div>
                <div className="text-xs text-slate-500">Hot 🔥</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-400">28</div>
                <div className="text-xs text-slate-500">Rising</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-400">5</div>
                <div className="text-xs text-slate-500">Declining</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Panel de Resultados */}
      <Card className="bg-slate-800/50 border-slate-700/50 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Análisis de Tendencias</span>
            {results.length > 0 && (
              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                <Sparkles className="w-3 h-3 mr-1" />
                {results.filter(r => r.opportunity === "high").length} oportunidades high
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-slate-400">
            Tendencias ordenadas por potencial de oportunidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasSearched ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                Ingresa un nicho para descubrir tendencias emergentes
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Analizaremos Google, Twitter, YouTube y Reddit
              </p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-orange-400 mx-auto mb-4 animate-spin" />
              <p className="text-slate-400">Analizando tendencias para "{keyword}"...</p>
              <p className="text-sm text-slate-500 mt-2">
                Consultando múltiples plataformas
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No se encontraron tendencias</p>
              <p className="text-sm text-slate-500 mt-2">
                Intenta con otro nicho o palabra clave
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {results.map((trend, index) => (
                <div 
                  key={trend.id}
                  className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Rank */}
                    <div className={`text-2xl font-bold ${getOpportunityColor(trend.opportunity)}`}>
                      #{index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-white">{trend.keyword}</h4>
                        <Badge variant="outline" className="text-xs text-slate-400">
                          {trend.platform}
                        </Badge>
                        {trend.growthRate > 100 && (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            Explosivo
                          </Badge>
                        )}
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Vol. búsqueda</div>
                          <div className="font-semibold text-white">
                            {trend.searchVolume.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Crecimiento</div>
                          <div className={`font-semibold flex items-center ${trend.growthRate > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {getGrowthIcon(trend.growthRate)}
                            {trend.growthRate}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Competencia</div>
                          <Badge variant="outline" className={`text-xs ${getCompetitionBadge(trend.competition)}`}>
                            {trend.competition === "low" ? "Baja" : trend.competition === "medium" ? "Media" : "Alta"}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Score NTM</div>
                          <div className="flex items-center gap-2">
                            <Progress value={trend.trendScore} className="h-2 flex-1" />
                            <span className="font-semibold text-white">{trend.trendScore}</span>
                          </div>
                        </div>
                      </div>

                      {/* Keywords relacionadas */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {trend.relatedKeywords.map((kw, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {kw}
                          </Badge>
                        ))}
                      </div>

                      {/* Insight */}
                      <div className="p-2 bg-slate-800/50 rounded border border-slate-700/30">
                        <p className="text-xs text-slate-300">
                          <Target className="w-3 h-3 inline mr-1 text-cyan-400" />
                          {trend.insights}
                        </p>
                      </div>
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
