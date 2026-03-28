"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  FileText,
  BarChart3,
  Settings,
  Download,
  RefreshCw,
  Eye,
  MoreHorizontal
} from "lucide-react";

// Datos de demostración para el panel
const stats = {
  totalUsers: 1247,
  activeUsers: 823,
  newUsersToday: 34,
  monthlyRevenue: 2847000, // ARS
  paidSubscriptions: 187,
  analysisCount: 4521,
  reportsGenerated: 892,
  avgSessionTime: "4m 32s"
};

const recentUsers = [
  { id: 1, name: "Juan Pérez", email: "juan@email.com", plan: "pro", joined: "2024-01-15", credits: 85 },
  { id: 2, name: "María García", email: "maria@email.com", plan: "enterprise", joined: "2024-01-14", credits: "∞" },
  { id: 3, name: "Carlos López", email: "carlos@email.com", plan: "free", joined: "2024-01-14", credits: 2 },
  { id: 4, name: "Ana Martínez", email: "ana@email.com", plan: "pro", joined: "2024-01-13", credits: 67 },
  { id: 5, name: "Roberto Díaz", email: "roberto@email.com", plan: "free", joined: "2024-01-13", credits: 3 },
];

const recentActivity = [
  { id: 1, type: "scan", user: "juan@email.com", detail: "Análisis: Palermo, CABA", time: "2 min ago" },
  { id: 2, type: "payment", user: "maria@email.com", detail: "Plan Enterprise activado", time: "15 min ago" },
  { id: 3, type: "trend", user: "carlos@email.com", detail: "Tendencias: Marketing Digital", time: "23 min ago" },
  { id: 4, type: "audit", user: "ana@email.com", detail: "Auditoría: Restaurante XYZ", time: "45 min ago" },
  { id: 5, type: "report", user: "roberto@email.com", detail: "PDF generado", time: "1 hour ago" },
];

const revenueData = [
  { month: "Sep", revenue: 1850000 },
  { month: "Oct", revenue: 2120000 },
  { month: "Nov", revenue: 2450000 },
  { month: "Dic", revenue: 2680000 },
  { month: "Ene", revenue: 2847000 },
];

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "scan": return <Eye className="w-4 h-4 text-emerald-400" />;
      case "payment": return <DollarSign className="w-4 h-4 text-green-400" />;
      case "trend": return <TrendingUp className="w-4 h-4 text-orange-400" />;
      case "audit": return <Activity className="w-4 h-4 text-blue-400" />;
      case "report": return <FileText className="w-4 h-4 text-purple-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "pro": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "enterprise": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-slate-900">
                NTM
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Panel de Administración</h1>
                <p className="text-xs text-slate-400">Next Trends Monitor</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border border-slate-700 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <BarChart3 className="w-4 h-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Users className="w-4 h-4 mr-2" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <DollarSign className="w-4 h-4 mr-2" />
              Ingresos
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Activity className="w-4 h-4 mr-2" />
              Actividad
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400">Usuarios Totales</CardDescription>
                  <CardTitle className="text-2xl text-white">{stats.totalUsers.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-emerald-400">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{stats.newUsersToday} hoy
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400">Ingresos Mensuales</CardDescription>
                  <CardTitle className="text-2xl text-white">${(stats.monthlyRevenue / 1000000).toFixed(2)}M</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-emerald-400">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +6.2% vs mes anterior
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400">Suscripciones Pagas</CardDescription>
                  <CardTitle className="text-2xl text-white">{stats.paidSubscriptions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={(stats.paidSubscriptions / stats.totalUsers) * 100} className="h-2" />
                  <p className="text-xs text-slate-400 mt-1">
                    {((stats.paidSubscriptions / stats.totalUsers) * 100).toFixed(1)}% conversión
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400">Análisis Realizados</CardDescription>
                  <CardTitle className="text-2xl text-white">{stats.analysisCount.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-400">
                    {stats.reportsGenerated} reportes generados
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Actividad Reciente</CardTitle>
                  <CardDescription className="text-slate-400">Últimas acciones en la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg">
                        <div className="p-2 bg-slate-800 rounded-lg">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{activity.detail}</p>
                          <p className="text-xs text-slate-500">{activity.user}</p>
                        </div>
                        <span className="text-xs text-slate-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Users */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Usuarios Recientes</CardTitle>
                  <CardDescription className="text-slate-400">Nuevos registros</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-slate-900">
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        <Badge className={getPlanBadge(user.plan)}>
                          {user.plan}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-slate-400">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Gestión de Usuarios</CardTitle>
                <CardDescription className="text-slate-400">
                  {stats.totalUsers} usuarios registrados • {stats.activeUsers} activos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Usuario</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Plan</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Créditos</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Registro</th>
                        <th className="text-right py-3 px-4 text-slate-400 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-slate-900">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white">{user.name}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getPlanBadge(user.plan)}>
                              {user.plan}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{user.credits}</td>
                          <td className="py-3 px-4 text-slate-400">{user.joined}</td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Ingresos Mensuales</CardTitle>
                  <CardDescription className="text-slate-400">Últimos 5 meses en ARS</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueData.map((item, i) => (
                      <div key={item.month} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">{item.month}</span>
                          <span className="text-white font-medium">${(item.revenue / 1000000).toFixed(2)}M</span>
                        </div>
                        <Progress 
                          value={(item.revenue / revenueData[revenueData.length - 1].revenue) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Distribución de Planes</CardTitle>
                  <CardDescription className="text-slate-400">Usuarios por tipo de plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Gratis</span>
                        <span className="text-white font-medium">1,060 usuarios (85%)</span>
                      </div>
                      <Progress value={85} className="h-2 bg-slate-700 [&>div]:bg-slate-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Pro</span>
                        <span className="text-white font-medium">157 usuarios (12.6%)</span>
                      </div>
                      <Progress value={12.6} className="h-2 bg-slate-700 [&>div]:bg-emerald-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Empresa</span>
                        <span className="text-white font-medium">30 usuarios (2.4%)</span>
                      </div>
                      <Progress value={2.4} className="h-2 bg-slate-700 [&>div]:bg-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Registro de Actividad</CardTitle>
                <CardDescription className="text-slate-400">Todas las acciones en la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...recentActivity, ...recentActivity].map((activity, i) => (
                    <div key={`${activity.id}-${i}`} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white">{activity.detail}</p>
                        <p className="text-sm text-slate-500">{activity.user}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="border-slate-600 text-slate-400">
                          {activity.type}
                        </Badge>
                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
