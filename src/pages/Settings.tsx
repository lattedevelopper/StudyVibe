import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Bell, Globe, Palette, User, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
export default function Settings() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("ru");
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  const clearNotifications = async () => {
    if (!user) return;
    try {
      const {
        error
      } = await supabase.from("notifications").update({
        is_read: true
      }).eq("user_id", user.id).eq("is_read", false);
      if (error) throw error;
      toast({
        title: "Успешно",
        description: "Все уведомления очищены"
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось очистить уведомления",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen pb-20 px-4 pt-8 bg-background">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/profile")} className="p-2.5 rounded-2xl hover:bg-surface-elevated transition-all active:scale-95">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Настройки
          </h1>
        </div>

        <div className="space-y-4">
          {/* Appearance Section */}
          <div className="homework-card">
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-xl font-bold mb-1">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Palette size={18} className="text-primary" />
                </div>
                Внешний вид
              </h2>
              <p className="text-sm text-text-muted ml-10">
                Настройте тему и оформление приложения
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    {theme === "dark" ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-primary" />}
                  </div>
                  <div>
                    <p className="font-semibold">Темная тема</p>
                    <p className="text-sm text-text-muted">Переключение между светлой и темной темой</p>
                  </div>
                </div>
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}