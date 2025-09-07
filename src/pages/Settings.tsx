import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Bell, Globe, Palette, User, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
                    <p className="font-medium">Тема оформления</p>
                    <p className="text-sm text-text-muted">Выберите светлую или тёмную тему</p>
                  </div>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Светлая</SelectItem>
                    <SelectItem value="dark">Тёмная</SelectItem>
                    <SelectItem value="system">Системная</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>


          {/* Save Button */}
          
        </div>
      </div>
    </div>;
}