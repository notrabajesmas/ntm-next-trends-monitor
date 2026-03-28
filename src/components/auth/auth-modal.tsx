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
  
  // Form states
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Paddle Price IDs
  const PADDLE_PRICES = {
    pro: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || "pri_01km5a0xnesah58qp21ekn4xrr",
    enterprise: process.env.NEXT_PUBLIC_PADDLE_ENTERPRISE_PRICE_ID || "pri_01km5a65d2t8jy65s00qkscpa1"
  };
  
  const plans = {
    free: { price: 0, name: "Free", credits: 3, paddleId: null },
    pro: { price: 29, name: "Pro", credits: 100, paddleId: PADDLE_PRICES.pro },
    enterprise: { price: 99, name: "Enterprise", credits: -1, paddleId: PADDLE_PRICES.enterprise }
  };

  const handleRegister = async () => {
    if (!registerData.email || !registerData.password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
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
        toast({
          title: "¡Cuenta creada!",
          description: "Tu cuenta ha sido creada exitosamente"
        });
        
        // Si es plan de pago, ir al paso de pago
        if (selectedPlan !== "free") {
          setPaymentStep(true);
        } else {
          onOpenChange(false);
          onAuthSuccess?.();
          // Recargar para actualizar sesión
          router.refresh();
          setTimeout(() => window.location.reload(), 500);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al registrar",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Importante para cookies
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "¡Bienvenido!",
          description: `Has iniciado sesión como ${data.user.email}`
        });
        
        onOpenChange(false);
        onAuthSuccess?.();
        
        // Recargar página para actualizar sesión
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al iniciar sesión",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const handlePayment = async () => {
    setIsLoading(true);

    // Abrir checkout de Paddle
    const paddleUrl = `https://buy.paddle.com/checkout/${plans[selectedPlan as keyof typeof plans].paddleId}`;
    
    toast({
      title: "Redirigiendo a Paddle...",
      description: "Serás redirigido al checkout seguro"
    });

    // Redirigir a Paddle
    window.open(paddleUrl, '_blank');
    
    setIsLoading(false);
    onOpenChange(false);
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
                {activeTab === "register" 
                  ? "Únete a NTM y comienza a descubrir oportunidades"
                  : "Accede a tu cuenta para continuar"}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="register" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-slate-300">
                    <User className="w-4 h-4 inline mr-2" />
                    Nombre
                  </Label>
                  <Input
                    id="register-name"
                    placeholder="Tu nombre"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-slate-300">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-slate-300">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Contraseña
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <Button 
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Crear Cuenta {selectedPlan !== "free" && "& continuar"}
                </Button>
              </TabsContent>

              <TabsContent value="login" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-slate-300">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="bg-slate-800 border-slate-600 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-slate-300">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Contraseña
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Tu contraseña"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="bg-slate-800 border-slate-600 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                <Button 
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Iniciar Sesión
                </Button>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          // Payment Step
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-emerald-400" />
                Completar Pago
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Estás por activar tu plan
              </DialogDescription>
            </DialogHeader>

            <Card className="mt-4 bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Plan {selectedPlanData.name}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {selectedPlanData.credits === -1 
                        ? "Análisis ilimitados" 
                        : `${selectedPlanData.credits} análisis por mes`}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      ${selectedPlanData.price}
                    </div>
                    <div className="text-sm text-slate-400">USD/mes</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Pago seguro con Paddle
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Cancelar cuando quieras
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Facturación automática
                  </div>
                </div>

                <Button 
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Pagar con Paddle
                </Button>

                <p className="text-xs text-slate-500 text-center mt-4">
                  Al continuar, aceptas nuestros términos y condiciones
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-2">
              <Badge variant="outline" className="text-slate-400 border-slate-600">
                <Globe className="w-3 h-3 mr-1" />
                Pagos globales procesados
              </Badge>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
