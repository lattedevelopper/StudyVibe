import { useState, useEffect } from "react";
import { User, Settings, LogOut, Shield } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { AboutAppDialog } from "@/components/profile/about-app-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// ----- Компонент меню настроек -----
interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/50" 
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 w-80 h-full bg-background border-l border-border shadow-xl z-50 p-6">
        <h2 className="text-xl font-bold mb-6">Настройки</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Тема</label>
            <select className="w-full border border-border rounded-lg px-3 py-2 bg-background">
              <option>Светлая</option>
              <option>Тёмная</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Уведомления</label>
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Включить уведомления</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Язык</label>
            <select className="w-full border border-border rounded-lg px-3 py-2 bg-background">
              <option>Русский</option>
              <option>English</option>
            </select>
          </div>
        </div>
        <CustomButton 
          className="mt-8 w-full" 
          onClick={onClose}
        >
          Закрыть
        </CustomButton>
      </div>
    </>
  );
};
// ----- конец компонента меню -----

interface UserProfile {
  id: string;
  full_name: string | null;
  class_name: string | null;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
      <SettingsMenu isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

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
              onClick={() => setSettingsOpen(true)}
            >
              <Settings size={20} />
              Настройки
            </CustomButton>

            <AboutAppDialog />

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
