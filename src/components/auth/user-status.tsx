"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  LogOut, 
  Crown,
  Zap,
  Loader2
} from "lucide-react";
import { AuthModal } from "./auth-modal";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  planType: string;
  credits: number;
}

export function UserStatus() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  // Verificar sesión cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!authModalOpen) {
        checkSession();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [authModalOpen]);

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: 'include' // Importante para enviar cookies
      });
      const data = await response.json();
      
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Session check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: 'include'
      });
      setUser(null);
      // Recargar la página para limpiar cualquier estado
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    setAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:text-white hidden sm:flex"
            onClick={() => {
              setSelectedPlan("free");
              setAuthModalOpen(true);
            }}
          >
            Iniciar Sesión
          </Button>
          <Button 
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
            onClick={() => handlePlanSelect("pro")}
          >
            <Zap className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Comenzar Pro</span>
            <span className="sm:hidden">Pro</span>
          </Button>
        </div>
        
        <AuthModal 
          open={authModalOpen} 
          onOpenChange={setAuthModalOpen}
          selectedPlan={selectedPlan}
          onAuthSuccess={checkSession}
        />
      </>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Créditos */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-sm text-slate-300">
          {user.credits === -1 ? "∞" : user.credits} créditos
        </span>
      </div>

      {/* Plan Badge */}
      <Badge className={`
        ${user.planType === 'pro' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''}
        ${user.planType === 'enterprise' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : ''}
        ${user.planType === 'free' ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' : ''}
        hidden sm:flex
      `}>
        {user.planType === 'pro' && <Crown className="w-3 h-3 mr-1" />}
        {user.planType.toUpperCase()}
      </Badge>

      {/* User Info */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-white">
            {user.name || user.email.split('@')[0]}
          </p>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>
        <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center font-bold text-slate-900">
          {(user.name || user.email)[0].toUpperCase()}
        </div>
      </div>

      {/* Logout Button - Más visible */}
      <Button 
        variant="outline" 
        size="sm"
        className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/50"
        onClick={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
        <span className="hidden sm:inline ml-1">Salir</span>
      </Button>
    </div>
  );
}
