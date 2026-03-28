"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  CheckCircle,
  ArrowRight,
  CreditCard,
  Globe
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan?: string;
  onAuthSuccess?: () => void;
}

export function AuthModal({ open, onOpenChange, selectedPlan = "pro", onAuthSuccess }: AuthModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [paymentStep, setPaymentStep] = useState(false);
  
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const PADDLE_PRICES = {
    pro: "pri_01km5a0xnesah58qp21ekn4xrr",
    enterprise: "pri_01km5a65d2t8jy65s00qkscpa1"
  };
  
  const plans = {
    free: { price: 0, name: "Free", credits: 3, paddleId: null },
    pro: { price: 29, name: "Pro", credits: 100, paddleId: PADDLE_PRICES.pro },
    enterprise: { price: 99, name: "Enterprise", credits: -1, paddleId: PADDLE_PRICES.enterprise }
  };

  const handleRegister = async () => {
    if (!registerData.email || !registerData.password) {
      toast({ title: "Error", description: "Completa todos los campos", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: "¡Cuenta creada!", description: "Tu cuenta ha sido creada" });
        
        if (selectedPlan !== "free") {
          setPaymentStep(true);
        } else {
          onOpenChange(false);
          onAuthSuccess?.();
          setTimeout(() => window.location.reload(), 300);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }

    setIsLoading(false);
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast({ title: "Error", description: "Completa todos los campos", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: "¡Bienvenido!", description: `Sesión iniciada como ${data.user.email}` });
        onOpenChange(false);
        onAuthSuccess?.();
        setTimeout(() => window.location.reload(), 300);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }

    setIsLoading(false);
  };

  const handlePayment = () => {
    setIsLoading(true);
    const paddleUrl = `https://buy.paddle.com/checkout/${plans[selectedPlan as keyof typeof plans].paddleId}`;
    window.open(paddleUrl, '_blank');
    setIsLoading(false);
    onOpenChange(false);
    
    toast({ title: "Completa el pago en Paddle", description: "Tu plan se activará automáticamente" });
  };

  const selectedPlanData = plans[selectedPlan as keyof typeof plans];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700 text-white">
        {!paymentStep ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {activeTab === "register" ? "Crear Cuenta" : "Iniciar Sesión"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {activeTab === "register" ? "Únete a NTM" : "Accede a tu cuenta"}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="register" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-slate-300"><User className="w-4 h-4 inline mr-2" />Nombre</Label>
                  <Input
                    placeholder="Tu nombre"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300"><Mail className="w-4 h-4 inline mr-2" />Email</Label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300"><Lock className="w-4 h-4 inline mr-2" />Contraseña</Label>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <Button onClick={handleRegister} disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  Crear Cuenta
                </Button>
              </TabsContent>

              <TabsContent value="login" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-slate-300"><Mail className="w-4 h-4 inline mr-2" />Email</Label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300"><Lock className="w-4 h-4 inline mr-2" />Contraseña</Label>
                  <Input
                    type="password"
                    placeholder="Tu contraseña"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <Button onClick={handleLogin} disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  Iniciar Sesión
                </Button>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-emerald-400" />
                Completar Pago
              </DialogTitle>
            </DialogHeader>

            <Card className="mt-4 bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Plan {selectedPlanData.name}</CardTitle>
                    <CardDescription>{selectedPlanData.credits === -1 ? "Ilimitado" : `${selectedPlanData.credits} análisis/mes`}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${selectedPlanData.price}</div>
                    <div className="text-sm text-slate-400">USD/mes</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-slate-300"><CheckCircle className="w-4 h-4 text-emerald-400" />Pago seguro con Paddle</div>
                  <div className="flex items-center gap-2 text-slate-300"><CheckCircle className="w-4 h-4 text-emerald-400" />Cancelar cuando quieras</div>
                </div>
                <Button onClick={handlePayment} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                  Pagar con Paddle
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
