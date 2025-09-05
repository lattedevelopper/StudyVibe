import { useState, useEffect } from "react";
import { User, Settings, LogOut, Shield } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";


interface UserProfile {
  id: string;
  full_name: string | null;
  class_name: string | null;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadProfile();
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Профиль</h1>

        <div className="homework-card mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <User size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {profile?.full_name || user.email || "Пользователь"}
              </h2>
              <p className="text-text-muted">
                {profile?.class_name || "Класс не указан"}
              </p>
              <p className="text-sm text-text-muted">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <CustomButton
              className="w-full flex items-center gap-2 border border-border bg-surface-elevated hover:bg-surface"
              onClick={() => navigate("/settings")}
            >
              <Settings size={20} />
              Настройки
            </CustomButton>

            <CustomButton
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-2 border border-border bg-surface-elevated hover:bg-surface"
            >
              <Shield size={20} />
              Админ панель
            </CustomButton>

            <CustomButton
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 border border-border bg-surface-elevated hover:bg-surface"
            >
              <LogOut size={20} />
              Выйти из аккаунта
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}
