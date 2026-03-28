"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Zap
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
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  planType: string;
  credits: number;
  hasUnlimited: boolean;
}

export function UserDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch("/api/history");
      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setStats(data.data.stats);
        setRecentAnalyses(data.data.recentAnalyses || []);
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

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
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

        <Card className="bg-slate-800/50 border-slate-700">
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

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Análisis</p>
                <p className="text-2xl font-bold text-white">{stats?.totalAnalyses || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Reportes</p>
                <p className="text-2xl font-bold text-white">{stats?.totalReports || 0}</p>
              </div>
              <Download className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Chart */}
      {stats && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Uso por Herramienta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.byTool).map(([tool, count]) => (
                <div key={tool}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300 capitalize">{getToolName(tool)}</span>
                    <span className="text-sm text-slate-400">{count} análisis</span>
                  </div>
                  <Progress 
                    value={stats.totalAnalyses > 0 ? (count / stats.totalAnalyses) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
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
            <div className="space-y-3">
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
