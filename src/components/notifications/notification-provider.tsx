"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  CreditCard,
  TrendingUp,
  Settings
} from "lucide-react";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "credit" | "analysis" | "payment";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  // Inicializar notificaciones desde localStorage (lazy initialization)
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("ntm_notifications");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.map((n: Notification) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }));
        } catch {
          // Ignorar errores
        }
      }
    }
    return [];
  });

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });

  // Guardar notificaciones cuando cambian
  useEffect(() => {
    localStorage.setItem("ntm_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50));

    // Enviar notificación del navegador si tenemos permiso
    if (permission === "granted" && document.hidden) {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/icon-192x192.png",
        tag: newNotification.id
      });
    }
  }, [permission]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        requestPermission
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

// Componente del panel de notificaciones
export function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    requestPermission
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success": return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "info": return <Info className="w-4 h-4 text-blue-400" />;
      case "credit": return <Zap className="w-4 h-4 text-yellow-400" />;
      case "analysis": return <TrendingUp className="w-4 h-4 text-purple-400" />;
      case "payment": return <CreditCard className="w-4 h-4 text-emerald-400" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-slate-400 hover:text-white relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-slate-700">
            <h3 className="font-semibold text-white">Notificaciones</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-400 hover:text-white h-7"
                  onClick={markAllAsRead}
                >
                  Marcar todas
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-400 hover:text-white h-7"
                onClick={clearAll}
              >
                Limpiar
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer ${
                    !notification.read ? "bg-slate-700/20" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-white text-sm">
                          {notification.title}
                        </p>
                        <button
                          className="text-slate-500 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500">
                          {formatTime(notification.timestamp)}
                        </span>
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="text-xs text-emerald-400 hover:underline"
                          >
                            {notification.actionLabel || "Ver más"}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Enable Push Notifications */}
          {"Notification" in window && Notification.permission !== "granted" && (
            <div className="p-3 border-t border-slate-700 bg-slate-700/30">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-slate-600 text-slate-300"
                onClick={requestPermission}
              >
                <Settings className="w-4 h-4 mr-2" />
                Activar notificaciones push
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
