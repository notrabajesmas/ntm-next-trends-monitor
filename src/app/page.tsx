"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Search,
  TrendingUp,
  Shield,
  FileText,
  Zap,
  BarChart3,
  Globe,
  Sparkles,
  ChevronRight,
  Lock,
  Settings,
  Languages,
  Menu,
  X,
  Sun,
  Moon,
  LayoutDashboard
} from "lucide-react";
import { BusinessScanner } from "@/components/tools/business-scanner";
import { TrendsHunter } from "@/components/tools/trends-hunter";
import { DigitalAuditor } from "@/components/tools/digital-auditor";
import { ReportsGenerator } from "@/components/tools/reports-generator";
import { AuthModal } from "@/components/auth/auth-modal";
import { AdminPanel } from "@/components/admin/admin-panel";
import { UserStatus } from "@/components/auth/user-status";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { NotificationProvider, NotificationPanel } from "@/components/notifications/notification-provider";

// Translations
const translations = {
  en: {
    tagline: "Your complete digital analysis toolkit",
    poweredByAI: "Powered by AI",
    pricing: "Pricing",
    login: "Log In",
    getStarted: "Get Started Free",
    heroTitle: "Discover opportunities",
    heroHighlight: "others miss",
    heroDesc: "Find businesses without digital presence, detect trends before anyone else, and generate professional reports automatically.",
    feature1: "100% Automated",
    feature2: "Analysis in seconds",
    feature3: "Global data",
    feature4: "PDF Reports",
    startFree: "Start Free →",
    tool1: "Scanner",
    tool2: "Trends",
    tool3: "Auditor",
    tool4: "Reports",
    stats1: "Businesses analyzed",
    stats2: "Trends detected",
    stats3: "Reports generated",
    stats4: "Satisfaction",
    pricingTitle: "Simple plans, powerful results",
    pricingSubtitle: "Start free, scale when you need",
    free: "Free",
    freeDesc: "To try the platform",
    freeFeature1: "3 analyses per month",
    freeFeature2: "Basic results",
    freeFeature3: "No PDF reports",
    freeCTA: "Start Free",
    pro: "Pro",
    popular: "Most Popular",
    proDesc: "For professionals and agencies",
    proFeature1: "100 analyses per month",
    proFeature2: "Deep AI analysis",
    proFeature3: "Unlimited PDF reports",
    proFeature4: "Export to CSV",
    proCTA: "Get Pro",
    enterprise: "Enterprise",
    enterpriseDesc: "For large teams",
    enterpriseFeature1: "Unlimited analyses",
    enterpriseFeature2: "API access",
    enterpriseFeature3: "Priority support",
    enterpriseFeature4: "White-label available",
    enterpriseCTA: "Contact Sales",
    perMonth: "/month",
    securePayments: "Secure payments with Paddle",
    footer: "© 2024 Next Trends Monitor",
    terms: "Terms",
    privacy: "Privacy",
    apiDocs: "API Docs",
    backToSite: "← Back to site"
  },
  es: {
    tagline: "Tu kit completo de análisis digital",
    poweredByAI: "Potenciado por IA",
    pricing: "Precios",
    login: "Iniciar Sesión",
    getStarted: "Comenzar Gratis",
    heroTitle: "Descubre oportunidades que",
    heroHighlight: "otros no ven",
    heroDesc: "Encuentra negocios sin presencia digital, detecta tendencias antes que nadie y genera reportes profesionales automáticamente.",
    feature1: "100% Automatizado",
    feature2: "Análisis en segundos",
    feature3: "Datos globales",
    feature4: "Reportes PDF",
    startFree: "Comenzar Gratis →",
    tool1: "Scanner",
    tool2: "Tendencias",
    tool3: "Auditor",
    tool4: "Reportes",
    stats1: "Negocios analizados",
    stats2: "Tendencias detectadas",
    stats3: "Reportes generados",
    stats4: "Satisfacción",
    pricingTitle: "Planes simples, resultados poderosos",
    pricingSubtitle: "Comienza gratis, escala cuando lo necesites",
    free: "Gratis",
    freeDesc: "Para probar la plataforma",
    freeFeature1: "3 análisis por mes",
    freeFeature2: "Resultados básicos",
    freeFeature3: "Sin reportes PDF",
    freeCTA: "Empezar Gratis",
    pro: "Pro",
    popular: "Más Popular",
    proDesc: "Para profesionales y agencias",
    proFeature1: "100 análisis por mes",
    proFeature2: "Análisis IA profundo",
    proFeature3: "Reportes PDF ilimitados",
    proFeature4: "Exportar datos CSV",
    proCTA: "Obtener Pro",
    enterprise: "Empresa",
    enterpriseDesc: "Para equipos grandes",
    enterpriseFeature1: "Análisis ilimitados",
    enterpriseFeature2: "Acceso API",
    enterpriseFeature3: "Soporte prioritario",
    enterpriseFeature4: "White-label disponible",
    enterpriseCTA: "Contactar Ventas",
    perMonth: "/mes",
    securePayments: "Pagos seguros con Paddle",
    footer: "© 2024 Next Trends Monitor",
    terms: "Términos",
    privacy: "Privacidad",
    apiDocs: "API Docs",
    backToSite: "← Volver al sitio"
  },
  pt: {
    tagline: "Seu kit completo de análise digital",
    poweredByAI: "Powered by AI",
    pricing: "Preços",
    login: "Entrar",
    getStarted: "Começar Grátis",
    heroTitle: "Descubra oportunidades que",
    heroHighlight: "outros não veem",
    heroDesc: "Encontre negócios sem presença digital, detecte tendências antes de todos e gere relatórios profissionais automaticamente.",
    feature1: "100% Automatizado",
    feature2: "Análise em segundos",
    feature3: "Dados globais",
    feature4: "Relatórios PDF",
    startFree: "Começar Grátis →",
    tool1: "Scanner",
    tool2: "Tendências",
    tool3: "Auditor",
    tool4: "Relatórios",
    stats1: "Negócios analisados",
    stats2: "Tendências detectadas",
    stats3: "Relatórios gerados",
    stats4: "Satisfação",
    pricingTitle: "Planos simples, resultados poderosos",
    pricingSubtitle: "Comece grátis, escale quando precisar",
    free: "Grátis",
    freeDesc: "Para testar a plataforma",
    freeFeature1: "3 análises por mês",
    freeFeature2: "Resultados básicos",
    freeFeature3: "Sem relatórios PDF",
    freeCTA: "Começar Grátis",
    pro: "Pro",
    popular: "Mais Popular",
    proDesc: "Para profissionais e agências",
    proFeature1: "100 análises por mês",
    proFeature2: "Análise IA profunda",
    proFeature3: "Relatórios PDF ilimitados",
    proFeature4: "Exportar para CSV",
    proCTA: "Obter Pro",
    enterprise: "Empresa",
    enterpriseDesc: "Para grandes equipes",
    enterpriseFeature1: "Análises ilimitadas",
    enterpriseFeature2: "Acesso API",
    enterpriseFeature3: "Suporte prioritário",
    enterpriseFeature4: "White-label disponível",
    enterpriseCTA: "Contatar Vendas",
    perMonth: "/mês",
    securePayments: "Pagamentos seguros com Paddle",
    footer: "© 2024 Next Trends Monitor",
    terms: "Termos",
    privacy: "Privacidade",
    apiDocs: "API Docs",
    backToSite: "← Voltar ao site"
  }
};

const languageFlags: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  pt: "🇧🇷"
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("scanner");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [locale, setLocale] = useState<"en" | "es" | "pt">("es");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Inicializar tema desde localStorage (lazy initialization)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ntm_theme') as 'dark' | 'light' | null;
      if (saved) {
        document.documentElement.classList.toggle('light', saved === 'light');
        return saved;
      }
    }
    return 'dark';
  });

  // Estado para conectar Scanner con Auditor
  const [auditBusinessName, setAuditBusinessName] = useState<string | undefined>();
  const [auditWebsite, setAuditWebsite] = useState<string | undefined>();

  const t = translations[locale];

  // Toggle tema
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('ntm_theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  // Change language and save to cookie
  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale as "en" | "es" | "pt");
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
  };

  // Función para ir a auditar un negocio desde el Scanner
  const handleAuditBusiness = (businessName: string, website?: string) => {
    setAuditBusinessName(businessName);
    setAuditWebsite(website);
    setActiveTab("auditor");
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  // Si showAdmin está activo, mostrar el panel de administración
  if (showAdmin) {
    return (
      <NotificationProvider>
        <div className={theme === 'light' ? 'light' : ''}>
          <Button
            onClick={() => setShowAdmin(false)}
            className="fixed top-4 right-4 z-50 bg-slate-700 hover:bg-slate-600"
          >
            {t.backToSite}
          </Button>
          <AdminPanel />
        </div>
      </NotificationProvider>
    );
  }

  return (
    <NotificationProvider>
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-gradient-to-br from-gray-50 via-white to-gray-100' 
          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
      }`}>
        {/* Auth Modal */}
        <AuthModal
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
          selectedPlan={selectedPlan}
        />

        {/* Header */}
        <header className={`border-b backdrop-blur-sm sticky top-0 z-50 ${
          theme === 'light' 
            ? 'border-gray-200 bg-white/80' 
            : 'border-slate-700/50 bg-slate-900/80'
        }`}>
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-2 sm:gap-3">
                <img
                  src="/icon-192x192.png"
                  alt="NTM Logo"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg"
                />
                <div className="hidden sm:block">
                  <h1 className={`text-lg sm:text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>NTM</h1>
                  <p className={`text-xs hidden md:block ${theme === 'light' ? 'text-gray-500' : 'text-slate-400'}`}>{t.tagline}</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-3">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-slate-400 hover:text-white'}
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>

                {/* Language Selector */}
                <Select value={locale} onValueChange={handleLocaleChange}>
                  <SelectTrigger className={`w-[120px] ${theme === 'light' ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-slate-800 border-slate-600 text-white'}`}>
                    <Languages className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-600'}>
                    <SelectItem value="en">{languageFlags.en} English</SelectItem>
                    <SelectItem value="es">{languageFlags.es} Español</SelectItem>
                    <SelectItem value="pt">{languageFlags.pt} Português</SelectItem>
                  </SelectContent>
                </Select>

                {/* Dashboard Button */}
                <Button
                  variant="ghost"
                  className={theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-slate-300 hover:text-white'}
                  onClick={() => setShowDashboard(!showDashboard)}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>

              <Button
                variant="ghost"
                className={theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-slate-300 hover:text-white'}
                onClick={() => {
                  const el = document.getElementById("precios");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t.pricing}
              </Button>

              {/* Notification Panel */}
              <NotificationPanel />

              {/* User Status - Login/Logout */}
              <UserStatus />
            </nav>

            {/* Mobile: Language + Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              {/* Mobile Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className={theme === 'light' ? 'text-gray-600' : 'text-white p-2'}
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Select value={locale} onValueChange={handleLocaleChange}>
                <SelectTrigger className={`w-[70px] text-sm ${theme === 'light' ? 'bg-gray-100 border-gray-200 text-gray-900' : 'bg-slate-800 border-slate-600 text-white'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-600'}>
                  <SelectItem value="en">{languageFlags.en}</SelectItem>
                  <SelectItem value="es">{languageFlags.es}</SelectItem>
                  <SelectItem value="pt">{languageFlags.pt}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className={theme === 'light' ? 'text-gray-900 p-2' : 'text-white p-2'}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className={`md:hidden mt-4 pb-4 pt-4 border-t ${theme === 'light' ? 'border-gray-200' : 'border-slate-700/50'}`}>
              <div className="flex flex-col gap-3">
                <Button
                  variant="ghost"
                  className={`justify-start ${theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-slate-300 hover:text-white'}`}
                  onClick={() => setShowDashboard(!showDashboard)}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className={`justify-start ${theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-slate-300 hover:text-white'}`}
                  onClick={() => {
                    const el = document.getElementById("precios");
                    el?.scrollIntoView({ behavior: "smooth" });
                    setMobileMenuOpen(false);
                  }}
                >
                  {t.pricing}
                </Button>
                <Button
                  variant="ghost"
                  className={`justify-start ${theme === 'light' ? 'text-gray-600 hover:text-gray-900' : 'text-slate-300 hover:text-white'}`}
                  onClick={() => {
                    setShowAdmin(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
                <Button
                  variant="outline"
                  className={`justify-start ${theme === 'light' ? 'border-gray-200 text-gray-600' : 'border-slate-600 text-slate-300'}`}
                  onClick={() => {
                    setSelectedPlan("free");
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  {t.login}
                </Button>
                <Button
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
                  onClick={() => handlePlanSelect("pro")}
                >
                  {t.getStarted}
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Dashboard Modal/Panel */}
      {showDashboard && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl m-4 ${
            theme === 'light' ? 'bg-white' : 'bg-slate-900'
          }`}>
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-slate-700/50 bg-inherit">
              <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Mi Dashboard</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowDashboard(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              <UserDashboard />
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-10 sm:py-16 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-3 sm:mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs sm:text-sm">
            <Sparkles className="w-3 h-3 mr-1" />
            {t.poweredByAI}
          </Badge>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
            {t.heroTitle}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {t.heroHighlight}
            </span>
          </h2>
          <p className={`text-base sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8 px-4 ${theme === 'light' ? 'text-gray-600' : 'text-slate-400'}`}>
            {t.heroDesc}
          </p>

          {/* Features - Scrollable on mobile */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-2">
            <div className={`flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base px-3 py-1.5 rounded-full ${theme === 'light' ? 'text-gray-600 bg-gray-100' : 'text-slate-400 bg-slate-800/50'}`}>
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span>{t.feature1}</span>
            </div>
            <div className={`flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base px-3 py-1.5 rounded-full ${theme === 'light' ? 'text-gray-600 bg-gray-100' : 'text-slate-400 bg-slate-800/50'}`}>
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span>{t.feature2}</span>
            </div>
            <div className={`flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base px-3 py-1.5 rounded-full ${theme === 'light' ? 'text-gray-600 bg-gray-100' : 'text-slate-400 bg-slate-800/50'}`}>
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span>{t.feature3}</span>
            </div>
            <div className={`flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base px-3 py-1.5 rounded-full ${theme === 'light' ? 'text-gray-600 bg-gray-100' : 'text-slate-400 bg-slate-800/50'}`}>
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span>{t.feature4}</span>
            </div>
          </div>

          <Button
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-base sm:text-lg px-6 sm:px-8"
            onClick={() => handlePlanSelect("free")}
          >
            {t.startFree}
          </Button>
        </div>
      </section>

      {/* Main Tools Section */}
      <section className="px-2 sm:px-4 pb-12 sm:pb-16">
        <div className="container mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full grid-cols-4 border mb-4 sm:mb-8 h-auto p-1 gap-1 ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <TabsTrigger
                value="scanner"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white py-2 sm:py-3 text-xs sm:text-sm px-1 sm:px-3"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t.tool1}</span>
              </TabsTrigger>
              <TabsTrigger
                value="trends"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white py-2 sm:py-3 text-xs sm:text-sm px-1 sm:px-3"
              >
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t.tool2}</span>
              </TabsTrigger>
              <TabsTrigger
                value="auditor"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white py-2 sm:py-3 text-xs sm:text-sm px-1 sm:px-3"
              >
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t.tool3}</span>
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white py-2 sm:py-3 text-xs sm:text-sm px-1 sm:px-3"
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t.tool4}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scanner" className="mt-0">
              <BusinessScanner onAuditBusiness={handleAuditBusiness} />
            </TabsContent>

            <TabsContent value="trends" className="mt-0">
              <TrendsHunter />
            </TabsContent>

            <TabsContent value="auditor" className="mt-0">
              <DigitalAuditor
                key={auditBusinessName || 'default'}
                initialBusinessName={auditBusinessName}
                initialWebsite={auditWebsite}
              />
            </TabsContent>

            <TabsContent value="reports" className="mt-0">
              <ReportsGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-10 sm:py-16 px-4 border-t ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-slate-800/30 border-slate-700/50'}`}>
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center p-3 sm:p-0">
              <div className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>10K+</div>
              <div className={`text-xs sm:text-sm md:text-base ${theme === 'light' ? 'text-gray-600' : 'text-slate-400'}`}>{t.stats1}</div>
            </div>
            <div className="text-center p-3 sm:p-0">
              <div className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>500+</div>
              <div className={`text-xs sm:text-sm md:text-base ${theme === 'light' ? 'text-gray-600' : 'text-slate-400'}`}>{t.stats2}</div>
            </div>
            <div className="text-center p-3 sm:p-0">
              <div className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>2K+</div>
              <div className={`text-xs sm:text-sm md:text-base ${theme === 'light' ? 'text-gray-600' : 'text-slate-400'}`}>{t.stats3}</div>
            </div>
            <div className="text-center p-3 sm:p-0">
              <div className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>98%</div>
              <div className={`text-xs sm:text-sm md:text-base ${theme === 'light' ? 'text-gray-600' : 'text-slate-400'}`}>{t.stats4}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-10 sm:py-16 px-4" id="precios">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">{t.pricingTitle}</h3>
            <p className="text-sm sm:text-base text-slate-400">{t.pricingSubtitle}</p>
            <Badge className="mt-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs sm:text-sm">
              🌍 Global Pricing in USD
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-white text-lg sm:text-xl">{t.free}</CardTitle>
                <CardDescription className="text-slate-400 text-sm">{t.freeDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
                  $0<span className="text-base sm:text-lg text-slate-400">{t.perMonth}</span>
                </div>
                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm sm:text-base">
                  <li className="flex items-center gap-2 text-slate-300">
                    <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {t.freeFeature1}
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {t.freeFeature2}
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {t.freeFeature3}
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 text-sm sm:text-base"
                  onClick={() => handlePlanSelect("free")}
                >
                  {t.freeCTA}
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-gradient-to-b from-emerald-500/10 to-cyan-500/10 border-emerald-500/30 relative sm:scale-105">
              <Badge className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs">
                {t.popular}
              </Badge>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-white text-lg sm:text-xl">{t.pro}</CardTitle>
                <CardDescription className="text-slate-400 text-sm">{t.proDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
                  $29<span className="text-base sm:text-lg text-slate-400">{t.perMonth}</span>
                </div>
                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm sm:text-base">
                  <li className="flex items-center gap-2 text-slate-300">
                    <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {t.proFeature1}
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {t.proFeature2}
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {t.proFeature3}
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {t.proFeature4}
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm sm:text-base"
                  onClick={() => handlePlanSelect("pro")}
                >
                  {t.proCTA}
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-slate-800/50 border-slate-700/50 sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-white text-lg sm:text-xl">{t.enterprise}</CardTitle>
                <CardDescription className="text-slate-400 text-sm">{t.enterpriseDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
                  $99<span className="text-base sm:text-lg text-slate-400">{t.perMonth}</span>
                </div>
                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm sm:text-base">
                  <li className="flex items-center gap-2 text-slate-300">
                    <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {t.enterpriseFeature1}
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {t.enterpriseFeature2}
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {t.enterpriseFeature3}
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {t.enterpriseFeature4}
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 text-sm sm:text-base"
                  onClick={() => handlePlanSelect("enterprise")}
                >
                  {t.enterpriseCTA}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Payment Info */}
          <div className="mt-6 sm:mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {t.securePayments}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-6 sm:py-8 px-4 border-t ${theme === 'light' ? 'border-gray-200 bg-white/80' : 'border-slate-700/50 bg-slate-900/80'}`}>
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/icon-192x192.png"
                alt="NTM Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg"
              />
              <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-slate-400'}`}>{t.footer}</span>
            </div>
            <div className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm ${theme === 'light' ? 'text-gray-600' : 'text-slate-400'}`}>
              <a href="/terms" className={`transition-colors ${theme === 'light' ? 'hover:text-gray-900' : 'hover:text-white'}`}>{t.terms}</a>
              <a href="/privacy" className={`transition-colors ${theme === 'light' ? 'hover:text-gray-900' : 'hover:text-white'}`}>{t.privacy}</a>
              <a href="/api/v1/scanner" className={`transition-colors ${theme === 'light' ? 'hover:text-gray-900' : 'hover:text-white'}`}>{t.apiDocs}</a>
              <button
                onClick={() => setShowAdmin(true)}
                className={`transition-colors ${theme === 'light' ? 'hover:text-gray-900' : 'hover:text-white'}`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </NotificationProvider>
  );
}
