import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Bell, Globe, Palette, User, Shield, Trash2, Wifi } from "lucide-react";
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
  const [offlineSchedule, setOfflineSchedule] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('offlineSchedule') === 'true';
    }
    return false;
  });
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
  return <div className="min-h-screen pb-20 px-4 pt-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate("/profile")} className="p-2 rounded-lg hover:bg-surface-elevated transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Настройки</h1>
        </div>

        <div className="space-y-6">
          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette size={20} />
                Внешний вид
              </CardTitle>
              <CardDescription>
                Настройте тему и оформление приложения
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-surface-elevated">
                    {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                  </div>
                  <div>
                    <p className="font-medium">Темная тема</p>
                    <p className="text-sm text-text-muted">Переключение между светлой и темной темой</p>
                  </div>
                </div>
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Offline Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi size={20} />
                Оффлайн режим
              </CardTitle>
              <CardDescription>
                Доступ к расписанию без интернета
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-surface-elevated">
                    <Wifi size={16} />
                  </div>
                  <div>
                    <p className="font-medium">Расписание оффлайн</p>
                    <p className="text-sm text-text-muted">Сохранить расписание для оффлайн доступа</p>
                  </div>
                </div>
                <Switch 
                  checked={offlineSchedule} 
                  onCheckedChange={(checked) => {
                    setOfflineSchedule(checked);
                    localStorage.setItem('offlineSchedule', String(checked));
                    if (checked) {
                      toast({
                        title: "Успешно",
                        description: "Расписание сохранено для оффлайн режима"
                      });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}