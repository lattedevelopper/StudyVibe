import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, Trophy, BookOpen, BarChart3, Calendar, Shield, LogOut } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  full_name: string | null;
  class_name: string | null;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadProfile();
    loadStats();
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    
    setProfile(data);
  };

  const loadStats = async () => {
    if (!user) return;
    
    const { data: totalHomework } = await supabase
      .from("homework")
      .select("id");
    
    const { data: completedSubmissions } = await supabase
      .from("homework_submissions")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_completed", true);
    
    setStats({
      total: totalHomework?.length || 0,
      completed: completedSubmissions?.length || 0
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Выход выполнен",
      description: "До свидания!"
    });
    navigate("/login");
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Профиль</h1>
        
        {/* User Info */}
        <div className="homework-card mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <User size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {profile?.full_name || user?.email || "Пользователь"}
              </h2>
              <p className="text-text-muted">
                {profile?.class_name ? `${profile.class_name} класс` : "Класс не указан"}
              </p>
            </div>
            <CustomButton
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2"
            >
              <Shield size={20} />
              Админ панель
            </CustomButton>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="homework-card text-center">
            <BarChart3 size={32} className="text-primary mx-auto mb-3" />
            <h3 className="font-bold text-lg">{stats.completed}</h3>
            <p className="text-text-muted text-sm">Выполнено заданий</p>
          </div>
          <div className="homework-card text-center">
            <Calendar size={32} className="text-primary mx-auto mb-3" />
            <h3 className="font-bold text-lg">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </h3>
            <p className="text-text-muted text-sm">Успеваемость</p>
          </div>
        </div>

        {/* Achievements */}
        <div className="homework-card mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Trophy size={20} />
            Достижения
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-surface-elevated rounded-lg">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-lg">🏆</span>
              </div>
              <div>
                <h4 className="font-semibold">Отличник недели</h4>
                <p className="text-sm text-text-muted">Выполнили все задания вовремя</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="homework-card">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Settings size={20} />
            Настройки
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg hover:bg-surface-elevated transition-colors">
              Уведомления
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-surface-elevated transition-colors">
              Темная тема
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-surface-elevated transition-colors">
              О приложении
            </button>
            <button 
              onClick={handleSignOut}
              className="w-full text-left p-3 rounded-lg hover:bg-surface-elevated transition-colors text-destructive flex items-center gap-2"
            >
              <LogOut size={16} />
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}