"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  History,
  Download,
  Search,
  TrendingUp,
  Shield,
  FileText,
  Loader2,
  CreditCard,
  BarChart3,
  Clock,
  ChevronRight,
  Zap,
  Star,
  Heart,
  Share2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target
} from "lucide-react";

interface HistoryItem {
  id: string;
  toolType: string;
  status: string;
  createdAt: string;
  input: any;
  creditsUsed: number;
}

interface UserStats {
  totalAnalyses: number;
  totalReports: number;
  byTool: {
    scanner: number;
    trends: number;
    auditor: number;
    reports: number;
  };
  creditsUsedThisMonth: number;
  favoriteCount: number;
  sharedReports: number;
  recentActivity: {
    date: string;
    count: number;
  }[];
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  planType: string;
  credits: number;
  hasUnlimited: boolean;
}

interface FavoriteItem {
  id: string;
  itemType: string;
  itemData: any;
  createdAt: string;
  notes?: string;
}

export function UserDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Cargar datos en paralelo
      const [historyRes, favoritesRes] = await Promise.all([
        fetch("/api/history"),
        fetch("/api/favorites")
      ]);

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        if (historyData.success) {
          setUser(historyData.data.user);
          setStats(historyData.data.stats);
          setRecentAnalyses(historyData.data.recentAnalyses || []);
        }
      }

      if (favoritesRes.ok) {
        const favData = await favoritesRes.json();
        if (favData.success) {
          setFavorites(favData.data || []);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case 'scanner': return <Search className="w-4 h-4" />;
      case 'trends': return <TrendingUp className="w-4 h-4" />;
      case 'auditor': return <Shield className="w-4 h-4" />;
      case 'reports': return <FileText className="w-4 h-4" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const getToolName = (toolType: string) => {
    const names: Record<string, string> = {
      scanner: 'Scanner de Negocios',
      trends: 'Cazador de Tendencias',
      auditor: 'Auditor Digital',
      reports: 'Generador de Reportes'
    };
    return names[toolType] || toolType;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <p className="text-slate-400">Inicia sesión para ver tu dashboard</p>
        </CardContent>
      </Card>
    );
  }

  // Datos para el gráfico de uso por herramienta
  const toolUsageData = stats ? [
    { name: 'Scanner', value: stats.byTool.scanner, color: 'bg-emerald-500' },
    { name: 'Tendencias', value: stats.byTool.trends, color: 'bg-purple-500' },
    { name: 'Auditor', value: stats.byTool.auditor, color: 'bg-blue-500' },
    { name: 'Reportes', value: stats.byTool.reports, color: 'bg-amber-500' }
  ] : [];

  const maxUsage = Math.max(...toolUsageData.map(t => t.value), 1);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Créditos</p>
                <p className="text-2xl font-bold text-white">
                  {user.hasUnlimited ? "∞" : user.credits}
                </p>
              </div>
              <Zap className="w-8 h-8 text-emerald-400" />
            </div>
            {!user.hasUnlimited && user.credits <= 5 && (
              <p className="text-xs text-amber-400 mt-2">⚠️ Créditos bajos</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Plan</p>
                <p className="text-2xl font-bold text-white capitalize">{user.planType}</p>
              </div>
              <Badge className={`
                ${user.planType === 'pro' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                ${user.planType === 'enterprise' ? 'bg-purple-500/20 text-purple-400' : ''}
                ${user.planType === 'free' ? 'bg-slate-500/20 text-slate-400' : ''}
              `}>
                {user.planType.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Análisis</p>
                <p className="text-2xl font-bold text-white">{stats?.totalAnalyses || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            {stats && stats.totalAnalyses > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                <ArrowUpRight className="w-3 h-3" />
                <span>Este mes: {stats.creditsUsedThisMonth}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Favoritos</p>
                <p className="text-2xl font-bold text-white">{favorites.length}</p>
              </div>
              <Heart className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de navegación */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 bg-slate-800/50 border border-slate-700/50 h-auto p-1">
          <TabsTrigger value="overview" className="py-2 text-xs sm:text-sm">Resumen</TabsTrigger>
          <TabsTrigger value="activity" className="py-2 text-xs sm:text-sm">Actividad</TabsTrigger>
          <TabsTrigger value="favorites" className="py-2 text-xs sm:text-sm">Favoritos</TabsTrigger>
          <TabsTrigger value="shared" className="py-2 text-xs sm:text-sm">Compartidos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 space-y-6">
          {/* Usage Chart */}
          {stats && stats.totalAnalyses > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Uso por Herramienta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {toolUsageData.map((tool) => (
                    <div key={tool.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${tool.color}`} />
                          <span className="text-sm text-slate-300">{tool.name}</span>
                        </div>
                        <span className="text-sm text-slate-400">{tool.value} análisis</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${tool.color} transition-all duration-500`}
                          style={{ width: `${(tool.value / maxUsage) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total */}
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total de análisis</span>
                    <span className="text-xl font-bold text-white">{stats.totalAnalyses}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white h-auto py-3">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs">Nuevo Scanner</span>
                  </div>
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white h-auto py-3">
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span className="text-xs">Nueva Auditoría</span>
                  </div>
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white h-auto py-3">
                  <div className="flex flex-col items-center gap-2">
                    <Download className="w-5 h-5 text-amber-400" />
                    <span className="text-xs">Exportar Todo</span>
                  </div>
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white h-auto py-3">
                  <div className="flex flex-col items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    <span className="text-xs">Actualizar Plan</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Empty state */}
          {(!stats || stats.totalAnalyses === 0) && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">Aún no hay análisis</p>
                <p className="text-xs text-slate-500">Usa las herramientas para comenzar a ver estadísticas</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>Tus últimos análisis</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAnalyses.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Aún no hay análisis</p>
                  <p className="text-xs text-slate-500 mt-1">Usa las herramientas para comenzar</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {recentAnalyses.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                        {getToolIcon(item.toolType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {getToolName(item.toolType)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.input?.location || item.input?.keyword || item.input?.businessName || "Análisis"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                        <p className="text-xs text-slate-500">{item.creditsUsed} crédito</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Mis Favoritos
              </CardTitle>
              <CardDescription>Negocios y reportes guardados</CardDescription>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No tienes favoritos aún</p>
                  <p className="text-xs text-slate-500 mt-1">Guarda negocios interesantes con el botón ❤️</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {favorites.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                        <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {item.itemData?.name || item.itemData?.title || "Favorito"}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">
                          {item.itemType}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shared Tab */}
        <TabsContent value="shared" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-400" />
                Reportes Compartidos
              </CardTitle>
              <CardDescription>Links para compartir tus análisis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Share2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-2">Comparte tus análisis</p>
                <p className="text-xs text-slate-500 mb-4">Genera un link público para cualquier reporte</p>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  Crear link compartido
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade CTA */}
      {user.planType === 'free' && (
        <Card className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-500/30">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              ¿Necesitas más análisis?
            </h3>
            <p className="text-sm text-slate-300 mb-4">
              Actualiza a Pro para obtener 100 análisis mensuales
            </p>
            <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
              Ver Planes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
